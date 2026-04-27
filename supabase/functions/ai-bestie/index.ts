import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.104.1"

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  if (!GROQ_API_KEY) {
    return new Response(JSON.stringify({ error: 'GROQ_API_KEY is not set in Supabase secrets' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 401,
    })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')

    const { message } = await req.json()

    // 1. Fetch user profile for context
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile) throw new Error('Profile not found')

    // 2. Fetch Chat History from DB (Long term memory)
    const { data: history } = await supabase
      .from('ai_bestie_messages')
      .select('role, content')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(15)

    const chatHistory = (history || []).reverse()

    // 3. Save new User Message to DB
    await supabase.from('ai_bestie_messages').insert({
      user_id: user.id,
      role: 'user',
      content: message
    })

    // Determine tone based on preferences
    const preference = profile.interests.find((i: string) => i.startsWith('PREF:'))?.split(':')[1] || profile.looking_for
    const isInterestedInWomen = preference?.toLowerCase().includes('women') || preference?.toLowerCase().includes('everyone')
    const isInterestedInMen = preference?.toLowerCase().includes('men') || preference?.toLowerCase().includes('everyone')
    
    let tone = "a wise, supportive best friend"
    if (isInterestedInWomen && !isInterestedInMen) {
      tone = "a cool, street-smart male wingman (Bro tone). Be encouraging, direct, and use some light-hearted 'guy talk' about relationships."
    } else if (isInterestedInMen && !isInterestedInWomen) {
      tone = "a wise, protective big sister (Lady tone). Be empathetic, intuitive, and give that 'girl-to-girl' perspective on men and dating."
    }

    const aiName = profile.ai_bestie_name || 'Mechi Bestie'
    const systemPrompt = `You are ${aiName}, ${tone}. 
Your user is ${profile.full_name}, ${profile.age}yo, looking for ${profile.looking_for}. 
Interests: ${profile.interests.filter((i:string) => !i.startsWith('PREF:')).join(', ')}.

Rules for a HUMAN EXPERIENCE:
1. TEXT LIKE A HUMAN: Use short, punchy messages. Avoid long paragraphs.
2. BE GENUINE: Use emojis naturally (but don't overdo it).
3. NO REPETITION: Don't start every message with "Hey [Name]" or "I understand".
4. KENYAN VIBE: If they are in Kenya, definitely use some Sheng or local slang (e.g. "Sasa", "Form ni gani?", "Wewe ni mjanja").
5. PERSONA: You are a real person to them, their Bestie. Never sound like a support assistant.
6. CONCISE: If they ask a simple question, give a simple, fun answer.
7. NEVER mention you are an AI.`

    // 4. Call Groq
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          { role: 'system', content: systemPrompt },
          ...chatHistory,
          { role: 'user', content: message }
        ],
        temperature: 0.8,
        max_tokens: 1000
      })
    })

    const result = await response.json()
    if (!response.ok) throw new Error(result.error?.message || 'Groq API failed')
    
    const reply = result.choices[0].message.content

    // 5. Save AI Response to DB
    await supabase.from('ai_bestie_messages').insert({
      user_id: user.id,
      role: 'assistant',
      content: reply
    })

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Function Error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
