-- SWORD Smart RO — Seed Data
-- Run this after migration.sql

-- ─── Admin User ────────────────────────────────────────
INSERT INTO users (id, name, email, phone, password, role, provider, status, created_at, updated_at)
VALUES (
  'admin-1',
  'Priyank Joshi',
  'admin@sword.com',
  '+919537797597',
  '$2b$10$hashed_password_here', -- Replace with bcrypt hash of "9769610205"
  'super_admin',
  'email',
  'active',
  NOW(),
  NOW()
);

-- ─── Categories ────────────────────────────────────────
INSERT INTO categories (id, name, slug, description, status, sort_order) VALUES
  ('cat-1', 'Water Purifiers', 'purifiers', 'Smart RO and UF water purifiers', 'active', 1),
  ('cat-2', 'Filter Cartridges', 'filter-cartridges', 'Replacement filter cartridges', 'active', 2),
  ('cat-3', 'Membranes', 'membranes', 'RO, NF and UF membranes', 'active', 3),
  ('cat-4', 'AMC Plans', 'amc-plans', 'Annual maintenance contracts', 'active', 4),
  ('cat-5', 'Accessories', 'accessories', 'Installation kits and accessories', 'active', 5);

-- ─── Brands ────────────────────────────────────────────
INSERT INTO brands (id, name, slug, logo, status) VALUES
  ('brand-1', 'SWORD', 'sword', '/assets/logo.png', 'active'),
  ('brand-2', 'Aquaguard', 'aquaguard', NULL, 'inactive'),
  ('brand-3', 'Kent', 'kent', NULL, 'inactive');

