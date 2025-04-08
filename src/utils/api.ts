
import { supabase } from '@/integrations/supabase/client';
import { generateShortCode } from '@/utils/validation';

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
    
    if (!user.user) {
      throw new Error('Usuario no autenticado');
    }
    
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
    
    if (!user.user) {
      throw new Error('Usuario no autenticado');
    }
    
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
  } catch (error) {
    console.error('Error fetching user URLs:', error);
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
    // Get URL data
    const { data: urlData, error: urlError } = await supabase
      .from('urls')
      .select('*')
      .eq('id', id)
      .single();
      
    if (urlError) throw urlError;
    
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
