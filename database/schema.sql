-- ============================================================================
-- GULBARGA MULTI-VENDOR FOOD & GROCERY DELIVERY PLATFORM SCHEMA
-- PostgreSQL DDL with Foreign Keys, Indexes, Constraints & JSONB Support
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('customer', 'vendor', 'delivery', 'admin');
CREATE TYPE preferred_lang AS ENUM ('en', 'hi');
CREATE TYPE store_type AS ENUM ('restaurant', 'grocery');
CREATE TYPE order_type_enum AS ENUM ('food', 'grocery');
CREATE TYPE order_status_enum AS ENUM (
  'placed',
  'accepted',
  'preparing',
  'ready',
  'picked_up',
  'out_for_delivery',
  'delivered',
  'cancelled'
);
CREATE TYPE payment_method_enum AS ENUM ('upi', 'card', 'netbanking', 'wallet', 'cod');
CREATE TYPE payment_status_enum AS ENUM ('pending', 'authorized', 'captured', 'failed', 'refunded');
CREATE TYPE unit_enum AS ENUM ('kg', 'g', 'litre', 'ml', 'piece', 'pack');
CREATE TYPE sync_status_enum AS ENUM ('in_progress', 'completed', 'failed');

-- 2. USERS & AUTH
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(15) NOT NULL UNIQUE,
  email VARCHAR(160) UNIQUE,
  password_hash VARCHAR(255), -- Nullable for customers (OTP-only), hashed for vendor/admin/delivery
  role user_role NOT NULL DEFAULT 'customer',
  preferred_language preferred_lang NOT NULL DEFAULT 'en',
  profile_image VARCHAR(500),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);

-- 3. OTP VERIFICATIONS (Mirrored in Redis with TTL)
CREATE TABLE IF NOT EXISTS otp_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(15) NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  is_used BOOLEAN NOT NULL DEFAULT FALSE,
  attempt_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_otp_phone ON otp_verifications(phone);

-- 4. LIVE SESSIONS & DEVICE MANAGEMENT
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  jwt_id VARCHAR(100) NOT NULL UNIQUE,
  device_info JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_jwt_id ON sessions(jwt_id);

-- 5. ADDRESSES (Constrained to Gulbarga, Karnataka)
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label VARCHAR(50) NOT NULL DEFAULT 'Home', -- Home, Work, Other
  full_address TEXT NOT NULL,
  landmark VARCHAR(255),
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  city VARCHAR(100) NOT NULL DEFAULT 'Gulbarga',
  state VARCHAR(100) NOT NULL DEFAULT 'Karnataka',
  pincode VARCHAR(10) NOT NULL DEFAULT '585101',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_addresses_user ON addresses(user_id);

-- 6. STORES (Unified model for restaurants and grocery marts)
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  legacy_id VARCHAR(100) UNIQUE, -- Matched for idempotent external sync
  owner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name_en VARCHAR(200) NOT NULL,
  name_hi VARCHAR(200),
  description_en TEXT,
  description_hi TEXT,
  type store_type NOT NULL DEFAULT 'restaurant',
  category VARCHAR(100) NOT NULL, -- e.g. North Karnataka Food, Biryani, Supermarket, Organic Kirana
  address TEXT NOT NULL,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  phone VARCHAR(20),
  logo_url TEXT,
  cover_image_url TEXT,
  opening_hours JSONB NOT NULL DEFAULT '{"open": "08:00", "close": "23:00"}'::jsonb,
  avg_rating DECIMAL(3, 2) NOT NULL DEFAULT 4.5,
  total_ratings INT NOT NULL DEFAULT 0,
  delivery_radius_km DECIMAL(4, 1) NOT NULL DEFAULT 8.0,
  avg_prep_time_minutes INT NOT NULL DEFAULT 25,
  min_order_value DECIMAL(10, 2) NOT NULL DEFAULT 99.00,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_accepting_orders BOOLEAN NOT NULL DEFAULT TRUE,
  source VARCHAR(50) NOT NULL DEFAULT 'external', -- external | manual
  last_synced_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stores_type ON stores(type);
