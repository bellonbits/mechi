import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.104.1"
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts"

serve(async (req) => {
  try {
    const rawBody = await req.text()

    // ── Signature verification (skip if secret not configured) ─
    const webhookSecret = Deno.env.get('LIPANA_WEBHOOK_SECRET')
    const signature = req.headers.get('x-lipana-signature')

    if (webhookSecret && signature) {
      const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(webhookSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"]
      )
      const sigBytes = new Uint8Array(
        signature.match(/.{1,2}/g)!.map((b) => parseInt(b, 16))
      )
      const isValid = await crypto.subtle.verify(
        "HMAC",
        key,
        sigBytes,
        new TextEncoder().encode(rawBody)
      )
      if (!isValid) {
        console.error('Invalid Lipana signature')
        return new Response('Unauthorized', { status: 401 })
      }
    }

    const payload = JSON.parse(rawBody)
    const { event, data } = payload
    console.log('Lipana webhook event:', event, JSON.stringify(data))

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (event === 'payment.success') {
      // Lipana sends transactionId — this matches checkout_request_id we stored on initiation
      // It may also send checkoutRequestID as an alias; try both
      const txnId = data?.transactionId || data?.checkoutRequestID
      const receipt = data?.mpesaReceiptNumber || data?.transactionId

      if (!txnId) throw new Error('No transactionId in webhook payload')

      const startDate = new Date()
      const endDate = new Date()
      endDate.setDate(startDate.getDate() + 7) // 7-day weekly plan

      const { data: sub, error: subError } = await supabaseAdmin
        .from('subscriptions')
        .update({
          status: 'active',
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          mpesa_receipt: receipt,
        })
        .eq('checkout_request_id', txnId)
        .select('user_id')
        .single()

      if (subError) {
        console.error('Subscription update error:', subError)
        throw subError
      }

      if (sub?.user_id) {
        await supabaseAdmin
          .from('profiles')
          .update({ is_premium: true })
          .eq('id', sub.user_id)

        console.log('Premium granted to user:', sub.user_id)
      }

    } else if (event === 'payment.failed') {
      const txnId = data?.transactionId || data?.checkoutRequestID
      if (txnId) {
        await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'failed' })
          .eq('checkout_request_id', txnId)
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (err) {
    console.error('Webhook error:', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
