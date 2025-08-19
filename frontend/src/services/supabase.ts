import { createClient } from '@supabase/supabase-js';
import type { User, Activity, Proposal, TokenBalance, Vote } from '@/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth functions
export const auth = {
  // Sign up with email
  signUp: async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });
    return { data, error };
  },

  // Sign in with email
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Listen to auth changes
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },

  // Reset password
  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { data, error };
  },

  // Update password
  updatePassword: async (password: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password,
    });
    return { data, error };
  },
};

// User functions
export const users = {
  // Get user profile
  getProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  // Update user profile
  updateProfile: async (userId: string, updates: Partial<User>) => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    return { data, error };
  },

  // Create user profile
  createProfile: async (userData: Partial<User>) => {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();
    return { data, error };
  },

  // Get user by wallet address
  getByWalletAddress: async (walletAddress: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();
    return { data, error };
  },
};

// Activity functions
export const activities = {
  // Get all activities
  getAll: async (page: number = 1, limit: number = 10) => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('activities')
      .select('*, users(name, avatar_url)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    return { data, error, count };
  },

  // Get user activities
  getByUser: async (userId: string, page: number = 1, limit: number = 10) => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('activities')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to);

    return { data, error, count };
  },

  // Create activity
  create: async (activityData: Omit<Activity, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('activities')
      .insert([activityData])
      .select()
      .single();
    return { data, error };
  },

  // Update activity
  update: async (id: string, updates: Partial<Activity>) => {
    const { data, error } = await supabase
      .from('activities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  // Delete activity
  delete: async (id: string) => {
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id);
    return { error };
  },

  // Get activities by type
  getByType: async (type: string, page: number = 1, limit: number = 10) => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('activities')
      .select('*, users(name, avatar_url)', { count: 'exact' })
      .eq('activity_type', type)
      .order('created_at', { ascending: false })
      .range(from, to);

    return { data, error, count };
  },

  // Get verified activities
  getVerified: async (page: number = 1, limit: number = 10) => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('activities')
      .select('*, users(name, avatar_url)', { count: 'exact' })
      .eq('status', 'verified')
      .order('created_at', { ascending: false })
      .range(from, to);

    return { data, error, count };
  },
};

// Proposal functions
export const proposals = {
  // Get all proposals
  getAll: async (page: number = 1, limit: number = 10) => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('proposals')
      .select('*, users(name, avatar_url)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    return { data, error, count };
  },

  // Get active proposals
  getActive: async () => {
    const { data, error } = await supabase
      .from('proposals')
      .select('*, users(name, avatar_url)')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Create proposal
  create: async (proposalData: Omit<Proposal, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('proposals')
      .insert([proposalData])
      .select()
      .single();
    return { data, error };
  },

  // Update proposal
  update: async (id: string, updates: Partial<Proposal>) => {
    const { data, error } = await supabase
      .from('proposals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  // Get proposal by ID
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('proposals')
      .select('*, users(name, avatar_url)')
      .eq('id', id)
      .single();
    return { data, error };
  },
};

// Vote functions
export const votes = {
  // Get votes for a proposal
  getByProposal: async (proposalId: string) => {
    const { data, error } = await supabase
      .from('votes')
      .select('*, users(name, avatar_url)')
      .eq('proposal_id', proposalId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Create vote
  create: async (voteData: Omit<Vote, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('votes')
      .insert([voteData])
      .select()
      .single();
    return { data, error };
  },

  // Check if user has voted
  hasVoted: async (proposalId: string, userId: string) => {
    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .eq('proposal_id', proposalId)
      .eq('user_id', userId)
      .single();

    return { hasVoted: !!data, vote: data, error };
  },
};

// Token functions
export const tokens = {
  // Get user token balances
  getBalances: async (userId: string) => {
    const { data, error } = await supabase
      .from('token_balances')
      .select('*')
      .eq('user_id', userId);

    return { data, error };
  },

  // Update token balance
  updateBalance: async (userId: string, tokenSymbol: string, balance: number) => {
    const { data, error } = await supabase
      .from('token_balances')
      .upsert({
        user_id: userId,
        token_symbol: tokenSymbol,
        balance,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    return { data, error };
  },
};

// Storage functions
export const storage = {
  // Upload file
  uploadFile: async (bucket: string, path: string, file: File) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);

    return { data, error };
  },

  // Get public URL
  getPublicUrl: (bucket: string, path: string) => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  },

  // Delete file
  deleteFile: async (bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    return { data, error };
  },
};

// Real-time subscriptions
export const realtime = {
  // Subscribe to activities
  subscribeToActivities: (callback: (payload: any) => void) => {
    return supabase
      .channel('activities')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'activities',
      }, callback)
      .subscribe();
  },

  // Subscribe to proposals
  subscribeToProposals: (callback: (payload: any) => void) => {
    return supabase
      .channel('proposals')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'proposals',
      }, callback)
      .subscribe();
  },

  // Subscribe to votes
  subscribeToVotes: (callback: (payload: any) => void) => {
    return supabase
      .channel('votes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'votes',
      }, callback)
      .subscribe();
  },
};