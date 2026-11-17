import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { resolveDeviceLimit } from "../_shared/hotspot-devices.ts"

async function activateHotspotOnMikroTik(input: {
  profileId: string
  username: string
  deviceLimit: number
  packageName: string
}) {
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
    body: JSON.stringify({
      action: "activate_hotspot_user",
      profileId: input.profileId,
      username: input.username,
      deviceLimit: input.deviceLimit,
      comment: `package=${input.packageName};device_limit=${input.deviceLimit}`,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`MikroTik activation failed: ${text}`)
  }
  return res.json()
}

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  )

  try {
    const body = await req.json()
    const result = body.Body.stkCallback

    const checkoutRequestID = result.CheckoutRequestID
    const resultCode = result.ResultCode

    if (resultCode === 0) {
      // Payment Successful
      const metadata = result.CallbackMetadata.Item
      const mpesaReceiptNumber = metadata.find(
        (i: { Name: string; Value: string | number }) =>
          i.Name === "MpesaReceiptNumber"
      ).Value

      // 1. Update Payment Record
      const { data: payment, error: pError } = await supabase
        .from("payments")
        .update({
          status: "completed",
          mpesa_receipt_number: mpesaReceiptNumber,
          raw_callback_data: body,
        })
        .eq("checkout_request_id", checkoutRequestID)
        .select()
        .single()

      if (pError) {
        console.error("Payment update failed", pError)
      }

      if (payment) {
        // 2. Get Package details (including device_limit)
        const { data: pkg } = await supabase
          .from("packages")
          .select("*")
          .eq("id", payment.package_id)
          .single()

        if (pkg) {
          const deviceLimit = resolveDeviceLimit(pkg.device_limit)

          // 3. Create Subscription
          const endDate = new Date()
          endDate.setSeconds(endDate.getSeconds() + pkg.duration_seconds)

          const { data: subscription, error: subError } = await supabase
            .from("subscriptions")
            .insert({
              profile_id: payment.profile_id,
              package_id: payment.package_id,
              start_date: new Date().toISOString(),
              end_date: endDate.toISOString(),
              status: "active",
            })
            .select()
            .single()

          if (subError) {
            console.error("Subscription create failed", subError)
          }

          // 4. Resolve account code / username for Hotspot login
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, account_code, phone_number, full_name")
            .eq("id", payment.profile_id)
            .single()

          const username = (
            profile?.account_code ||
            profile?.phone_number ||
            payment.profile_id
          )
            .toString()
            .trim()
            .toUpperCase()

          // Ensure account_code is set so portal Username/Account Code lookup works
          if (profile && !profile.account_code) {
            await supabase
              .from("profiles")
              .update({ account_code: username })
              .eq("id", profile.id)
          }

          // 5. Provision MikroTik Hotspot user with package device_limit (shared-users).
          //    Never force shared-users=1 for multi-device packages.
          try {
            const mikrotikResult = await activateHotspotOnMikroTik({
              profileId: payment.profile_id,
              username,
              deviceLimit,
              packageName: pkg.name,
            })
            console.log(
              `Activated Hotspot user ${username} device_limit=${deviceLimit}`,
              mikrotikResult
            )
          } catch (mtErr) {
            // Payment + subscription already recorded; surface router failure for ops.
            console.error(
              `Hotspot activation failed for ${username} (subscription=${subscription?.id})`,
              mtErr
            )
          }

          console.log(
            `Activating internet for user ${payment.profile_id} until ${endDate} device_limit=${deviceLimit}`
          )
        }
      }
    } else {
      // Payment Failed
      await supabase
        .from("payments")
        .update({ status: "failed", raw_callback_data: body })
        .eq("checkout_request_id", checkoutRequestID)
    }

    return new Response(
      JSON.stringify({ ResultCode: 0, ResultDesc: "Success" }),
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500 }
    )
  }
})
