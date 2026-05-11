import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    const body = await req.json()
    const result = body.Body.stkCallback

    const checkoutRequestID = result.CheckoutRequestID
    const resultCode = result.ResultCode

    if (resultCode === 0) {
      // Payment Successful
      const metadata = result.CallbackMetadata.Item
      const mpesaReceiptNumber = metadata.find((i: any) => i.Name === 'MpesaReceiptNumber').Value

      // 1. Update Payment Record
      const { data: payment, error: pError } = await supabase
        .from('payments')
        .update({
          status: 'completed',
          mpesa_receipt_number: mpesaReceiptNumber,
          raw_callback_data: body
        })
        .eq('checkout_request_id', checkoutRequestID)
        .select()
        .single()

      if (payment) {
        // 2. Get Package details
        const { data: pkg } = await supabase
          .from('packages')
          .select('*')
          .eq('id', payment.package_id)
          .single()

        if (pkg) {
          // 3. Create Subscription
          const endDate = new Date()
          endDate.setSeconds(endDate.getSeconds() + pkg.duration_seconds)

          await supabase.from('subscriptions').insert({
            profile_id: payment.profile_id,
            package_id: payment.package_id,
            start_date: new Date().toISOString(),
            end_date: endDate.toISOString(),
            status: 'active'
          })

          // 4. Trigger MikroTik to enable user
          // In a real scenario, this would call another edge function or a queue
          // to talk to the MikroTik API.
          console.log(`Activating internet for user ${payment.profile_id} until ${endDate}`)
        }
      }
    } else {
      // Payment Failed
      await supabase
        .from('payments')
        .update({ status: 'failed', raw_callback_data: body })
        .eq('checkout_request_id', checkoutRequestID)
    }

    return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Success" }), {
      headers: { "Content-Type": "application/json" }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})