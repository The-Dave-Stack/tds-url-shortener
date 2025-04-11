
// Analytics API Edge Function
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
    const { method, url } = req
    const requestUrl = new URL(url)
    const path = requestUrl.pathname.split('/').filter(Boolean).slice(1)
    
    // Verificar autenticación del usuario
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Autenticación requerida' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Extraer el token JWT del encabezado de autorización
    const token = authHeader.replace('Bearer ', '')
    
    // Verificar el token con Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Token inválido' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // GET /analytics/:urlId - Obtener análisis para una URL específica
    if (method === 'GET' && path.length === 1) {
      const urlId = path[0]
      
      // Primero verificar que la URL pertenece al usuario
      const { data: urlData, error: urlError } = await supabase
        .from('urls')
        .select('*')
        .eq('id', urlId)
        .eq('user_id', user.id)
        .single()
      
      if (urlError || !urlData) {
        return new Response(
          JSON.stringify({ error: 'URL no encontrada o no tienes permiso para acceder a ella' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // Obtener los datos de análisis
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('analytics')
        .select('*')
        .eq('url_id', urlId)
        .order('timestamp', { ascending: false })
      
      if (analyticsError) throw analyticsError
      
      // Procesar los datos para obtener clicks diarios
      const clicksByDay = new Map<string, number>()
      const countriesMap = new Map<string, number>()
      const analyticsArray = analyticsData || []
      
      analyticsArray.forEach(visit => {
        // Procesar clicks diarios
        const date = new Date(visit.timestamp).toISOString().split('T')[0]
        clicksByDay.set(date, (clicksByDay.get(date) || 0) + 1)
        
        // Procesar países
        if (visit.country) {
          countriesMap.set(visit.country, (countriesMap.get(visit.country) || 0) + 1)
        }
      })
      
      // Convertir maps a arrays
      const dailyClicks = Array.from(clicksByDay.entries()).map(([date, clicks]) => ({
        date,
        clicks
      })).sort((a, b) => a.date.localeCompare(b.date))
      
      const countries = Array.from(countriesMap.entries()).map(([name, value]) => ({
        name,
        value
      })).sort((a, b) => b.value - a.value)
      
      // Formatear visitas recientes
      const recentVisits = analyticsArray.slice(0, 10).map(visit => ({
        id: visit.id,
        timestamp: visit.timestamp,
        country: visit.country || 'Unknown',
        userAgent: visit.user_agent || 'Unknown',
        ip: visit.ip
      }))
      
      return new Response(
        JSON.stringify({
          id: urlData.id,
          shortCode: urlData.short_code,
          originalUrl: urlData.original_url,
          createdAt: urlData.created_at,
          clicks: urlData.clicks,
          dailyClicks,
          countries,
          recentVisits
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Si la ruta no coincide con ninguna de las anteriores
    return new Response(
      JSON.stringify({ error: 'Ruta no encontrada' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error en la solicitud:', error)
    
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
