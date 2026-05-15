-- ═══════════════════════════════════════════════════════════════════════════════
-- SWORD Smart Water — Supabase Database Seed Script
-- 
-- INSTRUCTIONS:
-- 1. Open Supabase Dashboard: https://supabase.com/dashboard/project/feqqdftjmsgdmxjlexzw
-- 2. Go to SQL Editor (left sidebar)
-- 3. Click "New Query"
-- 4. Paste this ENTIRE script
-- 5. Click "Run"
-- 6. Done! All tables will be populated with seed data.
-- ═══════════════════════════════════════════════════════════════════════════════

-- Disable triggers temporarily
SET session_replication_role = 'replica';

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. PRODUCTS (12 products)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO products (id, name, slug, description, short_description, price, original_price, cost_price, stock, sku, category, subcategory, images, features, specifications, status, is_featured, weight_kg, meta_title, meta_description, created_at, updated_at) VALUES
('p1', 'SWORD Smart RO', 'sword-smart-ro', 
 'India''s first dual-membrane Smart RO water purifier with NF+RO technology. 14-stage purification with real-time TDS monitoring, IoT connectivity, and 2-year comprehensive warranty. Made in India.', 
 'India''s first dual-membrane Smart RO with IoT. 14-stage purification.',
 2799900, 3999900, 1800000, 50, 'SWORD-RO-2025',
 'Water Purifiers', 'Smart RO',
 '["https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=800","https://images.unsplash.com/photo-1574333751897-d46fbae7f924?w=800"]',
 '["Dual-membrane NF+RO technology","14-stage purification","Real-time TDS monitoring","IoT connectivity with mobile app","2-year comprehensive warranty","Made in India"]',
 '{"Purification Stages": "14-Stage", "Filtration Type": "NF + RO Dual Membrane", "TDS Range": "50-2000 ppm", "Flow Rate": "15-20 Litres/Hour", "Storage Capacity": "10 Litres", "Power Consumption": "60W", "Voltage": "100-240V AC", "Weight": "12.5 kg", "Dimensions": "45 x 25 x 52 cm", "Warranty": "2 Years Comprehensive", "IoT Enabled": "Yes", "App Control": "SWORD App (iOS/Android)", "Certifications": "BIS, ISO 9001, CE, RoHS"}',
 'active', true, 12.5,
 'SWORD Smart RO — India''s First Dual-Membrane Smart Water Purifier',
 'Buy SWORD Smart RO - India''s first NF+RO dual-membrane smart water purifier with 14-stage purification, IoT connectivity, and real-time TDS monitoring.',
 NOW(), NOW()),

('p2', 'SWORD Smart RO Pro', 'sword-smart-ro-pro',
 'Premium variant with enhanced filtration, UV sterilization, and mineral enrichment. Includes lifetime AMC membership and priority customer support.',
 'Premium Smart RO with UV + Mineral enrichment. Lifetime AMC.',
 3499900, 4999900, 2200000, 35, 'SWORD-RO-PRO-2025',
 'Water Purifiers', 'Smart RO',
 '["https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=800"]',
 '["NF+RO+UV triple technology","Mineral enrichment cartridge","Lifetime AMC included","Priority support","Premium stainless steel finish","Digital touch display"]',
 '{"Purification Stages": "16-Stage", "Filtration Type": "NF + RO + UV", "TDS Range": "50-3000 ppm", "Flow Rate": "20-25 Litres/Hour", "Storage Capacity": "12 Litres", "Power Consumption": "80W", "Voltage": "100-240V AC", "Weight": "14.2 kg", "Dimensions": "48 x 28 x 55 cm", "Warranty": "3 Years Comprehensive", "IoT Enabled": "Yes", "AMC Included": "Lifetime"}',
 'active', true, 14.2,
 'SWORD Smart RO Pro — Premium NF+RO+UV Water Purifier with Lifetime AMC',
 'Premium SWORD Smart RO Pro with triple purification (NF+RO+UV), mineral enrichment, lifetime AMC, and priority support.',
 NOW(), NOW()),

