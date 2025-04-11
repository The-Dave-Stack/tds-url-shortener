
import { supabase } from '@/integrations/supabase/client';
import { generateShortCode } from '@/utils/validation';
import { getClientId } from '@/utils/anonymous-client';
import { AnonymousQuota, UrlData } from './api-types';

/**
 * Check if an anonymous user has reached their daily quota
 * @returns Promise with the quota information
 */
export const checkAnonymousQuota = async (): Promise<AnonymousQuota> => {
  try {
    const clientId = getClientId();
    
    // Get the daily limit from app_settings
    const { data: settingsData } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'anonymous_daily_limit')
      .single();
    
    // Default to 50 if not found or invalid
    const dailyLimit = settingsData?.value ? 
      (typeof settingsData.value === 'object' && settingsData.value !== null && 'limit' in settingsData.value ? 
        Number(settingsData.value.limit) : 50) : 50;
    
    // Check the current usage for today
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    const { data: quotaData, error } = await supabase
      .from('anonymous_daily_quota')
      .select('count')
      .eq('client_id', clientId)
      .eq('date', today)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error checking quota:', error);
      throw new Error('Error checking quota');
    }
    
    const usedCount = quotaData?.count || 0;
    
    return {
      used: usedCount,
      limit: dailyLimit,
      remaining: Math.max(0, dailyLimit - usedCount)
    };
  } catch (error) {
    console.error('Error in checkAnonymousQuota:', error);
    return { used: 0, limit: 50, remaining: 50 }; // Fallback to default values
  }
};

/**
 * Create a short URL
 * @param originalUrl The original URL to shorten
 * @param customAlias Optional custom alias for the short URL
 * @returns Promise with the created URL data
 */
export const createShortUrl = async (
  originalUrl: string,
  customAlias?: string
): Promise<UrlData> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    // Check if the user is authenticated
    if (user.user) {
      // Create URL for authenticated user
      const shortCode = customAlias || generateShortCode();
      
      const { data, error } = await supabase
        .from('urls')
        .insert([
          { 
            original_url: originalUrl,
            short_code: shortCode,
            custom_alias: customAlias || null,
            user_id: user.user.id
          }
        ])
        .select()
        .single();
        
      if (error) throw error;
      
      if (!data) {
        throw new Error('Error al crear la URL acortada');
      }
      
      return {
        id: data.id,
        originalUrl: data.original_url,
        shortCode: data.short_code,
        createdAt: data.created_at,
        clicks: data.clicks,
        customAlias: data.custom_alias
      };
    } else {
      // Create URL for anonymous user
      const clientId = getClientId();
      
      // Check quota before creating
      const quota = await checkAnonymousQuota();
      if (quota.remaining <= 0) {
        throw new Error('Has alcanzado el límite diario de URLs acortadas. Inicia sesión para crear más.');
      }
      
      const shortCode = customAlias || generateShortCode();
      
      // Insert the URL
      const { data: urlData, error: urlError } = await supabase
        .from('anonymous_urls')
        .insert([
          { 
            original_url: originalUrl,
            short_code: shortCode,
            custom_alias: customAlias || null,
            client_id: clientId
          }
        ])
        .select()
        .single();
        
      if (urlError) throw urlError;
      
      if (!urlData) {
        throw new Error('Error al crear la URL acortada');
      }
      
      // Update or insert quota record
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Use a more direct approach to update the quota since the RPC function is not working
      const { data: existingQuota } = await supabase
        .from('anonymous_daily_quota')
        .select('*')
        .eq('client_id', clientId)
        .eq('date', today)
        .single();
      
      if (existingQuota) {
        // Update existing quota
        await supabase
          .from('anonymous_daily_quota')
          .update({ count: existingQuota.count + 1 })
          .eq('id', existingQuota.id);
      } else {
        // Insert new quota record
        await supabase
          .from('anonymous_daily_quota')
          .insert([
            {
              client_id: clientId,
              date: today,
              count: 1
            }
          ]);
      }
      
      return {
        id: urlData.id,
        originalUrl: urlData.original_url,
        shortCode: urlData.short_code,
        createdAt: urlData.created_at,
        clicks: urlData.clicks,
        customAlias: urlData.custom_alias
      };
    }
  } catch (error) {
    console.error('Error creating short URL:', error);
    throw error;
  }
};
