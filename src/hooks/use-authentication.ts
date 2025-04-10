
import { useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { UserProfile } from '@/types/auth';
import { checkRegistrationAllowed, fetchUserProfile } from '@/utils/auth-utils';

export function useAuthentication() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: t('auth.loginError'),
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      // Check if registration is allowed
      const isRegistrationEnabled = await checkRegistrationAllowed(t);
      
      if (!isRegistrationEnabled) {
        toast({
          title: t('auth.registerError'),
          description: t('auth.registrationDisabled'),
          variant: 'destructive',
        });
        return;
      }

      // Registration is allowed, proceed with sign up
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: window.location.origin + '/dashboard'
        }
      });
      if (error) throw error;
      toast({
        title: t('auth.accountCreated'),
        description: t('auth.checkEmail'),
      });
    } catch (error: any) {
      toast({
        title: t('auth.registerError'),
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return {
    user,
    setUser,
    profile,
    setProfile,
    session, 
    setSession,
    loading,
    setLoading,
    isAdmin,
    setIsAdmin,
    signIn,
    signUp,
    signOut,
    fetchUserProfile: (userId: string) => 
      fetchUserProfile(userId, setProfile, setIsAdmin, navigate, t)
  };
}
