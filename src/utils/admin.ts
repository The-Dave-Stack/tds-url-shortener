
import { supabase } from "@/integrations/supabase/client";

// Interface for user profile with additional stats
export interface UserWithStats {
  id: string;
  email: string | null;
  username: string | null;
  role: 'USER' | 'ADMIN';
  is_active: boolean;
  created_at: string;
  urls_count: number;
  total_clicks: number;
  last_activity: string | null;
}

// Interface for notification
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

// Interface for app settings
export interface AppSettings {
  key: string;
  value: any;
  updated_at: string;
  updated_by: string | null;
}

/**
 * Get all user profiles with their stats (admin only)
 * Modificado para no usar auth.admin que requiere privilegios especiales
 */
export const getAllUsers = async (): Promise<UserWithStats[]> => {
  try {
    console.log("Fetching all user profiles...");
    // Get all user profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
      
    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }
    
    console.log("Profiles fetched:", profiles.length);
    
    // Transforma los perfiles en el formato esperado
    const usersWithStats = await Promise.all(
      profiles.map(async (profile: any) => {
        // Get URL stats for this user
        const { data: urls, error: urlsError } = await supabase
          .from('urls')
          .select('id, created_at, clicks')
          .eq('user_id', profile.id);
          
        if (urlsError) {
          console.error(`Error fetching URLs for user ${profile.id}:`, urlsError);
          throw urlsError;
        }
        
        // Calculate total clicks
        const totalClicks = urls?.reduce((sum, url) => sum + url.clicks, 0) || 0;
        
        // Get last activity (last URL creation or last click)
        let lastActivity = null;
        if (urls && urls.length > 0) {
          // Sort by created_at in descending order and get the first one
          lastActivity = urls.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0].created_at;
        }
        
        // Ya no usamos auth.users, simplemente dejamos email como null o lo tomamos del username si está disponible
        return {
          id: profile.id,
          email: profile.username || `user-${profile.id.substring(0, 8)}@example.com`, // Usamos un placeholder
          username: profile.username,
          role: profile.role,
          is_active: profile.is_active,
          created_at: profile.created_at,
          urls_count: urls?.length || 0,
          total_clicks: totalClicks,
          last_activity: lastActivity
        };
      })
    );
    
    console.log("Transformed users:", usersWithStats.length);
    return usersWithStats;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

/**
 * Update user role (admin only)
 */
export const updateUserRole = async (userId: string, role: 'USER' | 'ADMIN'): Promise<void> => {
  try {
    // Realizamos la consulta directamente para evitar errores de tipo
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

/**
 * Update user active status (admin only)
 */
export const updateUserActiveStatus = async (userId: string, isActive: boolean): Promise<void> => {
  try {
    // Realizamos la consulta directamente para evitar errores de tipo
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: isActive })
      .eq('id', userId);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};

/**
 * Send a notification to a user (admin only)
 */
export const sendNotification = async (userId: string, title: string, message: string): Promise<void> => {
  try {
    // Fix for the type error with notifications table
    const { error } = await supabase
      .from('notifications')
      .insert([{ user_id: userId, title, message }]);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

/**
 * Get app settings
 */
export const getAppSettings = async (): Promise<AppSettings[]> => {
  try {
    // Fix for the type error with app_settings table
    const { data, error } = await supabase
      .from('app_settings')
      .select('*');
      
    if (error) throw error;
    
    return (data as AppSettings[]) || [];
  } catch (error) {
    console.error('Error fetching app settings:', error);
    throw error;
  }
};

/**
 * Update app settings (admin only)
 */
export const updateAppSettings = async (key: string, value: any, userId: string): Promise<void> => {
  try {
    // Fix for the type error with app_settings table
    const { error } = await supabase
      .from('app_settings')
      .update({ value, updated_at: new Date().toISOString(), updated_by: userId })
      .eq('key', key);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error updating app settings:', error);
    throw error;
  }
};
