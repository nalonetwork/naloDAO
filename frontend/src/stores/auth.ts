import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { User } from '@/types';
import { auth, users } from '@/services/supabase';

interface AuthState {
  user: User | null;
  session: any;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface AuthActions {
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  setUser: (user: User | null) => void;
  setSession: (session: any) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  initializeAuth: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  subscribeWithSelector((set, get) => ({
    // State
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,

    // Actions
    signUp: async (email: string, password: string, name: string) => {
      set({ isLoading: true, error: null });
      try {
        const { data, error } = await auth.signUp(email, password, name);
        if (error) throw error;
        
        // Create user profile
        if (data.user) {
          const { error: profileError } = await users.createProfile({
            id: data.user.id,
            email: data.user.email!,
            name,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_verified: false,
            total_impact_score: 0,
            total_activities: 0,
          });
          if (profileError) throw profileError;
        }
      } catch (error: any) {
        set({ error: error.message });
      } finally {
        set({ isLoading: false });
      }
    },

    signIn: async (email: string, password: string) => {
      set({ isLoading: true, error: null });
      try {
        const { data, error } = await auth.signIn(email, password);
        if (error) throw error;
        
        if (data.user) {
          const { data: profile, error: profileError } = await users.getProfile(data.user.id);
          if (profileError) throw profileError;
          
          set({ 
            user: profile, 
            session: data.session, 
            isAuthenticated: true 
          });
        }
      } catch (error: any) {
        set({ error: error.message });
      } finally {
        set({ isLoading: false });
      }
    },

    signOut: async () => {
      set({ isLoading: true, error: null });
      try {
        const { error } = await auth.signOut();
        if (error) throw error;
        
        set({ 
          user: null, 
          session: null, 
          isAuthenticated: false 
        });
      } catch (error: any) {
        set({ error: error.message });
      } finally {
        set({ isLoading: false });
      }
    },

    resetPassword: async (email: string) => {
      set({ isLoading: true, error: null });
      try {
        const { error } = await auth.resetPassword(email);
        if (error) throw error;
      } catch (error: any) {
        set({ error: error.message });
      } finally {
        set({ isLoading: false });
      }
    },

    updatePassword: async (password: string) => {
      set({ isLoading: true, error: null });
      try {
        const { error } = await auth.updatePassword(password);
        if (error) throw error;
      } catch (error: any) {
        set({ error: error.message });
      } finally {
        set({ isLoading: false });
      }
    },

    setUser: (user: User | null) => {
      set({ user, isAuthenticated: !!user });
    },

    setSession: (session: any) => {
      set({ session });
    },

    setLoading: (loading: boolean) => {
      set({ isLoading: loading });
    },

    setError: (error: string | null) => {
      set({ error });
    },

    clearError: () => {
      set({ error: null });
    },

    initializeAuth: async () => {
      set({ isLoading: true });
      try {
        const { user, error } = await auth.getCurrentUser();
        if (error) throw error;
        
        if (user) {
          const { data: profile, error: profileError } = await users.getProfile(user.id);
          if (profileError) throw profileError;
          
          set({ 
            user: profile, 
            isAuthenticated: true 
          });
        }
      } catch (error: any) {
        console.error('Auth initialization error:', error);
      } finally {
        set({ isLoading: false });
      }
    },
  }))
);

// Subscribe to auth state changes
auth.onAuthStateChange(async (event, session) => {
  const { setUser, setSession } = useAuthStore.getState();
  
  setSession(session);
  
  if (event === 'SIGNED_IN' && session?.user) {
    try {
      const { data: profile, error } = await users.getProfile(session.user.id);
      if (!error && profile) {
        setUser(profile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  } else if (event === 'SIGNED_OUT') {
    setUser(null);
  }
});