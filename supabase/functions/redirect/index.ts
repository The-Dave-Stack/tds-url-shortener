
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
      
      // Increment clicks counter for anonymous URLs directly
      // This fixes the issue where clicks weren't being recorded properly
      const { error: updateError } = await supabase
        .from('anonymous_urls')
        .update({ clicks: supabase.rpc('increment') })
        .eq('id', urlId)
      
      if (updateError) {
        console.error('Error incrementing anonymous clicks:', updateError)
      }
    } else {
      // It's a registered user URL
      urlId = urlData.id
      originalUrl = urlData.original_url
      
      // Increment clicks counter for registered URLs directly
      // This fixes the issue where clicks weren't being recorded properly
      const { error: updateError } = await supabase
        .from('urls')
        .update({ clicks: supabase.rpc('increment') })
        .eq('id', urlId)
      
      if (updateError) {
        console.error('Error incrementing clicks:', updateError)
      }
    }
    
    // Get geolocation data from IP (using Cloudflare headers if available)
    let country = req.headers.get('cf-ipcountry') || null
    let region = req.headers.get('cf-region') || null
    let city = req.headers.get('cf-city') || null
    
    // If we don't have Cloudflare headers, try to get IP geolocation from a free API
    // (For local development or non-Cloudflare environments)
    if (!country && ip !== 'unknown' && !ip.includes('127.0.0.1') && !ip.includes('::1')) {
      try {
        // Intenta obtener geolocalización basada en IP (esto funcionará en Cloudflare pero es un fallback)
        const geoResponse = await fetch(`https://ipinfo.io/${ip}/json?token=undefined`)
        if (geoResponse.ok) {
          const geoData = await geoResponse.json()
          country = geoData.country || null
          region = geoData.region || null
          city = geoData.city || null
        }
      } catch (e) {
        console.error('Error getting geolocation data:', e)
      }
    }
    
    // Store analytics data with enhanced geolocation info
    await supabase
      .from('analytics')
      .insert([
        {
          url_id: urlId,
          ip,
          user_agent: userAgent,
          referrer,
          country,
          region,
          city
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
