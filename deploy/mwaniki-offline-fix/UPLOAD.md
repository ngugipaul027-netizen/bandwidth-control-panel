# Upload — fix Customers Offline never detected

Production: `https://mwaniki.rayprotechsolutions.co.ke` (AllxSys / phpNuxBill-style).  
Upload into the **PHP document root** (same folder as `index.php`, `config.php`).

## Symptom → fix

| Symptom | Cause | Fix |
| --- | --- | --- |
| Offline always **0**; every non-expired row **Online**, Devices **1** | List used **package Active** as Online, not MikroTik `/ppp/active` or `/ip/hotspot/active` | `CustomerConnection.php` + wire in `customers.php` |
| Online **872%**, Offline **00%** | Count glued to percent (`8`+`72%`) | Replace `list.tpl` |

## Steps (≈10 minutes)

1. **Backup** on the VPS:
   - `system/controllers/customers.php`
   - `ui/ui/admin/customers/list.tpl`
2. Upload `snippets/CustomerConnection.php` →  
   `system/autoload/CustomerConnection.php`
3. Apply the **list** wiring in `PATCHES.md` §2 to `system/controllers/customers.php`.
4. Upload `ui-ui-admin-customers-list.tpl` →  
   `ui/ui/admin/customers/list.tpl`  
   (overwrite). If Smarty compiles to `ui/compiled/`, delete that cache or wait for recompile.
5. Confirm:
   - Summary shows Offline > 0 when some paid customers are not on the router.
   - Percents look like `8 (72%)`.
   - Devices = live session count (Hotspot can be >1).
6. Optional: delete `system/cache/customer_session_counts.json` after testing Sync.

## Do not upload

- Anything under `src/` (React scaffold) — not used by this live panel.
- `config.php` — leave DB credentials alone.
- Do not change Hotspot `shared_users` or PPPoE plan billing for this fix.

## Router checklist (if everyone stays Offline after the patch)

API must be reachable from the VPS (`/ip service enable api`, port `8728`, firewall, correct credentials). If routers are unreachable, the helper correctly reports Offline rather than inventing Online from billing — fix API/VPN reachability (see also `deploy/mwaniki-fixes/` for push/router patches).