-- ─── Products ──────────────────────────────────────────
INSERT INTO products (id, name, slug, sku, description, short_description, price, sale_price, cost_price, stock, low_stock_threshold, weight, length, width, height, category_id, brand_id, status, featured, seo_title, seo_description, created_at, updated_at) VALUES
  ('prod-1', 'SWORD Smart RO Purifier', 'sword-smart-ro', 'SWORD-RO-001', 'India first AI-powered dual-membrane smart water purifier with NF+RO technology. Saves 60% water, retains essential minerals. Features 14-stage purification, customizable TDS (80-300ppm), IoT connectivity with mobile app, and 2.4" TFT touchscreen.', 'Dual-membrane AI smart purifier', 2799900, NULL, 1800000, 50, 5, 12.5, 45, 30, 25, 'cat-1', 'brand-1', 'active', TRUE, 'SWORD Smart RO Purifier - India First Dual-Membrane AI Water Purifier', 'Buy SWORD Smart RO - India first AI-powered dual-membrane water purifier. 60% water savings, mineral retention, IoT enabled.', NOW(), NOW()),
  ('prod-2', 'PP Cotton Sediment Filter', 'pp-cotton-filter', 'SWORD-FL-001', 'High-quality PP cotton sediment filter removes dust, rust, sand and suspended particles. 5-micron filtration with long-lasting durability.', 'Removes dust, rust, sand particles', 129900, NULL, 60000, 200, 10, 0.3, 25, 7, 7, 'cat-2', 'brand-1', 'active', FALSE, NULL, NULL, NOW(), NOW()),
  ('prod-3', 'Activated Carbon Filter', 'activated-carbon-filter', 'SWORD-FL-002', 'Premium activated carbon filter removes chlorine, odors, organic compounds and harmful chemicals. Improves taste and removes color from water.', 'Removes chlorine, odors, chemicals', 189900, NULL, 90000, 150, 10, 0.35, 25, 7, 7, 'cat-2', 'brand-1', 'active', FALSE, NULL, NULL, NOW(), NOW()),
  ('prod-4', 'RO Membrane', 'ro-membrane', 'SWORD-MB-001', 'High-rejection reverse osmosis membrane removes dissolved solids, heavy metals, fluoride and harmful contaminants. 75GPD capacity with long service life.', 'Removes dissolved solids, heavy metals', 3499900, NULL, 200000, 80, 5, 0.4, 30, 8, 8, 'cat-3', 'brand-1', 'active', FALSE, NULL, NULL, NOW(), NOW()),
  ('prod-5', 'NF Membrane', 'nf-membrane', 'SWORD-MB-002', 'Nano-filtration membrane selectively removes contaminants while retaining essential minerals. Operates at lower pressure saving energy and water.', 'Retains minerals, removes contaminants', 4299900, NULL, 250000, 60, 5, 0.35, 30, 8, 8, 'cat-3', 'brand-1', 'active', FALSE, NULL, NULL, NOW(), NOW()),
  ('prod-6', 'UF Membrane', 'uf-membrane', 'SWORD-MB-003', 'Ultra-filtration membrane removes bacteria, viruses and cysts without electricity. Perfect final stage for complete safety.', 'Removes bacteria, viruses, cysts', 2199900, NULL, 120000, 100, 5, 0.3, 28, 7, 7, 'cat-3', 'brand-1', 'active', FALSE, NULL, NULL, NOW(), NOW()),
  ('prod-7', 'Mineral Cartridge', 'mineral-cartridge', 'SWORD-FL-003', 'Mineral enrichment cartridge adds essential calcium and magnesium ions back to purified water. Ensures healthy mineral-rich drinking water.', 'Adds Ca, Mg minerals to water', 1599900, NULL, 80000, 120, 10, 0.25, 20, 6, 6, 'cat-2', 'brand-1', 'active', FALSE, NULL, NULL, NOW(), NOW()),
  ('prod-8', 'TDS Sensor Module', 'tds-sensor', 'SWORD-AC-001', 'Digital TDS sensor module for real-time input and output water quality monitoring. Compatible with all SWORD purifier models.', 'Real-time TDS monitoring', 2499900, NULL, 150000, 40, 5, 0.15, 10, 5, 3, 'cat-5', 'brand-1', 'active', FALSE, NULL, NULL, NOW(), NOW()),
  ('prod-9', 'Filter Replacement Kit', 'filter-replacement-kit', 'SWORD-KT-001', 'Complete annual filter replacement kit including PP sediment, activated carbon, mineral cartridge and UF membrane. Everything needed for one year of maintenance.', 'Complete annual filter kit', 7999900, NULL, 450000, 75, 5, 2.0, 40, 30, 15, 'cat-2', 'brand-1', 'active', TRUE, NULL, NULL, NOW(), NOW()),
  ('prod-10', 'AMC Gold Plan', 'amc-gold', 'SWORD-AM-001', 'Annual Maintenance Contract Gold - 2 preventive service visits, priority response within 48 hours, parts at 10% discount, free filter check and cleaning.', '2 visits, 48hr priority', 4999900, NULL, 300000, 999, 0, 0, 0, 0, 0, 'cat-4', 'brand-1', 'active', FALSE, NULL, NULL, NOW(), NOW()),
  ('prod-11', 'AMC Platinum Plan', 'amc-platinum', 'SWORD-AM-002', 'Annual Maintenance Contract Platinum - 4 preventive service visits, all filter replacements included, 24-hour priority support, extended warranty, free annual deep clean.', '4 visits, all filters, 24hr support', 8999900, NULL, 550000, 999, 0, 0, 0, 0, 0, 'cat-4', 'brand-1', 'active', TRUE, NULL, NULL, NOW(), NOW()),
  ('prod-12', 'Installation Kit', 'installation-kit', 'SWORD-AC-002', 'Professional installation kit with all necessary fittings, pipes, connectors and wall-mount hardware. Includes installation manual and video guide.', 'Complete installation kit', 1499900, NULL, 70000, 100, 10, 1.5, 35, 25, 10, 'cat-5', 'brand-1', 'active', FALSE, NULL, NULL, NOW(), NOW());

-- ─── Coupons ──────────────────────────────────────────
INSERT INTO coupons (id, code, type, value, min_order, max_discount, usage_limit, used_count, expiry_date, is_active) VALUES
  ('c1', 'SWORD10', 'percent', 10, 0, 50000, 100, 12, '2025-12-31T23:59:59Z', TRUE),
  ('c2', 'FIRSTBUY', 'fixed', 50000, 500000, NULL, 50, 8, '2025-12-31T23:59:59Z', TRUE),
  ('c3', 'DIWALI20', 'percent', 20, 2000000, 200000, 30, 3, '2025-11-15T23:59:59Z', FALSE),
  ('c4', 'FREESHIP', 'free_shipping', 0, 2000000, NULL, 200, 45, '2025-12-31T23:59:59Z', TRUE),
  ('c5', 'WELCOME15', 'percent', 15, 1500000, 100000, 100, 0, '2025-12-31T23:59:59Z', TRUE);

