-- ============================================================================
-- GULBARGA MULTI-VENDOR SEED DATA
-- English & Hindi Localized Restaurants, Groceries & Test Users
-- ============================================================================

-- Test Users
INSERT INTO users (id, name, phone, email, role, preferred_language, is_active, is_blocked)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', 'Rahul Patil', '9876543210', 'rahul.patil@gulbarga.in', 'customer', 'en', true, false),
  ('a0000000-0000-0000-0000-000000000002', 'Basavaraj Biradar', '9876543211', 'basavaraj@annapurna.in', 'vendor', 'hi', true, false),
  ('a0000000-0000-0000-0000-000000000003', 'Vijay Kumar', '9876543212', 'vijay.delivery@gulbarga.in', 'delivery', 'en', true, false),
  ('a0000000-0000-0000-0000-000000000004', 'System Admin', '9876543213', 'admin@gulbargaquickbite.in', 'admin', 'en', true, false)
ON CONFLICT (phone) DO NOTHING;

-- Delivery Partner Record
INSERT INTO delivery_partners (id, user_id, vehicle_type, vehicle_number, is_online, current_latitude, current_longitude, total_deliveries, avg_rating, earnings_balance)
VALUES
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'Hero Splendor Plus', 'KA-32-EA-4521', true, 17.3325, 76.8360, 142, 4.88, 1250.00)
ON CONFLICT DO NOTHING;

-- Categories
INSERT INTO categories (id, name_en, name_hi, type, icon_url, display_order)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Gulbarga Specials', 'गुलबर्गा स्पेशल', 'food', 'utensils', 1),
  ('c0000000-0000-0000-0000-000000000002', 'Biryani & Tahari', 'बिरयानी और तहरी', 'food', 'flame', 2),
  ('c0000000-0000-0000-0000-000000000003', 'North Karnataka Veg', 'उत्तर कर्नाटक शुद्ध शाकाहारी', 'food', 'leaf', 3),
  ('c0000000-0000-0000-0000-000000000004', 'Desserts & Shakes', 'मिठाई और शेक्स', 'food', 'cup-soda', 4),
  ('c0000000-0000-0000-0000-000000000005', 'Atta, Rice & Dal', 'आटा, चावल और दाल', 'grocery', 'wheat', 1),
  ('c0000000-0000-0000-0000-000000000006', 'Spices & Masalas', 'मसाले और तड़का', 'grocery', 'sparkles', 2),
  ('c0000000-0000-0000-0000-000000000007', 'Edible Oils & Ghee', 'खाने का तेल और शुद्ध घी', 'grocery', 'droplet', 3),
  ('c0000000-0000-0000-0000-000000000008', 'Fresh Farm Vegetables', 'ताजी सब्जियां', 'grocery', 'carrot', 4),
  ('c0000000-0000-0000-0000-000000000009', 'Dairy, Milk & Bread', 'डेयरी, दूध और ब्रेड', 'grocery', 'milk', 5),
  ('c0000000-0000-0000-0000-000000000010', 'Snacks & Namkeen', 'स्नैक्स और नमकीन', 'grocery', 'cookie', 6)
ON CONFLICT DO NOTHING;

