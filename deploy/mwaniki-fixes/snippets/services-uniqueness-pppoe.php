<?php
/**
 * Drop-in replacement block for PPPoE add-post uniqueness check.
 * See ../PATCHES.md
 */
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
