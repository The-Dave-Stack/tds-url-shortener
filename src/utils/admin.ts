
import { supabase } from "@/integrations/supabase/client";

// Interface for user profile with additional stats
export interface UserWithStats {
  id: string;
  email: string;
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
 * Get all users with their stats (admin only)
 */
export const getAllUsers = async (): Promise<UserWithStats[]> => {
  try {
    // Get all user profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
      
    if (profilesError) throw profilesError;
    
    // Get users' emails from auth schema
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;
    
    // Combine data and calculate stats for each user
    const usersWithStats = await Promise.all(
      profiles.map(async (profile: any) => {
        const user = users.find(u => u.id === profile.id);
        
        // Get URL stats for this user
        const { data: urls, error: urlsError } = await supabase
          .from('urls')
          .select('id, created_at, clicks')
          .eq('user_id', profile.id);
          
        if (urlsError) throw urlsError;
        
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
        
        return {
          id: profile.id,
          email: user?.email || '',
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
    // Realizamos la consulta directamente para evitar errores de tipo
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
    // Realizamos la consulta directamente para evitar errores de tipo
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
    // Realizamos la consulta directamente para evitar errores de tipo
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
