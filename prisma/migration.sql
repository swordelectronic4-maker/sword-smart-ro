-- SWORD Smart RO — Complete Database Migration
-- Run this in Supabase SQL Editor
-- Compatible with PostgreSQL 15+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Users ─────────────────────────────────────────────
CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  password TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('super_admin', 'admin', 'manager', 'customer')),
  provider TEXT NOT NULL DEFAULT 'email' CHECK (provider IN ('email', 'google', 'phone')),
  avatar TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- ─── Addresses ─────────────────────────────────────────
CREATE TABLE addresses (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  landmark TEXT,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_addresses_user_id ON addresses(user_id);

-- ─── Categories ────────────────────────────────────────
CREATE TABLE categories (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  parent_id TEXT REFERENCES categories(id),
  description TEXT,
  image TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_status ON categories(status);

-- ─── Brands ────────────────────────────────────────────
CREATE TABLE brands (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft'))
);

CREATE INDEX idx_brands_slug ON brands(slug);

-- ─── Products ──────────────────────────────────────────
CREATE TABLE products (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  sku TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  short_description TEXT,
  price INTEGER NOT NULL,
  sale_price INTEGER,
  cost_price INTEGER,
  stock INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  weight FLOAT,
  length FLOAT,
  width FLOAT,
  height FLOAT,
  category_id TEXT REFERENCES categories(id),
  brand_id TEXT REFERENCES brands(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_featured ON products(featured);

-- ─── Product Images ────────────────────────────────────
CREATE TABLE product_images (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_product_images_product ON product_images(product_id);

-- ─── Reviews ───────────────────────────────────────────
CREATE TABLE reviews (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_product ON reviews(product_id);

-- ─── Coupons ───────────────────────────────────────────
CREATE TABLE coupons (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'percent' CHECK (type IN ('percent', 'fixed', 'free_shipping')),
  value INTEGER NOT NULL DEFAULT 0,
  min_order INTEGER NOT NULL DEFAULT 0,
  max_discount INTEGER,
  usage_limit INTEGER NOT NULL DEFAULT 100,
  used_count INTEGER NOT NULL DEFAULT 0,
  expiry_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_coupons_code ON coupons(code);

-- ─── Orders ────────────────────────────────────────────
CREATE TABLE orders (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  order_number TEXT NOT NULL UNIQUE,
  user_id TEXT REFERENCES users(id),
  guest_email TEXT,
  guest_phone TEXT,
  guest_name TEXT,
  subtotal INTEGER NOT NULL,
  discount INTEGER NOT NULL DEFAULT 0,
  cgst INTEGER NOT NULL DEFAULT 0,
  sgst INTEGER NOT NULL DEFAULT 0,
  shipping INTEGER NOT NULL DEFAULT 0,
  grand_total INTEGER NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  shipping_address JSONB,
  tracking_number TEXT,
  courier_name TEXT,
  order_status TEXT NOT NULL DEFAULT 'placed' CHECK (order_status IN ('placed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_payment ON orders(payment_status);
CREATE INDEX idx_orders_number ON orders(order_number);

-- ─── Order Items ───────────────────────────────────────
CREATE TABLE order_items (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id),
  name TEXT NOT NULL,
  image TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price INTEGER NOT NULL
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ─── Pages (CMS) ──────────────────────────────────────
CREATE TABLE pages (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pages_slug ON pages(slug);

-- ─── Banners ──────────────────────────────────────────
CREATE TABLE banners (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  title TEXT NOT NULL,
  image TEXT NOT NULL,
  link TEXT,
  position TEXT NOT NULL DEFAULT 'home_hero',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_banners_position ON banners(position);

-- ─── Settings ─────────────────────────────────────────
CREATE TABLE settings (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'string',
  label TEXT,
  group_name TEXT NOT NULL DEFAULT 'general'
);

CREATE INDEX idx_settings_key ON settings(key);
CREATE INDEX idx_settings_group ON settings(group_name);

-- ─── Activity Logs ────────────────────────────────────
CREATE TABLE activity_logs (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  user_id TEXT,
  user_name TEXT,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  details TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_user ON activity_logs(user_id);
CREATE INDEX idx_activity_action ON activity_logs(action);
CREATE INDEX idx_activity_entity ON activity_logs(entity);
CREATE INDEX idx_activity_created ON activity_logs(created_at);

-- ─── Triggers for updated_at ──────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
