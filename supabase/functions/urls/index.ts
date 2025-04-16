// URLs API Edge Function
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { corsHeaders } from '../_shared/cors.ts'

// Supabase client in the edge function
const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
const supabase = createClient(supabaseUrl, supabaseKey)

Deno.serve(async (req) => {
  // Handle CORS for preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get request data
    const { method, url } = req
    const requestUrl = new URL(url)
    const path = requestUrl.pathname.split('/').filter(Boolean).slice(1)
    let body = null
    
    // Parse body if it exists
    if (method !== 'GET' && method !== 'HEAD') {
      body = await req.json().catch(() => null)
    }

    // Verify user authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Extract JWT token from authorization header
    const token = authHeader.replace('Bearer ', '')
    
    // Verify token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // API Routes
    // GET /urls - Get all URLs for the user
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
    
    // POST /urls - Create a new shortened URL
    if (method === 'POST' && path.length === 0 && body) {
      const { originalUrl, customAlias } = body
      
      if (!originalUrl) {
        return new Response(
          JSON.stringify({ error: 'originalUrl is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Generate a random short code if no custom alias is provided
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
        // Check if the error is due to a duplicate short code
        if (error.code === '23505') {
          return new Response(
            JSON.stringify({ error: 'Custom alias is already in use' }),
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
    
    // GET /urls/:id - Get a specific URL
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
            JSON.stringify({ error: 'URL not found' }),
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
    
    // DELETE /urls/:id - Delete a URL
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
    
    // If the route does not match any of the above
    return new Response(
      JSON.stringify({ error: 'Route not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error in request:', error)
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Function to generate a random short code
function generateShortCode(length = 6): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}
