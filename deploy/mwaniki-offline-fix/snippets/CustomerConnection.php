<?php
/**
 * AllxSys / phpNuxBill — live MikroTik connection status for Customers list.
 *
 * Upload to: system/autoload/CustomerConnection.php
 * (phpNuxBill autoloads system/autoload/*.php by class name)
 *
 * Online  = username (or pppoe_username) present in /ppp/active or /ip/hotspot/active
 * Offline = has active package (tbl_user_recharges.status=on) but no live session
 * Expired = no active package
 * Devices = number of live Hotspot/PPPoE sessions for that login (Hotspot multi-device OK)
 *
 * Does NOT change billing, Hotspot shared_users, or PPPoE secret provisioning.
 */

class CustomerConnection
{
    /** @var int Cache TTL for router session maps */
    const CACHE_TTL = 30;

    /**
     * Build map: login_name => session_count across all enabled routers.
     * Counts Hotspot active rows (multi-device) and PPPoE active rows.
     *
     * @return array<string,int>
     */
    public static function sessionCounts()
    {
        global $CACHE_PATH;
        $cacheDir = !empty($CACHE_PATH) ? rtrim($CACHE_PATH, '/\\') : 'system/cache';
        if (!is_dir($cacheDir)) {
            @mkdir($cacheDir, 0755, true);
        }
        $cacheFile = $cacheDir . '/customer_session_counts.json';

        if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < self::CACHE_TTL) {
            $cached = json_decode(@file_get_contents($cacheFile), true);
            if (is_array($cached)) {
                return $cached;
            }
        }

        $counts = [];
        if (!class_exists('PEAR2\\Net\\RouterOS\\Client', false)) {
            $autoload = 'system/autoload/PEAR2/Autoload.php';
            if (file_exists($autoload)) {
                require_once $autoload;
            }
        }

        try {
            $routers = ORM::for_table('tbl_routers')->where('enabled', '1')->find_many();
        } catch (Throwable $e) {
            return [];
        }

        foreach ($routers as $r) {
            try {
                $iport = explode(':', (string)$r['ip_address']);
                $port = !empty($iport[1]) ? (int)$iport[1] : 8728;
                $client = new PEAR2\Net\RouterOS\Client(
                    $iport[0],
                    $r['username'],
                    $r['password'],
                    $port,
                    false,
                    5
                );

                // PPPoE active sessions (one login = one session typically)
                $req = new PEAR2\Net\RouterOS\Request('/ppp/active/print');
                foreach ($client->sendSync($req) as $resp) {
                    if ($resp->getType() !== PEAR2\Net\RouterOS\Response::TYPE_DATA) {
                        continue;
                    }
                    $name = $resp->getProperty('name');
                    if ($name) {
                        $counts[$name] = isset($counts[$name]) ? $counts[$name] + 1 : 1;
                    }
                }

                // Hotspot active sessions (shared-users / multi-device = multiple rows)
                $req2 = new PEAR2\Net\RouterOS\Request('/ip/hotspot/active/print');
                foreach ($client->sendSync($req2) as $resp) {
                    if ($resp->getType() !== PEAR2\Net\RouterOS\Response::TYPE_DATA) {
                        continue;
                    }
                    $user = $resp->getProperty('user');
                    if ($user) {
                        $counts[$user] = isset($counts[$user]) ? $counts[$user] + 1 : 1;
                    }
                }
            } catch (Throwable $e) {
                // Router unreachable — skip; do not invent Online from billing
                continue;
            }
        }

