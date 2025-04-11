
// URLs API Edge Function
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
    let body = null
    
    // Parse body si existe
    if (method !== 'GET' && method !== 'HEAD') {
      body = await req.json().catch(() => null)
    }

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
    
    // Rutas API
    // GET /urls - Obtener todas las URLs del usuario
    if (method === 'GET' && path.length === 0) {
      const { data, error } = await supabase
        .from('urls')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      return new Response(
        JSON.stringify(data.map(url => ({
          id: url.id,
          originalUrl: url.original_url,
          shortCode: url.short_code,
          createdAt: url.created_at,
          clicks: url.clicks,
          customAlias: url.custom_alias
        }))),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // POST /urls - Crear una nueva URL acortada
    if (method === 'POST' && path.length === 0 && body) {
      const { originalUrl, customAlias } = body
      
      if (!originalUrl) {
        return new Response(
          JSON.stringify({ error: 'originalUrl es requerida' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Generar un código corto aleatorio si no se proporciona un alias personalizado
      const shortCode = customAlias || generateShortCode()
      
      const { data, error } = await supabase
        .from('urls')
        .insert([
          {
            original_url: originalUrl,
            short_code: shortCode,
            custom_alias: customAlias || null,
            user_id: user.id
          }
        ])
        .select()
        .single()
      
      if (error) {
        // Verificar si el error es por un código corto duplicado
        if (error.code === '23505') {
          return new Response(
            JSON.stringify({ error: 'El alias personalizado ya está en uso' }),
            { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        throw error
      }
      
      return new Response(
        JSON.stringify({
          id: data.id,
          originalUrl: data.original_url,
          shortCode: data.short_code,
          createdAt: data.created_at,
          clicks: data.clicks,
          customAlias: data.custom_alias
        }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // GET /urls/:id - Obtener una URL específica
    if (method === 'GET' && path.length === 1) {
      const id = path[0]
      
      const { data, error } = await supabase
        .from('urls')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          return new Response(
            JSON.stringify({ error: 'URL no encontrada' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        throw error
      }
      
      return new Response(
        JSON.stringify({
          id: data.id,
          originalUrl: data.original_url,
          shortCode: data.short_code,
          createdAt: data.created_at,
          clicks: data.clicks,
          customAlias: data.custom_alias
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // DELETE /urls/:id - Eliminar una URL
    if (method === 'DELETE' && path.length === 1) {
      const id = path[0]
      
      const { error } = await supabase
        .from('urls')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
      
      if (error) throw error
      
      return new Response(null, { status: 204, headers: corsHeaders })
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

// Función para generar un código corto aleatorio
function generateShortCode(length = 6): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}
