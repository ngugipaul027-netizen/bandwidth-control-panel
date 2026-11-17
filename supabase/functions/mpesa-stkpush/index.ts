import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const MPESA_CONSUMER_KEY = Deno.env.get('MPESA_CONSUMER_KEY')
const MPESA_CONSUMER_SECRET = Deno.env.get('MPESA_CONSUMER_SECRET')
const MPESA_SHORTCODE = Deno.env.get('MPESA_SHORTCODE')
const MPESA_PASSKEY = Deno.env.get('MPESA_PASSKEY')
const MPESA_CALLBACK_URL = Deno.env.get('MPESA_CALLBACK_URL')

serve(async (req) => {
  try {
    const { amount, phone, packageId, profileId, accountCode } = await req.json()

    // 1. Get Access Token
    const auth = btoa(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`)
    const tokenRes = await fetch("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
      headers: { Authorization: `Basic ${auth}` }
    })
    const { access_token } = await tokenRes.json()

    // 2. Generate Password
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)
    const password = btoa(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`)

    // 3. Initiate STK Push
    const stkRes = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        BusinessShortCode: MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phone,
        PartyB: MPESA_SHORTCODE,
        PhoneNumber: phone,
        CallBackURL: MPESA_CALLBACK_URL,
        // Bill reference must match captive-portal account code (e.g. SHANICE)
        AccountReference: (accountCode || phone || "ISP_BILLING").toString().slice(0, 12),
        TransactionDesc: `Payment for package ${packageId}`
      })
    })

    const stkData = await stkRes.json()

    if (stkData.ResponseCode === "0") {
      // 4. Store payment intent in Supabase
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      await supabase.from('payments').insert({
        profile_id: profileId,
        package_id: packageId,
        amount: amount,
        phone: phone,
        checkout_request_id: stkData.CheckoutRequestID,
        status: 'pending'
      })

      return new Response(JSON.stringify({ success: true, message: "STK Push Sent" }), {
        headers: { "Content-Type": "application/json" }
      })
    }

    return new Response(JSON.stringify({ success: false, error: stkData }), { status: 400 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})