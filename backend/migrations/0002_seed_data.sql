-- Seed Data for Wedding Feast Platform

-- 1. Admin User: admin / Admin@123
-- SHA-256 hash for 'Admin@123' is e86f78a8a3caf0b60d8e74e5942aa6d86dc150cd3c03338aef25b7d2d7e3acc7
INSERT OR IGNORE INTO admin_users (id, username, email, password_hash, role, full_name)
VALUES (
  'usr_admin_001',
  'admin',
  'admin@weddingfeast.com',
  'e86f78a8a3caf0b60d8e74e5942aa6d86dc150cd3c03338aef25b7d2d7e3acc7',
  'admin',
  'Royal Admin'
);

-- 2. Estimation Settings
INSERT OR IGNORE INTO estimation_settings (
  id, setting_key, default_serving_quantity, currency, currency_symbol,
  service_charge_rate, service_charge_enabled,
  transportation_charge, transportation_enabled,
  gst_rate, gst_enabled, min_guests, is_active
) VALUES (
  'cfg_default_001',
  'default',
  100,
  'INR',
  '₹',
  5.0,
  1,
  200000, -- ₹2,000 in paise
  1,
  5.0,
  1,
  50,
  1
);

-- 3. Food Categories
INSERT OR IGNORE INTO food_categories (id, name, description, image_url, display_order, status) VALUES
('cat_tiffin', 'Traditional Tiffin & Breakfast', 'Authentic South Indian wedding tiffin, crisp dosas, soft idlis and vadas', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80', 0, 'active'),
('cat_starters', 'Starters', 'Crisp appetizers and royal welcome finger bites', 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80', 1, 'active'),
('cat_main_course', 'Main Course', 'Rich curries, paneer gravies and artisanal dal preparation', 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80', 2, 'active'),
('cat_biryani', 'Rice & Biryani', 'Fragrant basmati dum biryanis and seasoned pulao varieties', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80', 3, 'active'),
('cat_breads', 'Breads', 'Fresh tandoori naans, kulchas, roti and stuffed parathas', 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80', 4, 'active'),
('cat_desserts', 'Desserts', 'Luscious traditional puddings, halwas and warm sweets', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80', 5, 'active'),
('cat_beverages', 'Beverages', 'Chilled royal mocktails, lassi, spiced chaas and sharbats', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80', 6, 'active'),
('cat_live_counters', 'Live Counters', 'Interactive live chaat, dosa, pasta and sizzler stations', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80', 7, 'active'),
('cat_ice_creams', 'Ice Creams', 'Artisanal scoops, kulfi pots and falooda creations', 'https://images.unsplash.com/photo-1560008581-09826d1de69e?auto=format&fit=crop&w=600&q=80', 8, 'active'),
('cat_sweets', 'Traditional Sweets', 'Heritage ghee mithais, laddoos, pedas and rasgullas', 'https://images.unsplash.com/photo-1605197584547-c93de1a4286b?auto=format&fit=crop&w=600&q=80', 9, 'active');

-- 4. Dishes
-- Prices in paise: ₹80 = 8000, ₹70 = 7000, ₹90 = 9000, ₹120 = 12000, ₹100 = 10000, ₹160 = 16000, ₹35 = 3500, ₹45 = 4500, ₹60 = 6000
INSERT OR IGNORE INTO dishes (id, name, category_id, description, food_type, price_per_person, quantity_per_person, serving_unit, min_order_quantity, prep_time, availability) VALUES
('dish_paneer_tikka', 'Paneer Tikka', 'cat_starters', 'Tender cubes of malai paneer marinated in royal tandoori spices and charred over charcoal.', 'veg', 8000, 100, 'g', 50, '20 mins', 1),
('dish_gobi_65', 'Gobi 65', 'cat_starters', 'Crispy cauliflower florets tossed with curry leaves, crushed pepper and southern spices.', 'veg', 7000, 100, 'g', 50, '15 mins', 1),
('dish_chicken_65', 'Chicken 65', 'cat_starters', 'Spicy, deep-fried chicken cubes bursting with red chili, ginger, garlic and fragrant curry leaves.', 'non-veg', 9000, 100, 'g', 50, '20 mins', 1),
('dish_paneer_butter_masala', 'Paneer Butter Masala', 'cat_main_course', 'Rich and creamy paneer cooked in velvety tomato gravy with cashews, butter and kasuri methi.', 'veg', 12000, 120, 'g', 50, '25 mins', 1),
('dish_dal_makhani', 'Dal Makhani', 'cat_main_course', 'Slow-cooked black lentils simmered overnight with butter, cream, and aromatic Kashmiri spices.', 'veg', 8000, 100, 'g', 50, '30 mins', 1),
('dish_mutton_rogan_josh', 'Mutton Rogan Josh', 'cat_main_course', 'Tender lamb cuts slow-braised in a Persian-Kashmiri aromatic gravy of ratan jot, fennel and curd.', 'non-veg', 22000, 150, 'g', 50, '45 mins', 1),
('dish_veg_biryani', 'Vegetable Biryani', 'cat_biryani', 'Fragrant aged Basmati rice layered with garden fresh vegetables, saffron milk and shahi spices.', 'veg', 10000, 150, 'g', 50, '30 mins', 1),
('dish_chicken_biryani', 'Dum Chicken Biryani', 'cat_biryani', 'Royal Awadhi-style dum biryani with succulent bone-in chicken marinated in yogurt and saffron.', 'non-veg', 16000, 180, 'g', 50, '35 mins', 1),
('dish_butter_naan', 'Butter Naan', 'cat_breads', 'Traditional leavened clay oven bread brushed generously with pure butter.', 'veg', 3500, 60, 'g', 50, '10 mins', 1),
('dish_tandoori_roti', 'Tandoori Roti', 'cat_breads', 'Whole wheat flatbread blistered crisp and soft directly on clay oven walls.', 'vegan', 2500, 50, 'g', 50, '10 mins', 1),
('dish_gulab_jamun', 'Gulab Jamun', 'cat_desserts', 'Golden fried khoya milk spheres soaked in cardamom and rose water infused sugar syrup.', 'veg', 4500, 50, 'g', 50, '15 mins', 1),
('dish_rasmalai', 'Rasmalai', 'cat_sweets', 'Spongy chhena dumplings soaked in thickened saffron-infused pistachio milk.', 'veg', 6000, 70, 'g', 50, '15 mins', 1),
('dish_mango_lassi', 'Mango Lassi', 'cat_beverages', 'Smooth, refreshing blend of sweet Alphonso mangoes and hung curd topped with cardamom.', 'veg', 4000, 150, 'ml', 50, '10 mins', 1),
('dish_live_chaat', 'Live Chaat Counter', 'cat_live_counters', 'Fresh Pani Puri, Sev Puri, Dahi Bhalla and Papdi Chaat assembled live before guests.', 'veg', 7500, 120, 'g', 50, '15 mins', 1),
('dish_kulfi_falooda', 'Kulfi Falooda', 'cat_ice_creams', 'Matka malai kulfi sliced with rose falooda noodles, sabja seeds and rose syrup.', 'veg', 5500, 80, 'g', 50, '10 mins', 1),
('dish_idly', 'Steamed Ghee Podi Idly', 'cat_tiffin', 'Steamed melt-in-mouth button rice cakes tossed in aromatic gunpowder podi and pure cow ghee.', 'veg', 3000, 2, 'pcs', 50, '15 mins', 1),
('dish_vada', 'Crisp Medu Vada', 'cat_tiffin', 'Golden-fried spiced lentil fritters with crispy golden crust and fluffy interior, served with coconut chutney.', 'veg', 2500, 1, 'pcs', 50, '15 mins', 1),
('dish_dosa', 'Live Ghee Roast Masala Dosa', 'cat_tiffin', 'Crisp fermented crepe roasted in golden ghee, folded with mildly spiced potato masala, crafted live.', 'veg', 5500, 1, 'pcs', 50, '10 mins', 1),
('dish_filter_coffee', 'Kumbakonam Degree Filter Coffee', 'cat_beverages', 'Traditional decoction brewed dark with chicory-infused Arabica beans, frothed in brass dabarah-tumbler.', 'veg', 2500, 100, 'ml', 50, '5 mins', 1);

-- 5. Dish Images
INSERT OR IGNORE INTO dish_images (id, dish_id, image_r2_key, image_url, is_primary, display_order, file_name, mime_type) VALUES
('img_pt_1', 'dish_paneer_tikka', 'dishes/paneer_tikka_1.jpg', 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80', 1, 1, 'paneer_tikka.jpg', 'image/jpeg'),
('img_pt_2', 'dish_paneer_tikka', 'dishes/paneer_tikka_2.jpg', 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80', 0, 2, 'paneer_tikka_side.jpg', 'image/jpeg'),
('img_gobi_1', 'dish_gobi_65', 'dishes/gobi_65_1.jpg', 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80', 1, 1, 'gobi_65.jpg', 'image/jpeg'),
('img_c65_1', 'dish_chicken_65', 'dishes/chicken_65_1.jpg', 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80', 1, 1, 'chicken_65.jpg', 'image/jpeg'),
('img_pbm_1', 'dish_paneer_butter_masala', 'dishes/pbm_1.jpg', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80', 1, 1, 'pbm.jpg', 'image/jpeg'),
('img_pbm_2', 'dish_paneer_butter_masala', 'dishes/pbm_2.jpg', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80', 0, 2, 'pbm_pot.jpg', 'image/jpeg'),
('img_dal_1', 'dish_dal_makhani', 'dishes/dal_makhani_1.jpg', 'https://images.unsplash.com/photo-1546833998-877b37c2e5c4?auto=format&fit=crop&w=600&q=80', 1, 1, 'dal_makhani.jpg', 'image/jpeg'),
('img_mutton_1', 'dish_mutton_rogan_josh', 'dishes/mutton_1.jpg', 'https://images.unsplash.com/photo-1545247181-516773ca83f3?auto=format&fit=crop&w=600&q=80', 1, 1, 'rogan_josh.jpg', 'image/jpeg'),
('img_biryani_1', 'dish_veg_biryani', 'dishes/veg_biryani_1.jpg', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80', 1, 1, 'veg_biryani.jpg', 'image/jpeg'),
('img_biryani_2', 'dish_veg_biryani', 'dishes/veg_biryani_2.jpg', 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80', 0, 2, 'veg_biryani_pot.jpg', 'image/jpeg'),
('img_cb_1', 'dish_chicken_biryani', 'dishes/chicken_biryani_1.jpg', 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&q=80', 1, 1, 'chicken_biryani.jpg', 'image/jpeg'),
('img_naan_1', 'dish_butter_naan', 'dishes/naan_1.jpg', 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80', 1, 1, 'butter_naan.jpg', 'image/jpeg'),
('img_gj_1', 'dish_gulab_jamun', 'dishes/gj_1.jpg', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80', 1, 1, 'gulab_jamun.jpg', 'image/jpeg'),
('img_ras_1', 'dish_rasmalai', 'dishes/ras_1.jpg', 'https://images.unsplash.com/photo-1605197584547-c93de1a4286b?auto=format&fit=crop&w=600&q=80', 1, 1, 'rasmalai.jpg', 'image/jpeg'),
('img_lassi_1', 'dish_mango_lassi', 'dishes/lassi_1.jpg', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80', 1, 1, 'mango_lassi.jpg', 'image/jpeg');

-- 6. Recipes
INSERT OR IGNORE INTO recipes (id, dish_id, title, description, cooking_time, prep_time, servings) VALUES
('rcp_veg_biryani', 'dish_veg_biryani', 'Royal Vegetable Dum Biryani', 'Traditional royal Nizami layered aromatic rice cooked under sealed dum.', 30, 15, 10),
('rcp_paneer_tikka', 'dish_paneer_tikka', 'Tandoori Paneer Tikka Feast', 'Classic smoked cottage cheese infused with mustard oil, hung curd, and roasted carom seeds.', 20, 15, 8),
('rcp_pbm', 'dish_paneer_butter_masala', 'Shahi Paneer Butter Masala', 'Smooth tomato makhani with cashew paste, fresh cottage cheese and generous butter.', 25, 15, 10);

-- 7. Recipe Ingredients
INSERT OR IGNORE INTO recipe_ingredients (id, recipe_id, name, quantity, unit, notes, display_order) VALUES
('ing_vb_1', 'rcp_veg_biryani', 'Basmati Rice', 500, 'g', 'Extra long grain aged rice', 1),
('ing_vb_2', 'rcp_veg_biryani', 'Mixed Vegetables', 250, 'g', 'Carrots, beans, green peas, cauliflower', 2),
('ing_vb_3', 'rcp_veg_biryani', 'Onions', 100, 'g', 'Thinly sliced and golden fried (birista)', 3),
('ing_vb_4', 'rcp_veg_biryani', 'Tomatoes', 100, 'g', 'Finely diced fresh ripe tomatoes', 4),
('ing_vb_5', 'rcp_veg_biryani', 'Desi Ghee & Saffron', 50, 'g', 'Infused in warm whole milk', 5),
('ing_pt_1', 'rcp_paneer_tikka', 'Malai Paneer', 400, 'g', 'Cut into 1.5-inch cubes', 1),
('ing_pt_2', 'rcp_paneer_tikka', 'Hung Curd', 150, 'g', 'Whisked smooth with roasted gram flour', 2),
('ing_pt_3', 'rcp_paneer_tikka', 'Bell Peppers & Onion', 100, 'g', 'Diced into square petals', 3),
('ing_pt_4', 'rcp_paneer_tikka', 'Tandoori Masala & Mustard Oil', 30, 'g', 'Cold-pressed mustard oil', 4);

-- 8. Recipe Steps
INSERT OR IGNORE INTO recipe_steps (id, recipe_id, step_number, instruction) VALUES
('step_vb_1', 'rcp_veg_biryani', 1, 'Wash and soak basmati rice for 30 minutes. Parboil with whole garam masalas till 70% done.'),
('step_vb_2', 'rcp_veg_biryani', 2, 'Prepare masala with vegetables, ginger-garlic paste, yogurt, mint and coriander.'),
('step_vb_3', 'rcp_veg_biryani', 3, 'Layer rice over vegetables, sprinkle birista, saffron milk, ghee and cook on low flame under sealed dum for 20 mins.'),
('step_pt_1', 'rcp_paneer_tikka', 1, 'Whisk hung curd with spices, roasted besan, mustard oil, ginger-garlic paste and salt.'),
('step_pt_2', 'rcp_paneer_tikka', 2, 'Gently coat paneer cubes and veggies in marinade. Rest for minimum 30 minutes in chiller.'),
('step_pt_3', 'rcp_paneer_tikka', 3, 'Skewer paneer and vegetables alternatingly. Roast in hot tandoor or grill at 220°C for 10-12 minutes until lightly charred.');

-- 9. Sample Events & Customer Selections
INSERT OR IGNORE INTO events (id, customer_name, customer_phone, customer_email, event_name, event_type, event_date, venue, guest_count, status) VALUES
('evt_001', 'Radhika & Arjun', '+91 98765 43210', 'arjun.radhika@example.com', 'Radhika & Arjun Wedding', 'Wedding', '2026-12-15', 'Grand Palace Banquet Hall, Bangalore', 350, 'confirmed'),
('evt_002', 'Priya & Vikram', '+91 98451 12345', 'vikram.priya@example.com', 'Grand Reception Event', 'Reception', '2026-12-20', 'Royal Orchid Convention Center', 250, 'pending'),
('evt_003', 'Sneha & Rohan', '+91 97400 98765', 'rohan.sneha@example.com', 'Sangeet Night Celebration', 'Sangeet', '2026-12-28', 'Taj Gateway Lawns', 180, 'confirmed');

-- 10. Sample Customer Selections
INSERT OR IGNORE INTO customer_selections (id, event_id, subtotal, service_charge, transportation_charge, gst_amount, grand_total, cost_per_guest, status) VALUES
('sel_001', 'evt_001', 9450000, 472500, 200000, 496125, 10618625, 30338, 'approved'),
('sel_002', 'evt_002', 6500000, 325000, 200000, 341250, 7366250, 29465, 'submitted');

INSERT OR IGNORE INTO customer_selection_items (id, selection_id, dish_id, dish_name, category_name, price_per_person, quantity_per_person, serving_unit, total_guest_count, total_calculated_quantity, total_dish_cost) VALUES
('sel_item_1', 'sel_001', 'dish_paneer_tikka', 'Paneer Tikka', 'Starters', 8000, 100, 'g', 350, 35000, 2800000),
('sel_item_2', 'sel_001', 'dish_paneer_butter_masala', 'Paneer Butter Masala', 'Main Course', 12000, 120, 'g', 350, 42000, 4200000),
('sel_item_3', 'sel_001', 'dish_veg_biryani', 'Vegetable Biryani', 'Rice & Biryani', 10000, 150, 'g', 350, 52500, 3500000),
('sel_item_4', 'sel_001', 'dish_butter_naan', 'Butter Naan', 'Breads', 3500, 60, 'g', 350, 21000, 1225000),
('sel_item_5', 'sel_001', 'dish_gulab_jamun', 'Gulab Jamun', 'Desserts', 4500, 50, 'g', 350, 17500, 1575000);
