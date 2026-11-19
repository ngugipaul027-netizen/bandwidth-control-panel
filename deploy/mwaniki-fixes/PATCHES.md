# Exact patches for live PHP files

Apply on the VPS copies under the panel document root. Line numbers match upstream phpNuxBill `services.php` / device classes; AllxSys may differ slightly — search for the `old` strings.

---

## 1) `system/controllers/services.php` — packages not saving on 2nd router

**Cause:** Hotspot uniqueness is only `name_plan` + `type='Hotspot'`. PPPoE uniqueness is only `name_plan`. Same package name on a second router is rejected with “Name Plan Already Exist”.

### Hotspot `add-post`

**Find:**
```php
$d = ORM::for_table('tbl_plans')->where('name_plan', $name)->where('type', 'Hotspot')->find_one();
if ($d) {
    $msg .= Lang::T('Name Plan Already Exist') . '<br>';
}
```

**Replace with:**
```php
$planQuery = ORM::for_table('tbl_plans')->where('name_plan', $name)->where('type', 'Hotspot');
if (!empty($radius)) {
    $planQuery->where('is_radius', 1);
} else {
    $planQuery->where('routers', $routers);
}
$d = $planQuery->find_one();
if ($d) {
    $msg .= Lang::T('Name Plan Already Exist') . '<br>';
}
```

### PPPoE `pppoe-add-post`

**Find:**
```php
$d = ORM::for_table('tbl_plans')->where('name_plan', $name)->find_one();
if ($d) {
    $msg .= Lang::T('Name Plan Already Exist') . '<br>';
}
```

**Replace with:**
```php
$planQuery = ORM::for_table('tbl_plans')->where('name_plan', $name)->where('type', 'PPPOE');
if (!empty($radius)) {
    $planQuery->where('is_radius', 1);
} else {
    $planQuery->where('routers', $routers);
}
$d = $planQuery->find_one();
if ($d) {
    $msg .= Lang::T('Name Plan Already Exist') . '<br>';
}
```

### Sync (`case 'sync'`) — push must not abort on one bad router

Wrap each `add_plan` call:

**Find (Hotspot loop body):**
```php
(new $plan['device'])->add_plan($plan);
$log .= "DONE : $plan[name_plan], $plan[device]<br>";
```

**Replace with:**
```php
try {
    (new $plan['device'])->add_plan($plan);
    $log .= "DONE : $plan[name_plan], $plan[device], {$plan['routers']}<br>";
} catch (Throwable $e) {
    $log .= "FAILED : $plan[name_plan], {$plan['routers']} | " . htmlspecialchars($e->getMessage()) . "<br>";
}
```

Do the same inside the PPPoE sync loop.

Also wrap the post-save `add_plan` in `add-post` / `pppoe-add-post` so a MikroTik API failure does not turn into a blank/500 page after the DB row was already saved:

```php
try {
    (new $d['device'])->add_plan($d);
} catch (Throwable $e) {
    r2(getUrl('services/edit/') . $d->id(), 'e', 'Plan saved in database, but push to MikroTik failed: ' . $e->getMessage());
}
```

(For PPPoE success redirect, use `services/pppoe` and keep the error message.)

---

## 2) `system/devices/MikrotikHotspot.php` — push null/connect crashes

**Cause:** `info($name)` returns `null` when router name mismatches; `$mikrotik['ip_address']` then fatals on PHP 8+. `getClient` has no clear error when API is unreachable.

### Replace `info()` + `getClient()`

```php
function info($name)
{
    if ($name === null || $name === '') {
        throw new Exception('Router name is empty on this plan. Edit the package and select a router.');
    }
    $row = ORM::for_table('tbl_routers')->where('name', $name)->find_one();
    if (!$row) {
        throw new Exception('Router not found in panel: ' . $name);
    }
    if (isset($row['enabled']) && (string)$row['enabled'] === '0') {
        throw new Exception('Router is disabled in panel: ' . $name);
    }
    return $row;
}

function getClient($ip, $user, $pass)
{
    global $_app_stage;
    if ($_app_stage == 'Demo' || $_app_stage == 'demo') {
        return null;
    }
    if ($ip === null || $ip === '' || $user === null || $user === '') {
        throw new Exception('Router IP/username missing. Edit Network → Routers.');
    }
    $iport = explode(':', $ip);
    try {
        return new RouterOS\Client($iport[0], $user, $pass, isset($iport[1]) ? $iport[1] : null);
    } catch (Throwable $e) {
        throw new Exception(
            'Cannot connect to MikroTik API at ' . $ip .
            ' (check API service, firewall, VPN/tunnel from VPS, user/pass): ' . $e->getMessage()
        );
    }
}
```

Apply the same two methods in `system/devices/MikrotikPppoe.php` (and `MikrotikVpn.php` if used).

---

## 3) After upload — panel checks

1. Services → Hotspot → Add: choose **second router**, reuse a name from router 1 → must save.
2. Services → Sync Hotspot / Sync PPPoE → should list DONE/FAILED per plan, not a white/500 page.
3. For FAILED rows: fix `ip_address` to `public_ip:8728` or complete VPN so VPS can reach API.
4. `curl -I 'https://mwaniki.rayprotechsolutions.co.ke/download.php?preview=1'` → not HTTP 500.
