# MWANIKI live panel — upload these fixes

Production host: `mwaniki.rayprotechsolutions.co.ke` (AllxSys / phpNuxBill-style PHP panel).  
This TypeScript repo does **not** run that site. Upload the files below into the **PHP document root** on the VPS (same folder as `index.php`, `config.php`, `download.php`).

## What each fix addresses

| Symptom | Root cause | File(s) to upload |
| --- | --- | --- |
| `download.php?preview=1` → HTTP 500 empty body | Custom root `download.php` fatals under Live `display_errors=0` (broken bootstrap / uncaught Throwable) | `download.php`, optional `download._diagnose.php` |
| Packages not saved on 2nd router | Plan name uniqueness is **global** (`name_plan` + type), not per-router | patch `system/controllers/services.php` |
| Push fails on newly added routers | API connect throws when router missing/unreachable; sync has no per-plan try/catch; often VPN/API port not reachable from VPS | patch `system/devices/MikrotikHotspot.php`, `MikrotikPppoe.php`, `services.php` sync |

## Upload order (5–10 minutes)

1. **Backup** on the VPS (or via SFTP):
   - `download.php`
   - `system/controllers/services.php`
   - `system/devices/MikrotikHotspot.php`
   - `system/devices/MikrotikPppoe.php` (if present)
2. Optional diagnose: upload `download._diagnose.php` → open  
   `https://mwaniki.rayprotechsolutions.co.ke/download._diagnose.php`  
   Copy the FATAL line, then **delete** the diagnose file.
3. Replace root `download.php` with this pack’s `download.php`.
4. Apply the three marked edits in `PATCHES.md` to the live PHP files (or copy the provided patched snippets).
5. Confirm:
   - `download.php?preview=1` returns HTML/script (not empty 500).
   - Create a Hotspot plan on router 2 with the **same name** as router 1 → should save.
   - Network → Routers → test connection; then Services → Sync for that router’s plans.
6. Router checklist (no code): API enabled (`/ip service enable api`), port `8728` (or `ip:8728` in panel), firewall allows **VPS → router**, credentials match Winbox. If routers have no public IP, finish the panel VPN/tunnel script from `download.php` first — push cannot work without API reachability.

## Do not upload

- Anything from `src/` (React scaffold) — not used by this live panel.
- `config.php` — leave production DB credentials alone.
