import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.104.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // ── Auth ─────────────────────────────────────────────────
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const { phoneNumber, amount = 100 } = await req.json()
    if (!phoneNumber) throw new Error('Phone number is required')

    // ── Format phone: 07xx → +2547xx ─────────────────────────
    let phone = String(phoneNumber).trim().replace(/\s/g, '')
    if (phone.startsWith('0')) phone = '+254' + phone.slice(1)
    else if (phone.startsWith('254')) phone = '+' + phone
    else if (!phone.startsWith('+')) phone = '+254' + phone

    // ── Call Lipana STK Push ──────────────────────────────────
    const apiKey = Deno.env.get('LIPANA_SECRET_KEY')
    if (!apiKey) throw new Error('LIPANA_SECRET_KEY not set in Supabase secrets')

    const lipanaRes = await fetch('https://api.lipana.dev/v1/transactions/push-stk', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, amount }),
    })

    const result = await lipanaRes.json()
    console.log('Lipana STK response:', JSON.stringify(result))

    if (!result.success) {
      throw new Error(result.message || 'Lipana STK push failed')
    }

    // Lipana returns data.transactionId — this is our tracking key
    const transactionId = result.data?.transactionId
    if (!transactionId) throw new Error('No transactionId in Lipana response')

    // ── Save pending subscription ─────────────────────────────
    // checkout_request_id stores Lipana's transactionId so the webhook can match it
    const { error: dbError } = await supabaseClient
      .from('subscriptions')
      .insert({
        user_id: user.id,
        phone_number: phone,
        amount,
        status: 'pending',
        checkout_request_id: transactionId,
      })

    if (dbError) {
      console.error('DB insert error:', dbError)
      throw new Error(dbError.message)
    }

    return new Response(
      JSON.stringify({ success: true, transactionId, message: result.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (err) {
    console.error('initiate-payment error:', err.message)
    return new Response(
      JSON.stringify({ error: err.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
