# Exact patches — Customers Online / Offline never detected

Live panel: **AllxSys IMS** (`allxsys/internet-management`) at `mwaniki.rayprotechsolutions.co.ke`  
(phpNuxBill-style). This TypeScript repo does not run that site.

## Root cause

1. **Offline never shown** — Customers list sets `conn=online` / `device_count=1` for anyone with an **active package** (`tbl_user_recharges.status=on`). That is **billing**, not a live MikroTik session. Offline (package on, CPE/session down) is never assigned. Customer **view** already uses live `$userSession.online`; the **list** did not.
2. **872% / 00%** — Template rendered `{$cOnline}<small>{$pOnline}%</small>` inside one `<strong>` (e.g. `8` + `72%` → looks like `872%`). Math was fine; presentation smashed count into percent.

## Files

| File in this pack | Upload to (document root) |
| --- | --- |
| `snippets/CustomerConnection.php` | `system/autoload/CustomerConnection.php` |
| `ui-ui-admin-customers-list.tpl` | `ui/ui/admin/customers/list.tpl` |
| Patch below | `system/controllers/customers.php` (list / default action) |

Hotspot multi-device and PPPoE billing / secrets are **unchanged** — only list status + Devices count + percent display.

---

## 1) Upload helper (required)

Copy `snippets/CustomerConnection.php` → `system/autoload/CustomerConnection.php`.

It polls enabled routers for `/ppp/active` + `/ip/hotspot/active` (30s cache), then:

| Label | Meaning |
| --- | --- |
| **Online** | Login present in live active sessions |
| **Offline** | Active package, **no** live session |
| **Expired** | No active package |
| **Devices** | Count of live sessions for that username (Hotspot shared-users can be >1) |

---

## 2) Wire `system/controllers/customers.php` (list)

In the `list` (or empty) action that assigns `$d` and `$counts` for `admin/customers/list.tpl`, **after** customers are loaded and **before** `$ui->display(...)`, replace any home-grown online/offline / device_count logic with:

```php
// --- LIVE MikroTik Online / Offline / Devices (CustomerConnection) ---
$conn = _req('conn', 'all');
if ($conn === '') {
    $conn = 'all';
}

$rows = [];
foreach ($d as $c) {
    $rows[] = is_object($c) && method_exists($c, 'as_array') ? $c->as_array() : (array) $c;
}

$result = CustomerConnection::enrichList($rows, $conn);
$d = $result['rows'];
$counts = $result['counts'];

$ui->assign('d', $d);
$ui->assign('counts', $counts);
$ui->assign('conn', $conn);
// --- end CustomerConnection ---
```

### What to remove / stop doing

Delete or bypass any prior list logic that:

- Sets `conn` / `conn_label` from package active alone (`status=on` → Online)
- Hardcodes `device_count = 1` (or from `shared_users`) for active packages
- Treats `package_status == 'online'` as session Online on the list

Keep package fields (`plan_name`, `pkg_active`, `pkg_until`, service badges) as they are; `enrichList` only overwrites connection fields and will fill package hints when missing.

### If `$counts` was built earlier

Remove the old `$counts = ['all'=>…, 'online'=>…]` block that counted Online from active recharges. Use `$result['counts']` only.

### Optional: clear session cache after sync

After a successful customer Sync to MikroTik, delete:

`system/cache/customer_session_counts.json`

so the next list load re-polls within a few seconds (otherwise wait ≤30s).

---

## 3) Replace Customers list template (percent display)

Replace live `ui/ui/admin/customers/list.tpl` with this pack’s `ui-ui-admin-customers-list.tpl`.

**Only change vs live:** summary cards show `8 (72%)` instead of smashed `872%`:

```smarty
<strong>{$cOnline}{if $cTotal > 0}<small>({$pOnline}%)</small>{/if}</strong>
```

(same for Offline / expired).

---

## 4) Verify

1. Customers → note Total / Online / Offline / Expired.
2. A paid customer with CPE off / not logged in → **Offline**, Devices **0**, Offline count ≥ 1.
3. Same customer dialed in (PPPoE) or Hotspot-logged → **Online**, Devices ≥ 1.
4. Hotspot plan with `shared_users` > 1 and two devices logged → Devices **2** (not stuck at 1).
5. Percents look like `8 (72%)`, never `872%` / `00%`.
6. Recharge / expire / Hotspot multi-device connect still works (billing untouched).
