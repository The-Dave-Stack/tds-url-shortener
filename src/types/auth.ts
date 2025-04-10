
import { Session, User } from '@supabase/supabase-js';

// Interface for user profile including role
export interface UserProfile {
  id: string;
  username: string | null;
  role: 'USER' | 'ADMIN';
  is_active: boolean;
  created_at: string;
}

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
