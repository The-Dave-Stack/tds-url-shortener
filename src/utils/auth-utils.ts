
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/auth';
import { toast } from '@/hooks/use-toast';
import { NavigateFunction } from 'react-router-dom';

// Fetch user profile from database
export const fetchUserProfile = async (
  userId: string,
  setProfile: (profile: UserProfile | null) => void,
  setIsAdmin: (isAdmin: boolean) => void,
  navigate: NavigateFunction,
  t: (key: string) => string
) => {
  try {
    console.log('Fetching profile for user:', userId);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return;
    }
    
    console.log('Profile fetched:', data);
    
    if (data) {
      setProfile(data as UserProfile);
      setIsAdmin(data.role === 'ADMIN');
      
      // Check if user is active
      if (data.is_active === false) {
        await supabase.auth.signOut();
        toast({
          title: t('auth.accountDisabled'),
          variant: 'destructive',
        });
        navigate('/auth');
      }
    }
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
  }
};

// Check if registration is allowed
export const checkRegistrationAllowed = async (t: (key: string) => string) => {
  try {
    const { data: appSettings, error: settingsError } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'allow_registration')
      .single();
    
    if (settingsError) {
      console.error('Error checking registration settings:', settingsError);
      // Default to allowing registration if we can't check the setting
      return true;
    }

    if (appSettings && appSettings.value) {
      // Safely check if registration is disabled
      const settingValue = appSettings.value;
      return typeof settingValue === 'object' && 
        settingValue !== null && 
        'enabled' in settingValue ? 
        Boolean(settingValue.enabled) : true;
    }

    return true;
  } catch (error) {
    console.error('Error checking registration status:', error);
    return true;
  }
};