('p3', 'SWORD Smart RO Lite', 'sword-smart-ro-lite',
 'Compact and affordable Smart RO for small families. 10-stage purification with essential IoT features. Perfect for apartments and small homes.',
 'Compact Smart RO for small families. 10-stage purification.',
 1999900, 2799900, 1400000, 40, 'SWORD-RO-LITE-2025',
 'Water Purifiers', 'Smart RO',
 '["https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=800"]',
 '["10-stage purification","Compact design for small kitchens","Basic IoT alerts","1-year warranty","Easy DIY filter replacement","Low power consumption"]',
 '{"Purification Stages": "10-Stage", "Filtration Type": "RO Single Membrane", "TDS Range": "100-1500 ppm", "Flow Rate": "10-12 Litres/Hour", "Storage Capacity": "7 Litres", "Power Consumption": "45W", "Voltage": "100-240V AC", "Weight": "8.5 kg", "Dimensions": "38 x 22 x 45 cm", "Warranty": "1 Year", "IoT Enabled": "Basic"}',
 'active', false, 8.5,
 'SWORD Smart RO Lite — Affordable Smart Water Purifier for Small Families',
 'Compact SWORD Smart RO Lite with 10-stage purification, ideal for apartments and small families.',
 NOW(), NOW()),

('p4', 'Sediment Filter (5 Micron)', 'sediment-filter-5-micron',
 'Pre-filter cartridge that removes dust, rust, sand, and suspended particles. Replace every 6 months for optimal performance.',
 'Pre-filter removes dust, rust, sand. Replace every 6 months.',
 49900, 79900, 25000, 200, 'FILTER-SED-5M',
 'Filters', 'Pre-filters',
 '["https://images.unsplash.com/photo-1617331721458-bd3bd3f9c7f8?w=800"]',
 '["5 micron filtration","Removes visible particles","Universal fit","Easy replacement","Food-grade material"]',
 '{"Micron Rating": "5 Micron", "Material": "Polypropylene", "Compatibility": "All SWORD models", "Replacement Interval": "6 months", "Dimensions": "10\" x 2.5\"", "Weight": "0.3 kg"}',
 'active', false, 0.3,
 'Sediment Filter 5 Micron — SWORD Smart RO Replacement Cartridge',
 '5 micron sediment filter cartridge for SWORD Smart RO. Removes dust, rust, sand. Replace every 6 months.',
 NOW(), NOW()),

('p5', 'Sediment Filter (1 Micron)', 'sediment-filter-1-micron',
 'Fine pre-filter that captures smaller particles after the 5-micron stage. Ensures protection for the RO membrane. Replace every 6-8 months.',
 'Fine pre-filter. Protects RO membrane. Replace every 6-8 months.',
 59900, 89900, 30000, 180, 'FILTER-SED-1M',
 'Filters', 'Pre-filters',
 '["https://images.unsplash.com/photo-1617331721458-bd3bd3f9c7f8?w=800"]',
 '["1 micron fine filtration","Protects RO membrane","Universal fit","Easy replacement","FDA approved material"]',
 '{"Micron Rating": "1 Micron", "Material": "Spun Polypropylene", "Compatibility": "All SWORD models", "Replacement Interval": "6-8 months", "Dimensions": "10\" x 2.5\"", "Weight": "0.3 kg"}',
 'active', false, 0.3,
 'Sediment Filter 1 Micron — Fine Pre-filter for SWORD Smart RO',
 '1 micron fine sediment filter cartridge for SWORD Smart RO. Protects the RO membrane. Replace every 6-8 months.',
 NOW(), NOW()),