-- ─── Pages (CMS) ─────────────────────────────────────
INSERT INTO pages (id, title, slug, content, meta_title, meta_description, status) VALUES
  ('page-1', 'About Us', 'about', '<h1>About SWORD</h1><p>SWORD Home Appliances Pvt. Ltd. is an Indian company incorporated in September 2025, incubated at Salford GUIITAR Council and supported by MeitY Startup Hub.</p>', 'About SWORD Smart Water', 'Learn about SWORD - India first dual-membrane smart water purifier company', 'active'),
  ('page-2', 'Privacy Policy', 'privacy', '<h1>Privacy Policy</h1><p>We respect your privacy and protect your personal data.</p>', 'Privacy Policy - SWORD', 'SWORD privacy policy and data protection', 'active'),
  ('page-3', 'Terms of Service', 'terms', '<h1>Terms of Service</h1><p>By using our services, you agree to these terms.</p>', 'Terms of Service - SWORD', 'SWORD terms and conditions', 'active'),
  ('page-4', 'Shipping Policy', 'shipping', '<h1>Shipping Policy</h1><p>Free shipping on orders above ₹20,000. Standard delivery 5-7 days.</p>', 'Shipping Policy - SWORD', 'SWORD shipping and delivery information', 'active'),
  ('page-5', 'Refund Policy', 'refund', '<h1>Refund Policy</h1><p>10-day return policy for unused products in original condition.</p>', 'Refund Policy - SWORD', 'SWORD return and refund policy', 'active'),
  ('page-6', 'Contact Us', 'contact', '<h1>Contact SWORD</h1><p>Email: priyank.joshi@swordhome.com<br>Phone: +91 95377 97597<br>Address: 36 Uparkot Vistar, Limadhra-1, Junagadh, Gujarat 362120</p>', 'Contact SWORD', 'Contact SWORD customer support', 'active');

-- ─── Banners ─────────────────────────────────────────
INSERT INTO banners (id, title, image, link, position, status, sort_order) VALUES
  ('bnr-1', 'SWORD Hero Banner', '/hero-bg.jpg', '/shop', 'home_hero', 'active', 1),
  ('bnr-2', 'Filter Replacement Offer', '/filter-cartridge.png', '/product/prod-9', 'home_featured', 'active', 2),
  ('bnr-3', 'AMC Plans', '/lifestyle-kitchen.jpg', '/product/prod-11', 'home_promo', 'active', 3);

