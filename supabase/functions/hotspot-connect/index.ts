import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import {
  decideDeviceConnect,
  normalizeMac,
  resolveDeviceLimit,
} from "../_shared/hotspot-devices.ts"

/**
 * Captive-portal connect/disconnect by Username / Account Code (e.g. SHANICE).
 * Registers devices against the paid customer account and enforces package device_limit.
 * Does not touch PPPoE.
 */

type ConnectBody = {
  action?: "connect" | "disconnect"
  accountCode: string
  macAddress: string
  ipAddress?: string
  deviceType?: string
}

async function callMikroTik(action: string, payload: Record<string, unknown>) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  const managerUrl =
    Deno.env.get("MIKROTIK_MANAGER_URL") ??
    `${supabaseUrl}/functions/v1/mikrotik-manager`

  const res = await fetch(managerUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({ action, ...payload }),
  })
  return res.json()
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  })
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    })
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  )

  try {
    const body = (await req.json()) as ConnectBody
    const action = body.action ?? "connect"
    const accountCode = (body.accountCode || "").trim()
    if (!accountCode) {
      return json(
        {
          success: false,
          error: "Account code is required",
          code: "MISSING_ACCOUNT",
        },
        400
      )
    }
    if (!body.macAddress) {
      return json(
        {
          success: false,
          error: "MAC address is required",
          code: "MISSING_MAC",
        },
        400
      )
    }

    let mac: string
    try {
      mac = normalizeMac(body.macAddress)
    } catch {
      return json(
        { success: false, error: "Invalid MAC address", code: "BAD_MAC" },
        400
      )
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, account_code, full_name, phone_number")
      .ilike("account_code", accountCode)
      .maybeSingle()

    if (!profile) {
      return json(
        {
          success: false,
          error:
            "You do not have an active package. Please select and purchase a package to continue.",
          code: "NO_PROFILE",
        },
        404
      )
    }

    const username = (profile.account_code || accountCode).toUpperCase()
    const now = new Date().toISOString()

    // --- Disconnect: release slot, keep registration for reconnect ---
    if (action === "disconnect") {
      await supabase
        .from("devices")
        .update({
          is_active: false,
          disconnected_at: now,
          last_seen_at: now,
        })
        .eq("profile_id", profile.id)
        .ilike("mac_address", mac)

      await supabase
        .from("active_sessions")
        .delete()
        .eq("profile_id", profile.id)
        .ilike("mac_address", mac)

      const mt = await callMikroTik("disconnect_device", {
        username,
        macAddress: mac,
        profileId: profile.id,
      })

      return json({
        success: true,
        action: "disconnect",
        mac,
        mikrotik: mt,
        message: "Device disconnected; slot released for another device.",
      })
    }

    // --- Connect ---
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("id, status, end_date, package_id, packages(*)")
      .eq("profile_id", profile.id)
      .eq("status", "active")
      .gte("end_date", now)
      .order("end_date", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!subscription) {
      return json(
        {
          success: false,
          error:
            "You do not have an active package. Please select and purchase a package to continue.",
          code: "NO_ACTIVE_PACKAGE",
        },
        403
      )
    }

    const pkg = subscription.packages as {
      device_limit?: number
      name?: string
    } | null
    const deviceLimit = resolveDeviceLimit(pkg?.device_limit)

    const { data: deviceRows } = await supabase
      .from("devices")
      .select("id, mac_address, is_active")
      .eq("profile_id", profile.id)

    const devices = (deviceRows ?? []).map((d) => ({
      mac_address: d.mac_address,
      is_active: d.is_active,
    }))

    const decision = decideDeviceConnect(devices, mac, deviceLimit)
    if (!decision.allowed) {
      return json(
        {
          success: false,
          error: decision.reason,
          code: "DEVICE_LIMIT",
          deviceLimit,
          activeDevices: devices.filter((d) => d.is_active).length,
        },
        403
      )
    }

    const existing = (deviceRows ?? []).find(
      (d) => d.mac_address.toUpperCase() === mac
    )

    let deviceId = existing?.id
    if (existing) {
      const { data: updated } = await supabase
        .from("devices")
        .update({
          is_active: true,
          last_seen_at: now,
          disconnected_at: null,
          ip_address: body.ipAddress ?? null,
          device_type: body.deviceType ?? null,
          subscription_id: subscription.id,
        })
        .eq("id", existing.id)
        .select("id")
        .single()
      deviceId = updated?.id
    } else {
      const { data: inserted, error: insertErr } = await supabase
        .from("devices")
        .insert({
          profile_id: profile.id,
          subscription_id: subscription.id,
          mac_address: mac,
          device_type: body.deviceType ?? null,
          ip_address: body.ipAddress ?? null,
          is_active: true,
          last_seen_at: now,
        })
        .select("id")
        .single()
      if (insertErr) {
        return json(
          { success: false, error: insertErr.message, code: "DEVICE_WRITE" },
          500
        )
      }
      deviceId = inserted?.id
    }

    // Sync MikroTik host for this MAC only — do not invalidate siblings
    const mt = await callMikroTik("connect_device", {
      username,
      macAddress: mac,
      ipAddress: body.ipAddress,
      profileId: profile.id,
      deviceLimit,
    })

    // Keep active_sessions synchronized with this MAC
    const { data: sess } = await supabase
      .from("active_sessions")
      .select("id")
      .eq("profile_id", profile.id)
      .ilike("mac_address", mac)
      .maybeSingle()

    if (sess) {
      await supabase
        .from("active_sessions")
        .update({
          ip_address: body.ipAddress ?? null,
          last_updated: now,
        })
        .eq("id", sess.id)
    } else {
      const { data: router } = await supabase
        .from("routers")
        .select("id")
        .limit(1)
        .maybeSingle()
      if (router) {
        await supabase.from("active_sessions").insert({
          profile_id: profile.id,
          router_id: router.id,
          mac_address: mac,
          ip_address: body.ipAddress ?? null,
          last_updated: now,
        })
      }
    }

    const previouslyActive = Boolean(existing?.is_active)
    const activeDevices =
      devices.filter((d) => d.is_active).length + (previouslyActive ? 0 : 1)

    return json({
      success: true,
      action: decision.action,
      deviceId,
      accountCode: username,
      packageName: pkg?.name,
      deviceLimit,
      activeDevices,
      mikrotik: mt,
      message:
        decision.action === "reuse"
          ? "Welcome back — reconnecting this device without using an extra slot."
          : "Device connected and registered to your account.",
    })
  } catch (error) {
    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      500
    )
  }
})
