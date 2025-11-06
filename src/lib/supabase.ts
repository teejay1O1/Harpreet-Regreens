import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Planter = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  status: 'available' | 'reserved' | 'sold';
  created_at: string;
  updated_at: string;
};

export type Reservation = {
  id: string;
  user_id: string;
  planter_id: string;
  reserved_at: string;
  expires_at: string;
  status: 'active' | 'expired';
};

export type Order = {
  id: string;
  user_id: string;
  planter_id: string | null;
  reservation_id: string | null;
  purchased_at: string;
  total_price: number;
  status: 'completed' | 'cancelled';
  created_at: string;
};
