
import { supabase } from '@/integrations/supabase/client';
import { getClientId } from '@/utils/anonymous-client';
import { UrlAnalytics, Visit } from './api-types';

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
        // Normalize country name - some APIs use two-letter country codes
        const countryName = getFullCountryName(visit.country);
        countriesMap.set(countryName, (countriesMap.get(countryName) || 0) + 1);
      }
      
      // Add to recent visits - handling that region and city might not exist in the database
      recentVisits.push({
        id: visit.id,
        timestamp: visit.timestamp,
        country: visit.country ? getFullCountryName(visit.country) : 'Unknown',
        // Only include region and city if they exist in the database record
        region: null,
        city: null,
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

/**
 * Convert country codes to full country names
 * @param countryCode The country code or name
 * @returns The full country name
 */
function getFullCountryName(countryCode: string): string {
  // Mapa de códigos ISO a nombres completos en español
  const countryMap: Record<string, string> = {
    'ES': 'España',
    'MX': 'México',
    'AR': 'Argentina',
    'CO': 'Colombia',
    'CL': 'Chile',
    'US': 'Estados Unidos',
    'PE': 'Perú',
    'BR': 'Brasil',
    'VE': 'Venezuela',
    'EC': 'Ecuador',
    'UY': 'Uruguay',
    'PY': 'Paraguay',
    'BO': 'Bolivia',
    'PA': 'Panamá',
    'CR': 'Costa Rica',
    'DO': 'República Dominicana',
    'GT': 'Guatemala',
    'SV': 'El Salvador',
    'HN': 'Honduras',
    'NI': 'Nicaragua',
    'PR': 'Puerto Rico',
    'CU': 'Cuba',
  };

  // Si es un código de país de 2 letras, convertirlo a nombre completo
  if (countryCode.length === 2 && countryMap[countryCode.toUpperCase()]) {
    return countryMap[countryCode.toUpperCase()];
  }

  // Si ya es un nombre completo o no tenemos mapeo, devolverlo tal cual
  return countryCode;
}
