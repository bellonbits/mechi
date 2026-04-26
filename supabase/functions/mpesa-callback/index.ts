import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.104.1"
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

serve(async (req) => {
  try {
    const rawBody = await req.text()
    const body = JSON.parse(rawBody)
    const signature = req.headers.get('x-lipana-signature')
    const webhookSecret = Deno.env.get('LIPANA_WEBHOOK_SECRET')

    console.log('Lipana Webhook Received:', event, JSON.stringify(body, null, 2))

    // Optional: Signature Verification
    if (webhookSecret && signature) {
      const encoder = new TextEncoder()
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(webhookSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"]
      )
      
      const sigData = new Uint8Array(
        signature.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
      )

      const isValid = await crypto.subtle.verify(
        "HMAC",
        key,
        sigData,
        encoder.encode(rawBody)
      )

      if (!isValid) {
        console.error('Invalid Webhook Signature')
        return new Response('Unauthorized', { status: 401 })
      }
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const event = body.event
    const eventData = body.data

    if (event === 'payment.success') {
      const checkoutRequestId = eventData.checkoutRequestID
      
      const startDate = new Date()
      const endDate = new Date()
      endDate.setDate(startDate.getDate() + 7) // 7 days

      // Update subscription
      const { data: sub, error: subError } = await supabaseAdmin
        .from('subscriptions')
        .update({
          status: 'active',
          mpesa_receipt: eventData.transactionId,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        })
        .eq('checkout_request_id', checkoutRequestId)
        .select()
        .single()

      if (subError) throw subError

      // Unlock premium in profile
      await supabaseAdmin
        .from('profiles')
        .update({ is_premium: true })
        .eq('id', sub.user_id)

      console.log(`Subscription activated for user: ${sub.user_id}`)
    } else if (event === 'payment.failed') {
      await supabaseAdmin
        .from('subscriptions')
        .update({ status: 'failed' })
        .eq('checkout_request_id', eventData.checkoutRequestID)
    }

    return new Response(JSON.stringify({ status: 'success' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Webhook processing error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