CREATE INDEX idx_stores_legacy ON stores(legacy_id);
CREATE INDEX idx_stores_lat_lng ON stores(latitude, longitude);

-- 7. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en VARCHAR(100) NOT NULL,
  name_hi VARCHAR(100) NOT NULL,
  type store_type NOT NULL DEFAULT 'food',
  icon_url TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  legacy_id VARCHAR(100) UNIQUE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name_en VARCHAR(255) NOT NULL,
  name_hi VARCHAR(255),
  description_en TEXT,
  description_hi TEXT,
  price DECIMAL(10, 2) NOT NULL,
  discounted_price DECIMAL(10, 2),
  image_url TEXT,
  is_veg BOOLEAN NOT NULL DEFAULT TRUE,
  unit unit_enum NOT NULL DEFAULT 'piece',
  stock_quantity INT NOT NULL DEFAULT 100,
  variants JSONB NOT NULL DEFAULT '[]'::jsonb, -- e.g. sizes, weights, add-ons
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  gst_rate DECIMAL(4, 2) NOT NULL DEFAULT 5.00, -- 5% for restaurant food, 0-18% for packaged goods
  last_synced_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_store ON products(store_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_legacy ON products(legacy_id);

-- 9. DELIVERY PARTNERS
CREATE TABLE IF NOT EXISTS delivery_partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vehicle_type VARCHAR(50) NOT NULL DEFAULT 'Motorcycle',
  vehicle_number VARCHAR(30) NOT NULL,
  is_online BOOLEAN NOT NULL DEFAULT FALSE,
  current_latitude DECIMAL(10, 7),
  current_longitude DECIMAL(10, 7),
  last_location_update TIMESTAMPTZ,
  total_deliveries INT NOT NULL DEFAULT 0,
  avg_rating DECIMAL(3, 2) NOT NULL DEFAULT 4.8,
  earnings_balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(32) NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES users(id),
  store_id UUID NOT NULL REFERENCES stores(id),
  delivery_partner_id UUID REFERENCES delivery_partners(id) ON DELETE SET NULL,
  order_type order_type_enum NOT NULL,
  delivery_address_snapshot JSONB NOT NULL,
  items_total DECIMAL(10, 2) NOT NULL,
  delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 35.00,
  taxes DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  discount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  grand_total DECIMAL(10, 2) NOT NULL,
  payment_method payment_method_enum NOT NULL DEFAULT 'upi',
  payment_status payment_status_enum NOT NULL DEFAULT 'pending',
  order_status order_status_enum NOT NULL DEFAULT 'placed',
  estimated_delivery_time TIMESTAMPTZ,
  placed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  delivery_otp VARCHAR(6) DEFAULT '4821', -- OTP for delivery handover verification
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_store ON orders(store_id);
CREATE INDEX idx_orders_status ON orders(order_status);

-- 11. ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  name_en VARCHAR(255) NOT NULL,
  name_hi VARCHAR(255),
  price DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL,
  selected_variant JSONB,
  subtotal DECIMAL(10, 2) NOT NULL
);

-- 12. ORDER STATUS HISTORY
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status order_status_enum NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. PAYMENTS & PAYOUTS
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  razorpay_order_id VARCHAR(100),
  razorpay_payment_id VARCHAR(100),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(5) NOT NULL DEFAULT 'INR',
  status payment_status_enum NOT NULL DEFAULT 'pending',
  raw_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id),
  recipient_type VARCHAR(30) NOT NULL, -- 'store' | 'delivery_partner'
  recipient_id UUID NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'processed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. SYNC LOGS (External live catalog reconciliation)
CREATE TABLE IF NOT EXISTS sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type VARCHAR(50) NOT NULL, -- 'stores', 'products', 'inventory'
  sync_type VARCHAR(50) NOT NULL, -- 'webhook', 'scheduled', 'manual'
  status sync_status_enum NOT NULL,
  records_processed INT NOT NULL DEFAULT 0,
  records_failed INT NOT NULL DEFAULT 0,
  error_details JSONB,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
