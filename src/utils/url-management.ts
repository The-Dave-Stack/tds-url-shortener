
import { supabase } from '@/integrations/supabase/client';
import { getClientId } from '@/utils/anonymous-client';
import { UrlData, UrlAnalytics } from './api-types';

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
