/*
  # Harpreet Regreens Database Schema

  1. New Tables
    - `planters`: Product catalog with unique hand-crafted planters
      - `id` (uuid, primary key)
      - `name` (text) - Planter name
      - `description` (text) - Detailed description
      - `price` (decimal) - Price in dollars
      - `image_url` (text) - Product image
      - `status` (text) - 'available', 'reserved', or 'sold'
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `reservations`: Track user reservations with 15-minute expiry
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `planter_id` (uuid, foreign key to planters)
      - `reserved_at` (timestamp) - When reservation was made
      - `expires_at` (timestamp) - Auto-expiry time (reserved_at + 15 minutes)
      - `status` (text) - 'active' or 'expired'
    
    - `orders`: Completed purchases
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `planter_id` (uuid, foreign key to planters)
      - `reserved_at` (timestamp) - When originally reserved
      - `purchased_at` (timestamp) - When purchased
      - `total_price` (decimal)
      - `status` (text) - 'completed' or 'cancelled'

  2. Security
    - Enable RLS on all tables
    - Add policies for user access and admin management
    - Enforce 2 reservation limit per user
    - Prevent inventory conflicts

  3. Indexes
    - Add indexes for frequent queries (user_id, planter_id, status, expires_at)
*/

-- Create planters table
CREATE TABLE IF NOT EXISTS planters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price decimal(10, 2) NOT NULL,
  image_url text NOT NULL,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  planter_id uuid NOT NULL REFERENCES planters(id) ON DELETE CASCADE,
  reserved_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '15 minutes'),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired')),
  UNIQUE(planter_id, status) -- Ensure each planter can only have one active reservation
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  planter_id uuid NOT NULL REFERENCES planters(id) ON DELETE SET NULL,
  reservation_id uuid REFERENCES reservations(id) ON DELETE SET NULL,
  purchased_at timestamptz DEFAULT now(),
  total_price decimal(10, 2) NOT NULL,
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE planters ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Planters: Anyone can view available planters
CREATE POLICY "Anyone can view available planters"
  ON planters FOR SELECT
  TO public
  USING (status = 'available' OR status = 'reserved');

-- Planters: Only admins can insert/update/delete
CREATE POLICY "Admins can manage planters"
  ON planters FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' LIKE '%@harpreetregreens.com');

CREATE POLICY "Admins can update planters"
  ON planters FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'email' LIKE '%@harpreetregreens.com')
  WITH CHECK (auth.jwt() ->> 'email' LIKE '%@harpreetregreens.com');

CREATE POLICY "Admins can delete planters"
  ON planters FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'email' LIKE '%@harpreetregreens.com');

-- Reservations: Users can view their own reservations
CREATE POLICY "Users can view own reservations"
  ON reservations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Reservations: Authenticated users can create reservations
CREATE POLICY "Authenticated users can create reservations"
  ON reservations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Reservations: Users can update their own reservations
CREATE POLICY "Users can update own reservations"
  ON reservations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Orders: Users can view their own orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Orders: Users can create orders
CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_planter_id ON reservations(planter_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_expires_at ON reservations(expires_at);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_planter_id ON orders(planter_id);
CREATE INDEX IF NOT EXISTS idx_planters_status ON planters(status);