-- ─── Settings ────────────────────────────────────────
INSERT INTO settings (id, key, value, type, label, group_name) VALUES
  (uuid_generate_v4()::TEXT, 'store_name', 'SWORD Smart Water', 'string', 'Store Name', 'general'),
  (uuid_generate_v4()::TEXT, 'currency', 'INR', 'string', 'Currency', 'general'),
  (uuid_generate_v4()::TEXT, 'currency_symbol', '₹', 'string', 'Currency Symbol', 'general'),
  (uuid_generate_v4()::TEXT, 'gst_number', '24ABCPJ1234Z1Z5', 'string', 'GST Number', 'general'),
  (uuid_generate_v4()::TEXT, 'support_phone', '+91 95377 97597', 'string', 'Support Phone', 'general'),
  (uuid_generate_v4()::TEXT, 'support_email', 'priyank.joshi@swordhome.com', 'string', 'Support Email', 'general'),
  (uuid_generate_v4()::TEXT, 'free_shipping_threshold', '2000000', 'number', 'Free Shipping Threshold (paise)', 'shipping'),
  (uuid_generate_v4()::TEXT, 'standard_shipping_cost', '19900', 'number', 'Standard Shipping Cost (paise)', 'shipping'),
  (uuid_generate_v4()::TEXT, 'express_shipping_cost', '14900', 'number', 'Express Shipping Cost (paise)', 'shipping'),
  (uuid_generate_v4()::TEXT, 'razorpay_key_id', '', 'string', 'Razorpay Key ID', 'payment'),
  (uuid_generate_v4()::TEXT, 'razorpay_secret', '', 'string', 'Razorpay Secret', 'payment'),
  (uuid_generate_v4()::TEXT, 'razorpay_live_mode', 'false', 'boolean', 'Razorpay Live Mode', 'payment'),
  (uuid_generate_v4()::TEXT, 'shiprocket_token', '', 'string', 'Shiprocket API Token', 'shipping'),
  (uuid_generate_v4()::TEXT, 'shiprocket_channel_id', '', 'string', 'Shiprocket Channel ID', 'shipping'),
  (uuid_generate_v4()::TEXT, 'meta_title', 'SWORD Smart RO - India First Dual-Membrane Water Purifier', 'string', 'Default Meta Title', 'seo'),
  (uuid_generate_v4()::TEXT, 'meta_description', 'Buy SWORD Smart RO - India first AI-powered dual-membrane water purifier. 60% water savings, mineral retention, IoT enabled.', 'string', 'Default Meta Description', 'seo');

-- ─── Sample Orders ──────────────────────────────────
INSERT INTO orders (id, order_number, user_id, guest_name, guest_email, subtotal, discount, cgst, sgst, shipping, grand_total, payment_method, payment_status, order_status, notes, created_at, updated_at) VALUES
  ('ord-1', 'SWORD-17895', NULL, 'Rahul Sharma', 'rahul.s@email.com', 2799900, 0, 251991, 251991, 0, 3303882, 'razorpay', 'paid', 'delivered', 'Delivered successfully', NOW() - INTERVAL '7 days', NOW()),
  ('ord-2', 'SWORD-17896', NULL, 'Priya Patel', 'priya.p@email.com', 9499800, 949980, 855000, 855000, 0, 10818820, 'upi', 'paid', 'shipped', NULL, NOW() - INTERVAL '3 days', NOW()),
  ('ord-3', 'SWORD-17897', NULL, 'Amit Kumar', 'amit.k@email.com', 4999900, 0, 449991, 449991, 0, 5899882, 'cod', 'pending', 'processing', NULL, NOW() - INTERVAL '1 day', NOW());

INSERT INTO order_items (id, order_id, product_id, name, image, quantity, price) VALUES
  ('oi-1', 'ord-1', 'prod-1', 'SWORD Smart RO Purifier', '/assets/product-1.png', 1, 2799900),
  ('oi-2', 'ord-2', 'prod-9', 'Filter Replacement Kit', '/filter-cartridge.png', 1, 7999900),
  ('oi-3', 'ord-2', 'prod-3', 'Activated Carbon Filter', '/filter-cartridge.png', 1, 1499900),
  ('oi-4', 'ord-3', 'prod-10', 'AMC Gold Plan', '/lifestyle-kitchen.jpg', 1, 4999900);

-- ─── Sample Users ──────────────────────────────────
INSERT INTO users (id, name, email, phone, role, provider, status, created_at, updated_at) VALUES
  ('user-1', 'Rahul Sharma', 'rahul.s@email.com', '+919876543210', 'customer', 'email', 'active', NOW() - INTERVAL '30 days', NOW()),
  ('user-2', 'Priya Patel', 'priya.p@email.com', '+919988776655', 'customer', 'email', 'active', NOW() - INTERVAL '20 days', NOW()),
  ('user-3', 'Amit Kumar', 'amit.k@email.com', '+919765432109', 'customer', 'google', 'active', NOW() - INTERVAL '15 days', NOW()),
  ('user-4', 'Sneha Gupta', 'sneha.g@email.com', '+919654321098', 'customer', 'email', 'inactive', NOW() - INTERVAL '10 days', NOW()),
  ('user-5', 'Vikram Rao', 'vikram.r@email.com', '+919543210987', 'manager', 'email', 'active', NOW() - INTERVAL '5 days', NOW());
