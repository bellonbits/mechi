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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')

    const { phoneNumber, amount = 100 } = await req.json()
    if (!phoneNumber) throw new Error('Phone number is required')

    // Lipana API Config (Official API v1)
    const API_KEY = Deno.env.get('LIPANA_SECRET_KEY')
    if (!API_KEY) throw new Error('Lipana API key not configured in Supabase Secrets')
    const BASE_URL = 'https://api.lipana.dev/v1'
    
    // Ensure phone is in correct format (prefix with + if needed)
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : (phoneNumber.startsWith('254') ? `+${phoneNumber}` : `+254${phoneNumber.substring(1)}`)

    // Call Lipana STK Push Endpoint
    const lipanaResponse = await fetch(
      `${BASE_URL}/transactions/push-stk`,
      {
        method: 'POST',
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formattedPhone,
          amount: amount
        }),
      }
    )

    const result = await lipanaResponse.json()

    if (result.success) {
      // Create pending subscription
      const { error: dbError } = await supabaseClient
        .from('subscriptions')
        .insert({
          user_id: user.id,
          phone_number: formattedPhone,
          amount: amount,
          status: 'pending',
          checkout_request_id: result.data.checkoutRequestID,
          mpesa_receipt: result.data.transactionId, // Store temp txn ID
        })

      if (dbError) throw dbError

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    } else {
      throw new Error(result.message || 'Lipana STK Push failed')
    }

  } catch (error) {
    console.error('Initiate Error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
