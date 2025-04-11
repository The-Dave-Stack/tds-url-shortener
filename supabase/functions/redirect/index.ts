
// Follow URL Redirect Edge Function
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
const supabase = createClient(supabaseUrl, supabaseKey)

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get short code from URL
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/')
    const shortCode = pathParts[pathParts.length - 1]
    
    if (!shortCode) {
      return new Response(
        JSON.stringify({ error: 'Código URL no proporcionado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Processing redirect for short code: ${shortCode}`)
    
    // Get user's IP and user agent
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'
    const referrer = req.headers.get('referer') || null
    
    // Try to find the URL in registered users table first
    let { data: urlData, error: urlError } = await supabase
      .from('urls')
      .select('id, original_url')
      .eq('short_code', shortCode)
      .single()

    let urlId, originalUrl
    let isAnonymousUrl = false
    
    // If not found in registered users table, try anonymous table
    if (urlError || !urlData) {
      const { data: anonUrlData, error: anonUrlError } = await supabase
        .from('anonymous_urls')
        .select('id, original_url')
        .eq('short_code', shortCode)
        .single()
        
      if (anonUrlError || !anonUrlData) {
        return new Response(
          JSON.stringify({ error: 'URL no encontrada' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // It's an anonymous URL
      urlId = anonUrlData.id
      originalUrl = anonUrlData.original_url
      isAnonymousUrl = true
      
      // Increment clicks counter for anonymous URLs
      await supabase.rpc('increment_anonymous_clicks', { url_id_param: urlId })
    } else {
      // It's a registered user URL
      urlId = urlData.id
      originalUrl = urlData.original_url
      
      // Increment clicks counter for registered URLs
      await supabase.rpc('increment_clicks', { url_id: urlId })
    }
    
    // Get country information from CF headers if available
    const country = req.headers.get('cf-ipcountry') || null
    
    // Store analytics data
    await supabase
      .from('analytics')
      .insert([
        {
          url_id: urlId,
          ip,
          user_agent: userAgent,
          referrer,
          country
        }
      ])
    
    // Return the original URL
    return new Response(
      JSON.stringify({ originalUrl }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing redirect:', error)
    
    return new Response(
      JSON.stringify({ error: 'Error en el servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
