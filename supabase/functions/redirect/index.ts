
// Redirect Handler Edge Function (Público)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { corsHeaders } from '../_shared/cors.ts'

// El cliente de Supabase en el edge function
const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
const supabase = createClient(supabaseUrl, supabaseKey)

Deno.serve(async (req) => {
  // Maneja CORS para solicitudes de preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Obtener datos de la solicitud
    const { url } = req
    const requestUrl = new URL(url)
    const path = requestUrl.pathname.split('/').filter(Boolean).slice(1)
    
    if (path.length !== 1) {
      return new Response(
        JSON.stringify({ error: 'Código corto no especificado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const shortCode = path[0]
    
    // Encontrar URL por código corto
    const { data: url_data, error: urlError } = await supabase
      .from('urls')
      .select('id, original_url')
      .eq('short_code', shortCode)
      .single()
    
    if (urlError || !url_data) {
      return new Response(
        JSON.stringify({ error: 'URL no encontrada' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Registrar analíticas para esta visita
    const userAgent = req.headers.get('user-agent') || null
    
    // Obtener la dirección IP y país (en un entorno real podríamos usar un servicio de geolocalización)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || null
    
    // Insertar datos de analíticas
    await supabase.from('analytics').insert([
      { 
        url_id: url_data.id,
        user_agent: userAgent,
        ip: ip,
        // En un entorno real podríamos obtener el país a partir de la IP
        country: null
      }
    ])

    // Incrementar contador de clicks
    await supabase.rpc('increment_clicks', { url_id: url_data.id })
    
    // Devolver la URL original
    return new Response(
      JSON.stringify({ originalUrl: url_data.original_url }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error en la solicitud de redirección:', error)
    
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
