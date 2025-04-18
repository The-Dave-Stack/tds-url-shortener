
import { supabase } from '@/integrations/supabase/client';
import { generateShortCode } from '@/utils/validation';
import { getClientId } from '@/utils/anonymous-client';
import { AnonymousQuota, UrlData } from './api-types';

export const checkAnonymousQuota = async (): Promise<AnonymousQuota> => {
  try {
    // Get the daily limit from app_settings
    const { data: settingsData, error: settingsError } = await supabase
      .from('app_settings')
      .select('value')
      .ilike('key', 'anonymous_daily_limit')
      .maybeSingle();

    console.log('Settings data:', settingsData, settingsError);

    if (settingsError || !settingsData) {
      console.warn('Configuration for anonymous_daily_limit not found, using the default value.', settingsError);
    }
    
    // Default to 50 if not found or invalid
    let dailyLimit = 50; // Default value
    
    // Safely parse the value if it exists
    if (settingsData?.value) {
      const valueObj = settingsData.value as Record<string, any>;
      if (valueObj && typeof valueObj === 'object' && 'limit' in valueObj) {
        const limitValue = Number(valueObj.limit);
        if (!isNaN(limitValue)) {
          dailyLimit = limitValue;
        }
      }
    }
    
    // Calculate UTC date range boundaries concisely
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0); // Set to the start of the current day in UTC

    const startOfTodayUTC = date.toISOString();

    // Advance the same date object by one day to get the start of tomorrow
    date.setUTCDate(date.getUTCDate() + 1);
    const startOfTomorrowUTC = date.toISOString();
    
    const { count, error } = await supabase
      .from('anonymous_urls')
      .select('*', { count: 'exact', head: true })  // Only fetch the count
      .gte('created_at', startOfTodayUTC)           // Greater than or equal to start of today
      .lt('created_at', startOfTomorrowUTC);        // Less than start of tomorrow
    
    if (error) {
      console.error('Error checking anonymous quota:', error);
      throw error;
    }
    
    const usedCount = count || 0;
    
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
      
      // Update clicks using RPC function
      await supabase.rpc('increment_clicks', { url_id: data.id });
      
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
      
      // Check shared anonymous quota before creating
      const quota = await checkAnonymousQuota();
      if (quota.remaining <= 0) {
        throw new Error('Se ha alcanzado el límite diario de URLs acortadas anónimas. Inicia sesión para crear más.');
      }
      
      const shortCode = customAlias || generateShortCode();
      
      // Insert the URL - we still track client_id for reference but don't use it for quota enforcement
      const { data: urlData, error: urlError } = await supabase
        .from('anonymous_urls')
        .insert([
          { 
            original_url: originalUrl,
            short_code: shortCode,
            custom_alias: customAlias || null,
            client_id: clientId // Keep tracking client_id but don't use it for quota
          }
        ])
        .select()
        .single();
        
      if (urlError) throw urlError;
      
      if (!urlData) {
        throw new Error('Error al crear la URL acortada');
      }
      
      // Update anonymous URL clicks using RPC function
      await supabase.rpc('increment_anonymous_clicks', { url_id: urlData.id });
      
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
