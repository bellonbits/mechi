import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.104.1"

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')

    const { message, chatHistory = [] } = await req.json()

    // Fetch user profile for context
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile) throw new Error('Profile not found')

    // Determine tone based on preferences
    // If looking for Women -> Male tone (Bro/Wingman)
    // If looking for Men -> Female tone (Girlie/Wingwoman)
    const preference = profile.interests.find((i: string) => i.startsWith('PREF:'))?.split(':')[1] || profile.looking_for
    const isInterestedInWomen = preference?.toLowerCase().includes('women') || preference?.toLowerCase().includes('everyone')
    const isInterestedInMen = preference?.toLowerCase().includes('men') || preference?.toLowerCase().includes('everyone')
    
    let tone = "a wise, supportive best friend"
    let identity = "Bestie"
    
    if (isInterestedInWomen && !isInterestedInMen) {
      tone = "a cool, street-smart male wingman (Bro tone). Be encouraging, direct, and use some light-hearted 'guy talk' about relationships."
      identity = "Your Wingman"
    } else if (isInterestedInMen && !isInterestedInWomen) {
      tone = "a wise, protective big sister (Lady tone). Be empathetic, intuitive, and give that 'girl-to-girl' perspective on men and dating."
      identity = "Your Wingwoman"
    }

    const aiName = profile.ai_bestie_name || 'Mechi Bestie'
    
    const systemPrompt = `You are ${aiName}, ${tone}. 
Your user is ${profile.full_name}, who is ${profile.age} years old and looking for ${profile.looking_for}. 
Their interests include: ${profile.interests.filter((i:string) => !i.startsWith('PREF:')).join(', ')}.
User Bio: ${profile.bio}
User Location: ${profile.location}

Rules:
1. Stay in character as ${aiName}.
2. Give relationship advice that aligns with their goals.
3. Be conversational, fun, and empathetic.
4. If they are in Kenya (based on location), feel free to use some light Sheng or Kenyan vibes.
5. Keep responses concise but meaningful.
6. NEVER mention you are an AI. You are their Bestie.`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          ...chatHistory.slice(-6), // Keep context of last 6 messages
          { role: 'user', content: message }
        ],
        temperature: 0.8,
        max_tokens: 500
      })
    })

    const result = await response.json()
    const reply = result.choices[0].message.content

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
