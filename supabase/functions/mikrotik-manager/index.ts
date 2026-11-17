import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import {
  buildHotspotUserPayload,
  normalizeMac,
  resolveDeviceLimit,
} from "../_shared/hotspot-devices.ts"

/**
 * MikroTik Hotspot manager.
 * IMPORTANT: PPPoE (/ppp/*) is intentionally unsupported here — do not add PPP auth/billing.
 */

type HotspotAction =
  | "activate_hotspot_user"
  | "connect_device"
  | "disconnect_device"
  | "sync_host_session"

type RequestBody = {
  action: HotspotAction | string
  profileId?: string
  username?: string
  macAddress?: string
  ipAddress?: string
  deviceLimit?: number
  speedLimit?: string
  comment?: string
}

type RouterConfig = {
  baseUrl: string
  username: string
  password: string
}

function getRouterConfig(): RouterConfig | null {
  const baseUrl = Deno.env.get("MIKROTIK_REST_URL")
  const username = Deno.env.get("MIKROTIK_USER")
  const password = Deno.env.get("MIKROTIK_PASSWORD")
  if (!baseUrl || !username || !password) return null
  return { baseUrl: baseUrl.replace(/\/$/, ""), username, password }
}

function authHeader(cfg: RouterConfig): string {
  return `Basic ${btoa(`${cfg.username}:${cfg.password}`)}`
}

async function mikrotikFetch(
  cfg: RouterConfig,
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  return fetch(`${cfg.baseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: authHeader(cfg),
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  })
}

async function findHotspotUser(
  cfg: RouterConfig,
  username: string
): Promise<{ ".id": string } | null> {
  const res = await mikrotikFetch(
    cfg,
    `/rest/ip/hotspot/user?name=${encodeURIComponent(username)}`
  )
  if (!res.ok) return null
  const rows = await res.json()
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null
}

async function activateHotspotUser(
  cfg: RouterConfig | null,
  body: RequestBody
) {
  const username = body.username
  if (!username) throw new Error("username is required for activate_hotspot_user")

  const deviceLimit = resolveDeviceLimit(body.deviceLimit)
  const payload = buildHotspotUserPayload({
    username,
    deviceLimit,
    comment: body.comment ?? `profile=${body.profileId ?? ""};device_limit=${deviceLimit}`,
  })

  // Without live router credentials, return the payload that would be applied
  // so callers / tests can verify shared-users is not forced to 1.
  if (!cfg) {
    console.log(
      `activate_hotspot_user (dry-run) user=${username} shared-users=${deviceLimit}`
    )
    return {
      success: true,
      dryRun: true,
      mikrotik: {
        path: "/rest/ip/hotspot/user",
        payload,
      },
      deviceLimit,
    }
  }

  const existing = await findHotspotUser(cfg, username)
  if (existing?.[".id"]) {
    const res = await mikrotikFetch(
      cfg,
      `/rest/ip/hotspot/user/${existing[".id"]}`,
      { method: "PATCH", body: JSON.stringify(payload) }
    )
    if (!res.ok) {
      throw new Error(`Failed to update hotspot user: ${await res.text()}`)
    }
  } else {
    const res = await mikrotikFetch(cfg, "/rest/ip/hotspot/user/add", {
      method: "POST",
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      throw new Error(`Failed to create hotspot user: ${await res.text()}`)
    }
  }

  return {
    success: true,
    dryRun: false,
    deviceLimit,
    mikrotik: { payload },
    message: `Hotspot user ${username} activated with shared-users=${deviceLimit}`,
  }
}

async function connectDevice(cfg: RouterConfig | null, body: RequestBody) {
  const username = body.username
  const macAddress = body.macAddress
  if (!username || !macAddress) {
    throw new Error("username and macAddress are required for connect_device")
  }
  const mac = normalizeMac(macAddress)

  // Hotspot host binding sync — does NOT remove other hosts for this user.
  const hostPayload = {
    mac: mac,
    comment: `user=${username}`,
    ...(body.ipAddress ? { address: body.ipAddress } : {}),
  }

  if (!cfg) {
    return {
      success: true,
      dryRun: true,
      mac,
      mikrotik: {
        host: hostPayload,
        note: "Would upsert /ip/hotspot/host without kicking other active hosts",
      },
    }
  }

  // Upsert host by MAC; never delete sibling hosts for the same username.
  const listRes = await mikrotikFetch(
    cfg,
    `/rest/ip/hotspot/host?mac-address=${encodeURIComponent(mac)}`
  )
  const hosts = listRes.ok ? await listRes.json() : []
  if (Array.isArray(hosts) && hosts.length > 0 && hosts[0][".id"]) {
    await mikrotikFetch(cfg, `/rest/ip/hotspot/host/${hosts[0][".id"]}`, {
      method: "PATCH",
      body: JSON.stringify(hostPayload),
    })
  } else {
    await mikrotikFetch(cfg, "/rest/ip/hotspot/host/add", {
      method: "POST",
      body: JSON.stringify({ "mac-address": mac, ...hostPayload }),
    })
  }

  return {
    success: true,
    dryRun: false,
    mac,
    message: `Device ${mac} synced for ${username}; other active devices left intact`,
  }
}

async function disconnectDevice(cfg: RouterConfig | null, body: RequestBody) {
  const macAddress = body.macAddress
  if (!macAddress) throw new Error("macAddress is required for disconnect_device")
  const mac = normalizeMac(macAddress)

  if (!cfg) {
    return {
      success: true,
      dryRun: true,
      mac,
      mikrotik: {
        note: "Would remove matching /ip/hotspot/active and release host slot only for this MAC",
      },
    }
  }

  // Remove only this MAC from active sessions — frees one shared-users slot.
  const activeRes = await mikrotikFetch(
    cfg,
    `/rest/ip/hotspot/active?mac-address=${encodeURIComponent(mac)}`
  )
  const actives = activeRes.ok ? await activeRes.json() : []
  if (Array.isArray(actives)) {
    for (const row of actives) {
      if (row[".id"]) {
        await mikrotikFetch(cfg, `/rest/ip/hotspot/active/${row[".id"]}`, {
          method: "DELETE",
        })
      }
    }
  }

  return {
    success: true,
    dryRun: false,
    mac,
    message: `Disconnected ${mac}; slot released for another device`,
  }
}

serve(async (req) => {
  try {
    const body = (await req.json()) as RequestBody
    const { action } = body

    // Hard guard: refuse PPPoE / PPP actions so billing/auth configs stay untouched.
    if (
      typeof action === "string" &&
      (action.toLowerCase().includes("pppoe") ||
        action.toLowerCase().includes("ppp"))
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "PPPoE/PPP actions are not supported by this Hotspot manager",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const cfg = getRouterConfig()

    let result
    switch (action) {
      case "activate_hotspot_user":
        result = await activateHotspotUser(cfg, body)
        break
      case "connect_device":
        result = await connectDevice(cfg, body)
        break
      case "disconnect_device":
        result = await disconnectDevice(cfg, body)
        break
      case "sync_host_session":
        // Alias: ensure host + do not touch other sessions
        result = await connectDevice(cfg, body)
        break
      default:
        return new Response(
          JSON.stringify({
            success: false,
            error: `Unknown or unsupported action: ${action}`,
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        )
    }

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})