('p6', 'Carbon Block Filter', 'carbon-block-filter',
 'Activated carbon block filter removes chlorine, VOCs, odors, and improves taste. Essential for protecting the RO membrane from chemical damage.',
 'Removes chlorine, VOCs, odors. Protects RO membrane.',
 69900, 99900, 35000, 150, 'FILTER-CB-10',
 'Filters', 'Carbon Filters',
 '["https://images.unsplash.com/photo-1617331721458-bd3bd3f9c7f8?w=800"]',
 '["Activated carbon block","Removes chlorine & VOCs","Improves taste & odor","Protects RO membrane","Easy twist-and-lock replacement"]',
 '{"Type": "Activated Carbon Block", "Material": "Coconut Shell Carbon", "Compatibility": "All SWORD models", "Replacement Interval": "8-12 months", "Dimensions": "10\" x 2.5\"", "Weight": "0.4 kg"}',
 'active', false, 0.4,
 'Carbon Block Filter — Activated Carbon Cartridge for SWORD Smart RO',
 'Activated carbon block filter for SWORD Smart RO. Removes chlorine, VOCs, odors, and improves water taste.',
 NOW(), NOW()),

('p7', 'RO Membrane (75 GPD)', 'ro-membrane-75-gpd',
 'High-quality thin-film composite RO membrane. Removes dissolved salts, heavy metals, fluoride, nitrates, and harmful chemicals. 75 GPD capacity.',
 'Thin-film composite membrane. Removes dissolved salts, heavy metals.',
 129900, 179900, 75000, 100, 'MEMB-RO-75',
 'Filters', 'Membranes',
 '["https://images.unsplash.com/photo-1617331721458-bd3bd3f9c7f8?w=800"]',
 '["Thin-film composite (TFC)","75 GPD capacity","Removes 99% dissolved salts","Fits all SWORD models","Long-lasting performance"]',
 '{"Type": "Thin Film Composite (TFC)", "Capacity": "75 GPD (Gallons Per Day)", "Rejection Rate": "97-99%", "Compatibility": "All SWORD models", "Replacement Interval": "12-18 months", "Dimensions": "Standard 1812", "Weight": "0.5 kg"}',
 'active', false, 0.5,
 'RO Membrane 75 GPD — Thin Film Composite for SWORD Smart RO',
 '75 GPD thin-film composite RO membrane for SWORD Smart RO. Removes 99% dissolved salts and heavy metals.',
 NOW(), NOW()),

('p8', 'NF Membrane', 'nf-membrane',
 'Nanofiltration membrane retains essential minerals while removing contaminants. Perfect for water with TDS below 500 ppm.',
 'Retains minerals, removes contaminants. For TDS < 500 ppm.',
 149900, 199900, 85000, 80, 'MEMB-NF-75',
 'Filters', 'Membranes',
 '["https://images.unsplash.com/photo-1617331721458-bd3bd3f9c7f8?w=800"]',
 '["Nanofiltration technology","Retains essential minerals","Removes bacteria & viruses","Softens water naturally","Energy efficient"]',
 '{"Type": "Nanofiltration (NF)", "Capacity": "75 GPD", "Mineral Retention": "Yes", "Compatibility": "Smart RO, Smart RO Pro", "Replacement Interval": "12-18 months", "Dimensions": "Standard 1812", "Weight": "0.5 kg"}',
 'active', false, 0.5,
 'NF Membrane — Nanofiltration Cartridge for SWORD Smart RO',
 'Nanofiltration membrane for SWORD Smart RO. Retains essential minerals while removing contaminants.',
 NOW(), NOW()),

('p9', 'UV Sterilization Lamp', 'uv-sterilization-lamp',
 'High-intensity UV-C lamp eliminates 99.99% of bacteria, viruses, and microorganisms. For use with Smart RO Pro model.',
 'UV-C lamp kills 99.99% bacteria and viruses. For Smart RO Pro.',
 89900, 129900, 50000, 120, 'UV-LAMP-11W',
 'Filters', 'UV Components',
 '["https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=800"]',
 '["UV-C 11W lamp","99.99% microorganism elimination","Easy snap-fit installation","LED indicator for status","Replace every 12 months"]',
 '{"Type": "UV-C Sterilization", "Power": "11W", "Efficiency": "99.99%", "Compatibility": "Smart RO Pro", "Replacement Interval": "12 months", "Weight": "0.2 kg"}',
 'active', false, 0.2,
 'UV Sterilization Lamp — UV-C for SWORD Smart RO Pro',
 'UV-C sterilization lamp for SWORD Smart RO Pro. Eliminates 99.99% of bacteria and viruses.',
 NOW(), NOW()),