-- Stores in Gulbarga
INSERT INTO stores (id, legacy_id, name_en, name_hi, description_en, description_hi, type, category, address, latitude, longitude, phone, logo_url, cover_image_url, avg_rating, total_ratings, delivery_radius_km, avg_prep_time_minutes, min_order_value, is_active, is_accepting_orders, source)
VALUES
  (
    's0000000-0000-0000-0000-000000000001',
    'EXT_REST_001',
    'Hotel Heritage Gulbarga',
    'होटल हेरिटेज गुलबर्गा',
    'Legendary Gulbarga Mutton Tahari, Dum Biryani and Tandoori delights on Sedam Road',
    'सेडम रोड पर प्रसिद्ध गुलबर्गा मटन तहरी, दम बिरयानी और तंदूरी व्यंजन',
    'restaurant',
    'Gulbarga Specials & Mughlai',
    'Plot 14, Sedam Road, near Central Bus Stand, Gulbarga, Karnataka 585105',
    17.3340, 76.8402,
    '+918472251010',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=300&q=80',
    'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=1000&q=80',
    4.7, 1840, 7.5, 25, 149.00, true, true, 'external'
  ),
  (
    's0000000-0000-0000-0000-000000000002',
    'EXT_REST_002',
    'Annapurna Jolada Rotti Meals',
    'अन्नपूर्णा जोलद रोट्टी भोजन',
    'Authentic North Karnataka Jowar Rotti, Yennegai (Brinjal curry), Shenga Chutney and Junka',
    'पारंपरिक उत्तर कर्नाटक ज्वार की रोटी, येन्नेगाई (बैंगन करी), शेंगा चटनी और झुनका',
    'restaurant',
    'North Karnataka Pure Veg',
    'Main Road, Super Market, Khuba Plot, Gulbarga, Karnataka 585101',
    17.3280, 76.8285,
    '+918472234050',
    'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=300&q=80',
    'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=1000&q=80',
    4.8, 2450, 6.0, 20, 99.00, true, true, 'external'
  ),
  (
    's0000000-0000-0000-0000-000000000003',
    'EXT_REST_003',
    'New Taj Darbar & Sweets',
    'न्यू ताज दरबार और मिष्ठान',
    'Traditional Gulbarga Sheermal, Dum Biryani, Chicken Tikka and Gulbarga Halwa',
    'पारंपरिक गुलबर्गा शीरमाल, दम बिरयानी, चिकन टिक्का और प्रसिद्ध गुलबर्गा हलवा',
    'restaurant',
    'Biryani & Kebabs',
    'Station Road, Near Railway Station, Gulbarga, Karnataka 585102',
    17.3395, 76.8480,
    '+918472267890',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&q=80',
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1000&q=80',
    4.5, 980, 8.0, 30, 199.00, true, true, 'external'
  ),
  (
    's0000000-0000-0000-0000-000000000004',
    'EXT_GROC_001',
    'Gulbarga Super Kirana & Dal Mart',
    'गुलबर्गा सुपर किराना और दाल मार्ट',
    'Direct from APMC mandi GI-tagged Gulbarga Toor Dal, fresh farm grains, oils and everyday essentials',
    'एपीएमसी मंडी से सीधे जीआई-टैग गुलबर्गा तूर दाल, ताजे अनाज, तेल और दैनिक घरेलू जरूरतें',
    'grocery',
    'Wholesale Kirana & Supermarket',
    'APMC Yard, Sedam Road, Gulbarga, Karnataka 585105',
    17.3310, 76.8450,
    '+918472288120',
    'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=300&q=80',
    'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1000&q=80',
    4.9, 3120, 10.0, 15, 149.00, true, true, 'external'
  ),
  (
    's0000000-0000-0000-0000-000000000005',
    'EXT_GROC_002',
    'Nandini Milk & Fresh Farm Mart',
    'नंदिनी मिल्क और फ्रेश फार्म मार्ट',
    'Fresh Karnataka KMF Nandini Dairy milk, butter, paneer, and morning farm harvest vegetables',
    'ताजा केएमएफ नंदिनी डेयरी दूध, मक्खन, पनीर और सुबह की ताजी सब्जियां',
    'grocery',
    'Dairy & Daily Greens',
    'MSK Mill Road, Bhavani Nagar, Gulbarga, Karnataka 585103',
    17.3240, 76.8210,
    '+918472299440',
    'https://images.unsplash.com/photo-1528732263440-4dd1a18a4cc2?w=300&q=80',
    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1000&q=80',
    4.8, 1450, 6.0, 10, 49.00, true, true, 'external'
  )
ON CONFLICT DO NOTHING;
