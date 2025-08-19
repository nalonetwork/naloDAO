// User types
export interface User {
  id: string;
  email?: string;
  wallet_address?: string;
  wallet_type?: 'solana' | 'aptos' | 'sui';
  name: string;
  bio?: string;
  location?: string;
  avatar_url?: string;
  project_interests?: string[];
  created_at: string;
  updated_at: string;
  is_verified: boolean;
  total_impact_score: number;
  total_activities: number;
}

// Activity types
export interface Activity {
  id: string;
  user_id: string;
  title: string;
  description: string;
  activity_type: ActivityType;
  impact_score: number;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  media_urls: string[];
  ipfs_hash?: string;
  status: 'pending' | 'verified' | 'rejected';
  verified_by?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
  tags: string[];
}

export type ActivityType = 
  | 'tree_planting'
  | 'composting'
  | 'water_harvesting'
  | 'coral_restoration'
  | 'soil_regeneration'
  | 'renewable_energy'
  | 'waste_reduction'
  | 'biodiversity_enhancement'
  | 'community_garden'
  | 'education'
  | 'other';

// Proposal types
export interface Proposal {
  id: string;
  title: string;
  description: string;
  author_id: string;
  budget: number;
  budget_currency: 'USD' | 'NALO' | 'APT' | 'SUI';
  attachments: string[];
  status: 'draft' | 'active' | 'passed' | 'rejected' | 'executed';
  voting_start: string;
  voting_end: string;
  quorum: number;
  yes_votes: number;
  no_votes: number;
  abstain_votes: number;
  created_at: string;
  updated_at: string;
  tags: string[];
}

export interface Vote {
  id: string;
  proposal_id: string;
  user_id: string;
  vote: 'yes' | 'no' | 'abstain';
  voting_power: number;
  created_at: string;
}

// Token types
export interface TokenBalance {
  user_id: string;
  token_symbol: string;
  token_name: string;
  chain: 'solana' | 'aptos' | 'sui';
  balance: number;
  decimals: number;
  contract_address?: string;
  updated_at: string;
}

export interface TokenTransaction {
  id: string;
  user_id: string;
  token_symbol: string;
  chain: 'solana' | 'aptos' | 'sui';
  type: 'reward' | 'transfer' | 'proposal_funding';
  amount: number;
  transaction_hash?: string;
  related_activity_id?: string;
  related_proposal_id?: string;
  created_at: string;
}

// Wallet types
export interface WalletConnection {
  wallet_type: 'solana' | 'aptos' | 'sui';
  address: string;
  public_key: string;
  is_connected: boolean;
  balance?: number;
}

// UI types
export interface Theme {
  mode: 'light' | 'dark';
  primary_color: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  created_at: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirm_password: string;
  name: string;
}

export interface ProfileForm {
  name: string;
  bio?: string;
  location?: string;
  project_interests?: string[];
  avatar?: File;
}

export interface ActivityForm {
  title: string;
  description: string;
  activity_type: ActivityType;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  media_files: File[];
  tags: string[];
}

export interface ProposalForm {
  title: string;
  description: string;
  budget: number;
  budget_currency: 'USD' | 'NALO' | 'APT' | 'SUI';
  voting_duration_days: number;
  quorum_percentage: number;
  attachments: File[];
  tags: string[];
}

// Navigation types
export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: NavItem[];
}

// Chart types
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

// Map types
export interface MapLocation {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description: string;
  activity_type: ActivityType;
  impact_score: number;
  media_url?: string;
  created_at: string;
}