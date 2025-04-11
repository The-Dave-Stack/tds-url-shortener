import { supabase } from '@/integrations/supabase/client';
import { generateShortCode } from '@/utils/validation';
import { v4 as uuidv4 } from 'uuid';

// Interface for the URL data
export interface UrlData {
  id: string;
  originalUrl: string;
  shortCode: string;
  createdAt: string;
  clicks: number;
  customAlias?: string;
}

// Interface for URL creation request
interface CreateUrlRequest {
  originalUrl: string;
  customAlias?: string;
}

// Interface for the URL analytics
export interface UrlAnalytics {
  id: string;
  shortCode: string;
  originalUrl: string;
  createdAt: string;
  clicks: number;
  dailyClicks: { date: string; clicks: number }[];
  countries: { name: string; value: number }[];
  recentVisits: Visit[];
}

// Interface for a visit
export interface Visit {
  id: string;
  timestamp: string;
  country: string;
  userAgent: string;
  ip?: string;
}

// Interface for anonymous quota information
export interface AnonymousQuota {
  used: number;
  limit: number;
  remaining: number;
}

/**
 * Get or create a client ID for anonymous users
 * @returns A unique client ID stored in localStorage
 */
const getClientId = (): string => {
  let clientId = localStorage.getItem('anonymous_client_id');
  if (!clientId) {
    clientId = uuidv4();
    localStorage.setItem('anonymous_client_id', clientId);
  }
  return clientId;
};

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
      
      const { error: quotaError } = await supabase.rpc('increment_anonymous_quota', {
        client_id_param: clientId,
        date_param: today
      });
      
      if (quotaError) {
        console.error('Error updating quota:', quotaError);
        // Continue even if there's an error with quota update
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

/**
 * Get all URLs created by the user
 * @returns Promise with array of URL data
 */
export const getUserUrls = async (): Promise<UrlData[]> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (user.user) {
      // Get URLs for authenticated user
      const { data, error } = await supabase
        .from('urls')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (!data) {
        return [];
      }
      
      return data.map(url => ({
        id: url.id,
        originalUrl: url.original_url,
        shortCode: url.short_code,
        createdAt: url.created_at,
        clicks: url.clicks,
        customAlias: url.custom_alias
      }));
    } else {
      // Get URLs for anonymous user
      const clientId = getClientId();
      
      const { data, error } = await supabase
        .from('anonymous_urls')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (!data) {
        return [];
      }
      
      return data.map(url => ({
        id: url.id,
        originalUrl: url.original_url,
        shortCode: url.short_code,
        createdAt: url.created_at,
        clicks: url.clicks,
        customAlias: url.custom_alias
      }));
    }
  } catch (error) {
    console.error('Error fetching user URLs:', error);
    throw error;
  }
};

/**
 * Delete a URL by ID
 * @param id The URL ID to delete
 * @returns Promise with the deletion result
 */
export const deleteUrl = async (id: string): Promise<void> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (user.user) {
      // Delete URL for authenticated user
      const { error } = await supabase
        .from('urls')
        .delete()
        .eq('id', id)
        .eq('user_id', user.user.id);
        
      if (error) throw error;
    } else {
      // Delete URL for anonymous user
      const clientId = getClientId();
      
      const { error } = await supabase
        .from('anonymous_urls')
        .delete()
        .eq('id', id)
        .eq('client_id', clientId);
        
      if (error) throw error;
    }
  } catch (error) {
    console.error('Error deleting URL:', error);
    throw error;
  }
};

/**
 * Get analytics for a specific URL
 * @param id The URL ID
 * @returns Promise with the URL analytics data
 */
export const getUrlAnalytics = async (id: string): Promise<UrlAnalytics> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    let urlData;
    let isAnonymous = false;
    
    if (user.user) {
      // Get URL data for authenticated user
      const { data, error } = await supabase
        .from('urls')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      urlData = data;
    } else {
      // Get URL data for anonymous user
      const clientId = getClientId();
      
      const { data, error } = await supabase
        .from('anonymous_urls')
        .select('*')
        .eq('id', id)
        .eq('client_id', clientId)
        .single();
        
      if (error) throw error;
      urlData = data;
      isAnonymous = true;
    }
    
    if (!urlData) {
      throw new Error('URL no encontrada');
    }
    
    // Get analytics data
    const { data: analyticsData, error: analyticsError } = await supabase
      .from('analytics')
      .select('*')
      .eq('url_id', id)
      .order('timestamp', { ascending: false });
      
    if (analyticsError) throw analyticsError;
    
    const analyticsList = analyticsData || [];
    
    // Process data to get daily clicks
    const clicksByDay = new Map<string, number>();
    const countriesMap = new Map<string, number>();
    const recentVisits: Visit[] = [];
    
    analyticsList.forEach(visit => {
      // Process daily clicks
      const date = new Date(visit.timestamp).toISOString().split('T')[0];
      clicksByDay.set(date, (clicksByDay.get(date) || 0) + 1);
      
      // Process countries
      if (visit.country) {
        countriesMap.set(visit.country, (countriesMap.get(visit.country) || 0) + 1);
      }
      
      // Add to recent visits
      recentVisits.push({
        id: visit.id,
        timestamp: visit.timestamp,
        country: visit.country || 'Unknown',
        userAgent: visit.user_agent || 'Unknown',
        ip: visit.ip
      });
    });
    
    // Convert maps to arrays
    const dailyClicks = Array.from(clicksByDay.entries()).map(([date, clicks]) => ({
      date,
      clicks
    })).sort((a, b) => a.date.localeCompare(b.date));
    
    const countries = Array.from(countriesMap.entries()).map(([name, value]) => ({
      name,
      value
    })).sort((a, b) => b.value - a.value);
    
    return {
      id: urlData.id,
      shortCode: urlData.short_code,
      originalUrl: urlData.original_url,
      createdAt: urlData.created_at,
      clicks: urlData.clicks,
      dailyClicks,
      countries,
      recentVisits: recentVisits.slice(0, 10) // Take only 10 most recent
    };
  } catch (error) {
    console.error('Error fetching URL analytics:', error);
    throw error;
  }
};