('p10', 'Mineral Cartridge', 'mineral-cartridge',
 'Adds essential minerals (calcium, magnesium, potassium) back to purified water. Enhances taste and health benefits.',
 'Adds essential minerals. Enhances taste and health benefits.',
 79900, 119900, 45000, 100, 'MIN-CART-2025',
 'Filters', 'Post-filters',
 '["https://images.unsplash.com/photo-1617331721458-bd3bd3f9c7f8?w=800"]',
 '["Adds Ca, Mg, K minerals","Enhances water taste","Alkaline balance","Food-grade mineral balls","Replace every 6 months"]',
 '{"Type": "Mineral Enrichment", "Minerals Added": "Calcium, Magnesium, Potassium", "Compatibility": "All SWORD models", "Replacement Interval": "6 months", "Weight": "0.4 kg"}',
 'active', false, 0.4,
 'Mineral Cartridge — Essential Mineral Add-on for SWORD Smart RO',
 'Mineral cartridge for SWORD Smart RO. Adds essential minerals (Ca, Mg, K) back to purified water.',
 NOW(), NOW()),

('p11', 'Annual Filter Replacement Kit', 'annual-filter-kit',
 'Complete annual maintenance kit with all filters for 1 year. Includes 2x sediment filters, 2x carbon blocks, 1x RO membrane, 1x mineral cartridge.',
 'Complete 1-year filter kit. All filters included. Save 30%.',
 349900, 499900, 220000, 75, 'KIT-ANNUAL-2025',
 'Accessories', 'Filter Kits',
 '["https://images.unsplash.com/photo-1617331721458-bd3bd3f9c7f8?w=800"]',
 '["Complete 1-year supply","Fits all SWORD models","30% savings vs individual","Pre-scheduled replacement reminders","Free installation support"]',
 '{"Contents": "2x Sediment, 2x Carbon, 1x RO Membrane, 1x Mineral", "Duration": "12 months", "Compatibility": "All SWORD models", "Savings": "30%", "Weight": "2.5 kg"}',
 'active', true, 2.5,
 'Annual Filter Replacement Kit — 1 Year Supply for SWORD Smart RO',
 'Complete annual filter replacement kit for SWORD Smart RO. Includes all filters for 1 year. Save 30%.',
 NOW(), NOW()),