        @file_put_contents($cacheFile, json_encode($counts));
        return $counts;
    }

    /**
     * Annotate one customer row (array or Idiorm object as array) with:
     *   conn, conn_label, conn_sub, device_count, pkg_active, plan_name, pkg_until, …
     * Existing pkg_* fields are preserved when already set; connection fields are overwritten.
     *
     * @param array $row Customer row (must include id, username; optional pppoe_username)
     * @param array<string,int> $sessionCounts From sessionCounts()
     * @param array|null $recharge Optional latest/active recharge info:
     *        ['status'=>'on'|'off', 'namebp'=>..., 'expiration'=>..., 'time'=>...]
     * @return array
     */
    public static function annotate(array $row, array $sessionCounts, $recharge = null)
    {
        $username = isset($row['username']) ? (string)$row['username'] : '';
        $pppoe = !empty($row['pppoe_username']) ? (string)$row['pppoe_username'] : '';

        $devices = 0;
        if ($username !== '' && isset($sessionCounts[$username])) {
            $devices += (int)$sessionCounts[$username];
        }
        if ($pppoe !== '' && $pppoe !== $username && isset($sessionCounts[$pppoe])) {
            $devices += (int)$sessionCounts[$pppoe];
        }

        $pkgActive = false;
        if (is_array($recharge)) {
            $pkgActive = (isset($recharge['status']) && $recharge['status'] === 'on');
            if (empty($row['plan_name']) && !empty($recharge['namebp'])) {
                $row['plan_name'] = $recharge['namebp'];
            }
            if ($pkgActive && empty($row['pkg_until']) && !empty($recharge['expiration'])) {
                $until = $recharge['expiration'];
                if (!empty($recharge['time'])) {
                    $until .= ' ' . $recharge['time'];
                }
                $row['pkg_until'] = 'Until ' . $until;
            }
        } elseif (array_key_exists('pkg_active', $row)) {
            $pkgActive = (bool)$row['pkg_active'];
        }

        $row['pkg_active'] = $pkgActive;
        $row['device_count'] = $devices;

        if (!$pkgActive) {
            $row['conn'] = 'expired';
            $row['conn_label'] = 'Expired';
            $row['conn_sub'] = 'No active package';
        } elseif ($devices > 0) {
            $row['conn'] = 'online';
            $row['conn_label'] = 'Online';
            $row['conn_sub'] = $devices . ' live session(s) on MikroTik';
        } else {
            // Active billing package, but not dialed in / not logged into Hotspot
            $row['conn'] = 'offline';
            $row['conn_label'] = 'Offline';
            $row['conn_sub'] = 'Package active — no live MikroTik session';
        }

        return $row;
    }

    /**
     * Enrich a list of customers and compute summary counts.
     *
     * @param array $customers List of customer arrays (or objects with as_array)
     * @param string $connFilter ''|all|online|offline|expired — filter after annotate
     * @return array{rows: array, counts: array{all:int,online:int,offline:int,expired:int}}
     */
    public static function enrichList(array $customers, $connFilter = 'all')
    {
        $sessionCounts = self::sessionCounts();

        // Prefetch active recharges for all IDs (one query)
        $ids = [];
        foreach ($customers as $c) {
            $arr = is_object($c) && method_exists($c, 'as_array') ? $c->as_array() : (array)$c;
            if (!empty($arr['id'])) {
                $ids[] = (int)$arr['id'];
            }
        }
        $rechargeByCustomer = [];
        if ($ids) {
            try {
                $recharges = ORM::for_table('tbl_user_recharges')
                    ->where_in('customer_id', $ids)
                    ->order_by_desc('id')
                    ->find_many();
                foreach ($recharges as $r) {
                    $cid = (int)$r['customer_id'];
                    // Prefer first 'on'; otherwise keep latest row
                    if (!isset($rechargeByCustomer[$cid]) || $r['status'] === 'on') {
                        if (!isset($rechargeByCustomer[$cid]) || $rechargeByCustomer[$cid]['status'] !== 'on') {
                            $rechargeByCustomer[$cid] = [
                                'status' => $r['status'],
                                'namebp' => $r['namebp'],
                                'expiration' => $r['expiration'],
                                'time' => $r['time'],
                            ];
                        }
                    }
                }
            } catch (Throwable $e) {
                // continue without recharge map
            }
        }

        $counts = ['all' => 0, 'online' => 0, 'offline' => 0, 'expired' => 0];
        $annotated = [];
        foreach ($customers as $c) {
            $row = is_object($c) && method_exists($c, 'as_array') ? $c->as_array() : (array)$c;
            $cid = isset($row['id']) ? (int)$row['id'] : 0;
            $recharge = $cid && isset($rechargeByCustomer[$cid]) ? $rechargeByCustomer[$cid] : null;
            $row = self::annotate($row, $sessionCounts, $recharge);

            $counts['all']++;
            if ($row['conn'] === 'online') {
                $counts['online']++;
            } elseif ($row['conn'] === 'offline') {
                $counts['offline']++;
            } else {
                $counts['expired']++;
            }

            $annotated[] = $row;
        }

        $filter = strtolower((string)$connFilter);
        if ($filter && $filter !== 'all') {
            $annotated = array_values(array_filter($annotated, function ($row) use ($filter) {
                return isset($row['conn']) && $row['conn'] === $filter;
            }));
        }

        return ['rows' => $annotated, 'counts' => $counts];
    }
}
