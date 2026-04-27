// This function is an alias for lipana-webhook — both handle the same Lipana payment events.
// Configure ONE of these URLs in your Lipana dashboard as the webhook endpoint.
// Recommended: use lipana-webhook (it has signature verification).

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.104.1"

serve(async (req) => {
  try {
    const rawBody = await req.text()
    const body = JSON.parse(rawBody)

    // event is inside the body — declare it before use
    const event = body.event
    const eventData = body.data

    console.log('Lipana webhook received:', event, JSON.stringify(eventData))

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (event === 'payment.success') {
      // transactionId matches the checkout_request_id stored during initiation
      const txnId = eventData?.transactionId || eventData?.checkoutRequestID
      const receipt = eventData?.mpesaReceiptNumber || eventData?.transactionId

      if (!txnId) throw new Error('No transactionId in payload')

      const startDate = new Date()
      const endDate = new Date()
      endDate.setDate(startDate.getDate() + 7) // 7-day weekly plan

      const { data: sub, error: subError } = await supabaseAdmin
        .from('subscriptions')
        .update({
          status: 'active',
          mpesa_receipt: receipt,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        })
        .eq('checkout_request_id', txnId)
        .select('user_id')
        .single()

      if (subError) throw subError

      if (sub?.user_id) {
        await supabaseAdmin
          .from('profiles')
          .update({ is_premium: true })
          .eq('id', sub.user_id)

        console.log('Premium granted to user:', sub.user_id)
      }

    } else if (event === 'payment.failed') {
      const txnId = eventData?.transactionId || eventData?.checkoutRequestID
      if (txnId) {
        await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'failed' })
          .eq('checkout_request_id', txnId)
      }
    }

    return new Response(JSON.stringify({ status: 'success' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (err) {
    console.error('mpesa-callback error:', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