('p12', 'SMPS Power Adapter', 'smps-power-adapter',
 'Original 24V SMPS power adapter for SWORD Smart RO. Stable voltage output ensures consistent purification performance.',
 'Original 24V SMPS power adapter. Stable voltage output.',
 129900, 189900, 70000, 60, 'PWR-SMPS-24V',
 'Accessories', 'Spare Parts',
 '["https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=800"]',
 '["24V DC output","Overload protection","Short-circuit protection","Universal 100-240V input","1-year warranty"]',
 '{"Output": "24V DC 2.5A", "Input": "100-240V AC", "Type": "SMPS", "Compatibility": "All SWORD models", "Warranty": "1 Year", "Weight": "0.6 kg"}',
 'active', false, 0.6,
 'SMPS 24V Power Adapter — Original for SWORD Smart RO',
 'Original 24V SMPS power adapter for SWORD Smart RO water purifier.',
 NOW(), NOW());

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. COUPONS (4 coupons)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO coupons (id, code, type, value, min_order, usage_limit, used_count, expiry, is_active, created_at) VALUES
('c1', 'SWORD10', 'percent', 10, 0, 100, 12, '2025-12-31', true, NOW()),
('c2', 'FIRSTBUY', 'fixed', 50000, 500000, 50, 8, '2025-12-31', true, NOW()),
('c3', 'DIWALI20', 'percent', 20, 2000000, 30, 3, '2025-11-15', false, NOW()),
('c4', 'FREESHIP', 'free_shipping', 0, 2000000, 200, 45, '2025-12-31', true, NOW());

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. USERS (5 users including admin)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO users (id, name, email, phone, role, status, avatar, created_at) VALUES
('u1', 'Priyank Joshi', 'priyank.joshi@swordhome.com', '+919537797597', 'admin', 'active', 'https://ui-avatars.com/api/?name=Priyank+Joshi&background=FFD700&color=000', NOW()),
('u2', 'Rahul Sharma', 'rahul.sharma@example.com', '+919876543210', 'customer', 'active', 'https://ui-avatars.com/api/?name=Rahul+Sharma&background=1a365d&color=fff', NOW()),
('u3', 'Priya Patel', 'priya.patel@example.com', '+919876543211', 'customer', 'active', 'https://ui-avatars.com/api/?name=Priya+Patel&background=1a365d&color=fff', NOW()),
('u4', 'Amit Kumar', 'amit.kumar@example.com', '+919876543212', 'customer', 'inactive', 'https://ui-avatars.com/api/?name=Amit+Kumar&background=666&color=fff', NOW()),
('u5', 'Sneha Gupta', 'sneha.gupta@example.com', '+919876543213', 'customer', 'active', 'https://ui-avatars.com/api/?name=Sneha+Gupta&background=1a365d&color=fff', NOW());

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. ORDERS (3 sample orders)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO orders (id, user_id, customer_name, customer_email, customer_phone, address, city, state, pincode, status, payment_status, payment_method, subtotal, cgst, sgst, shipping, grand_total, razorpay_order_id, razorpay_payment_id, tracking_number, carrier, notes, created_at, updated_at) VALUES
('ord1', 'u2', 'Rahul Sharma', 'rahul.sharma@example.com', '+919876543210',
 '42 Green Park Colony', 'Ahmedabad', 'Gujarat', '380015',
 'delivered', 'paid', 'razorpay',
 2799900, 251991, 251991, 0, 3303882,
 'order_rahul_001', 'pay_rahul_001', 'AWB1234567890', 'Shiprocket',
 'Delivered on time. Customer happy.',
 NOW() - INTERVAL '7 days', NOW()),

('ord2', 'u3', 'Priya Patel', 'priya.patel@example.com', '+919876543211',
 '15 River View Apartments', 'Surat', 'Gujarat', '395001',
 'shipped', 'paid', 'razorpay',
 2799900, 251991, 251991, 0, 3303882,
 'order_priya_001', 'pay_priya_001', 'AWB1234567891', 'Shiprocket',
 'Dispatched. Estimated delivery in 2 days.',
 NOW() - INTERVAL '2 days', NOW()),

