<?php
/**
 * Replace info() and getClient() inside:
 *   system/devices/MikrotikHotspot.php
 *   system/devices/MikrotikPppoe.php
 *   system/devices/MikrotikVpn.php (if present)
 *
 * Requires: use PEAR2\Net\RouterOS; (already in those files)
 */

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