('ord3', 'u5', 'Sneha Gupta', 'sneha.gupta@example.com', '+919876543213',
 '78 Lotus Enclave', 'Vadodara', 'Gujarat', '390001',
 'processing', 'paid', 'cod',
 3499900, 314991, 314991, 0, 4129882,
 'order_sneha_001', NULL, 'AWB1234567892', 'Shiprocket',
 'Order confirmed. Preparing for dispatch.',
 NOW() - INTERVAL '1 day', NOW());

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. ORDER ITEMS
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO order_items (id, order_id, product_id, product_name, image, price, quantity, total) VALUES
('oi1', 'ord1', 'p1', 'SWORD Smart RO', 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=200', 2799900, 1, 2799900),
('oi2', 'ord2', 'p1', 'SWORD Smart RO', 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=200', 2799900, 1, 2799900),
('oi3', 'ord3', 'p2', 'SWORD Smart RO Pro', 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=200', 3499900, 1, 3499900);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. LEADS (3 sample leads)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO leads (id, name, email, phone, source, message, page_viewed, status, created_at) VALUES
('l1', 'Vikram Mehta', 'vikram.mehta@example.com', '+919876543214', 'chatbot', 'Interested in SWORD Smart RO for my apartment. Need EMI options.', '/product/p1', 'new', NOW() - INTERVAL '3 days'),
('l2', 'Neha Desai', 'neha.desai@example.com', '+919876543215', 'contact_form', 'Looking for dealership opportunity in Mumbai.', '/about', 'contacted', NOW() - INTERVAL '5 days'),
('l3', 'Rajesh Iyer', 'rajesh.iyer@example.com', '+919876543216', 'callback_request', 'Please call me back to discuss bulk order for my office.', '/shop', 'new', NOW() - INTERVAL '1 day');

-- ═══════════════════════════════════════════════════════════════════════════════
-- 7. SETTINGS (15 key settings)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO settings (key, value, created_at, updated_at) VALUES
('store_name', 'SWORD Smart Water', NOW(), NOW()),
('currency', 'INR', NOW(), NOW()),
('gst_number', '24ABCPJ1234Z1Z5', NOW(), NOW()),
('razorpay_key_id', '', NOW(), NOW()),
('razorpay_live_mode', 'false', NOW(), NOW()),
('shiprocket_token', '', NOW(), NOW()),
('shiprocket_channel_id', '', NOW(), NOW()),
('support_phone', '+91 95377 97597', NOW(), NOW()),
('support_email', 'priyank.joshi@swordhome.com', NOW(), NOW()),
('free_shipping_threshold', '2000000', NOW(), NOW()),
('flat_shipping_rate', '19900', NOW(), NOW()),
('store_tagline', 'India''s Smartest Water Purifier', NOW(), NOW()),
('meta_title', 'SWORD Smart Water — India''s First Dual-Membrane Smart RO', NOW(), NOW()),
('meta_description', 'Buy SWORD Smart RO water purifier. India''s first NF+RO dual-membrane smart purifier with 14-stage filtration, IoT connectivity, and real-time TDS monitoring.', NOW(), NOW()),
('contact_address', 'SWORD Home Appliances Pvt. Ltd., Ahmedabad, Gujarat, India', NOW(), NOW());

-- ═══════════════════════════════════════════════════════════════════════════════
-- 8. SUBSCRIPTION PLANS (4 plans)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO subscription_plans (id, name, slug, description, type, duration_months, price, original_price, features, is_active, created_at) VALUES
('sp1', 'Filter Replacement - Quarterly', 'filter-quarterly', 'Get all filters replaced every 3 months by certified technicians. Includes free health check-up.', 'filter', 3, 149900, 199900, '["Quarterly filter replacement","Free health check-up","Priority scheduling","15% off spare parts","WhatsApp support"]', true, NOW()),
('sp2', 'Filter Replacement - Bi-Annual', 'filter-biannual', 'Twice-a-year filter replacement with comprehensive system check. Best value for small families.', 'filter', 6, 249900, 349900, '["Bi-annual filter replacement","Comprehensive system check","Priority scheduling","20% off spare parts","Dedicated support line"]', true, NOW()),
('sp3', 'Filter Replacement - Annual', 'filter-annual', 'Complete annual maintenance with all filters replaced. Maximum savings and peace of mind.', 'filter', 12, 399900, 599900, '["Annual filter replacement","4 comprehensive checks","Priority scheduling","30% off spare parts","24/7 dedicated support","Free emergency visits (2)"]', true, NOW()),
('sp4', 'AMC Gold Plan', 'amc-gold', 'Annual Maintenance Contract with complete coverage. All repairs, replacements, and maintenance included.', 'amc', 12, 299900, 499900, '["Complete device coverage","Unlimited repairs","All parts included","Quarterly maintenance","Same-day service guarantee","Free reinstallation if shifted","Loaner device during repairs"]', true, NOW());

-- ═══════════════════════════════════════════════════════════════════════════════
-- 9. CMS PAGES (5 pages)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO cms_pages (id, title, slug, content, meta_title, meta_description, is_published, created_at, updated_at) VALUES
('cms1', 'About SWORD', 'about', 
'<h1>About SWORD Smart Water</h1><p>SWORD Home Appliances Pvt. Ltd. is a pioneering Indian company dedicated to solving India''s drinking water crisis through cutting-edge technology.</p><h2>Our Story</h2><p>Founded by Priyank Joshi, SWORD was born from a personal experience with water-borne illness in the family. This led to a mission: create India''s smartest water purification system.</p><h2>Our Technology</h2><p>Our patented dual-membrane NF+RO technology is the first of its kind in India, offering smart switching between filtration modes based on real-time water quality.</p>',
'About SWORD — India''s Smart Water Purification Company',
'Learn about SWORD Home Appliances, India''s first dual-membrane Smart RO water purifier company.',
true, NOW(), NOW()),

('cms2', 'Contact Us', 'contact',
'<h1>Contact SWORD</h1><p>We''re here to help! Reach out through any of the channels below.</p><h2>Customer Support</h2><p>Phone: +91 95377 97597</p><p>Email: priyank.joshi@swordhome.com</p><h2>Head Office</h2><p>SWORD Home Appliances Pvt. Ltd., Ahmedabad, Gujarat, India</p>',
'Contact SWORD — Customer Support & Inquiries',
'Contact SWORD Smart Water customer support. Phone, email, and office address.',
true, NOW(), NOW()),

('cms3', 'Shipping Policy', 'shipping-policy',
'<h1>Shipping Policy</h1><p>Free shipping on all orders above ₹20,000. Standard delivery within 5-7 business days across India.</p><h2>Delivery Timeline</h2><p>Metro cities: 3-5 days. Tier 2 cities: 5-7 days. Remote areas: 7-10 days.</p>',
'Shipping Policy — SWORD Smart Water',
'SWORD shipping policy. Free delivery above ₹20,000. All India delivery.',
true, NOW(), NOW()),

('cms4', 'Return Policy', 'return-policy',
'<h1>Return & Refund Policy</h1><p>7-day return window for unused products in original packaging. 2-year comprehensive warranty on all purifiers.</p><h2>Warranty</h2><p>All SWORD Smart RO purifiers come with a 2-year comprehensive warranty covering all parts and labor.</p>',
'Return Policy — SWORD Smart Water',
'SWORD return and refund policy. 7-day returns. 2-year warranty.',
true, NOW(), NOW()),

('cms5', 'Privacy Policy', 'privacy-policy',
'<h1>Privacy Policy</h1><p>SWORD Home Appliances Pvt. Ltd. is committed to protecting your privacy. We collect only essential information needed to process your orders and provide support.</p><h2>Data Collection</h2><p>We collect: name, email, phone, address, and order history. We do NOT store payment information.</p>',
'Privacy Policy — SWORD Smart Water',
'SWORD privacy policy. Learn how we protect your personal data.',
true, NOW(), NOW());

-- ═══════════════════════════════════════════════════════════════════════════════
-- 10. BANNERS (3 banners)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO banners (id, title, subtitle, image, link, position, is_active, sort_order, created_at) VALUES
('b1', 'Diwali Special Offer', 'Get 20% off on SWORD Smart RO. Limited time offer!', 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=1600', '/product/p1', 'home_hero', true, 1, NOW()),
('b2', 'Filter Replacement Kits', 'Stock up and save 30% on annual filter kits. Free shipping!', 'https://images.unsplash.com/photo-1617331721458-bd3bd3f9c7f8?w=1600', '/shop?category=Accessories', 'home_featured', true, 2, NOW()),
('b3', 'AMC Gold Plan', 'Complete peace of mind with unlimited repairs and maintenance.', 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=1600', '/subscriptions', 'home_bottom', true, 3, NOW());

-- Re-enable triggers
SET session_replication_role = 'origin';

-- ═══════════════════════════════════════════════════════════════════════════════
-- ✅ SEED COMPLETE!
-- All tables populated: 12 products, 4 coupons, 5 users, 3 orders, 3 leads, 
-- 15 settings, 4 subscription plans, 5 CMS pages, 3 banners
-- ═══════════════════════════════════════════════════════════════════════════════
