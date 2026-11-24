-- ==============================================================================
-- 0005_expanded_wedding_menu_and_settings.sql
-- Royal Wedding Feast: Expanded Categories, Signature Dishes, Multi-Angle Galleries,
-- Authentic Recipes, and Catering Estimation Settings
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. UPDATE & EXPAND ESTIMATION SETTINGS
-- ------------------------------------------------------------------------------
INSERT INTO estimation_settings (
  id, setting_key, default_serving_quantity, currency, currency_symbol,
  service_charge_rate, service_charge_enabled,
  transportation_charge, transportation_enabled,
  gst_rate, gst_enabled, min_guests, is_active, updated_at
) VALUES (
  'cfg_default_001',
  'default',
  100,
  'INR',
  '₹',
  10.0,             -- 10% hospitality & catering service charge
  1,
  300000,           -- ₹3,000 transportation & logistics in paise
  1,
  5.0,              -- 5% GST on catering services
  1,
  50,               -- Minimum guest order
  1,
  datetime('now')
) ON CONFLICT(id) DO UPDATE SET
  service_charge_rate = 10.0,
  service_charge_enabled = 1,
  transportation_charge = 300000,
  transportation_enabled = 1,
  gst_rate = 5.0,
  gst_enabled = 1,
  min_guests = 50,
  updated_at = datetime('now');

-- ------------------------------------------------------------------------------
-- 2. NEW & EXPANDED FOOD CATEGORIES
-- ------------------------------------------------------------------------------
INSERT INTO food_categories (id, name, description, image_url, display_order, status, is_deleted) VALUES
('cat_welcome_drinks', 'Welcome Drinks & Coolers', 'Royal welcome mocktails, infused tenders, spiced coolers and saffron sherbats', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80', 0, 'active', 0),
('cat_tiffin', 'Traditional Tiffin & Breakfast', 'Authentic South Indian wedding tiffin, crisp dosas, soft idlis and vadas', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80', 1, 'active', 0),
('cat_starters', 'Royal Appetizers & Starters', 'Crisp charcoal tikkas, golden fritters and royal finger bites', 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80', 2, 'active', 0),
('cat_main_course', 'Grand Curries & Gravies', 'Rich cottage cheese makhani, dal slow-simmers and regal vegetable kormas', 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80', 3, 'active', 0),
('cat_south_feasts', 'Traditional Sadya & South Specialties', 'Authentic Chettinad, Malabar avial, bisibelebath and banana-leaf delights', 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80', 4, 'active', 0),
('cat_biryani', 'Royal Rice & Dum Biryanis', 'Fragrant aged Basmati dum biryanis, saffron pulao and curd rice tempering', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80', 5, 'active', 0),
('cat_breads', 'Tandoori Breads & Naans', 'Freshly baked garlic naans, butter kulchas, roomali rotis and parathas', 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80', 6, 'active', 0),
('cat_live_counters', 'Interactive Live Stations', 'Live chaat carts, fresh dosas, sizzling pasta and hot jalebi counters', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80', 7, 'active', 0),
('cat_desserts', 'Heritage Sweets & Halwas', 'Warm ghee halwas, gulab jamuns, shahi tukdas and rich milk desserts', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80', 8, 'active', 0),
('cat_sweets', 'Artisanal Mithais & Rasmalai', 'Soft chenna delicacies, kaju katli, Mysore pak and saffron rasmalai', 'https://images.unsplash.com/photo-1605197584547-c93de1a4286b?auto=format&fit=crop&w=800&q=80', 9, 'active', 0),
('cat_ice_creams', 'Kulfi, Ice Creams & Falooda', 'Matka malai kulfi, rabdi faloodas and artisanal churned scoops', 'https://images.unsplash.com/photo-1560008581-09826d1de69e?auto=format&fit=crop&w=800&q=80', 10, 'active', 0),
('cat_paan_digestives', 'Royal Paan & Digestives', 'Banarasi meetha paan, Calcutta mukhwas, silver-foiled digestives & gulkand paan', 'https://images.unsplash.com/photo-1546833998-877b37c2e5c4?auto=format&fit=crop&w=800&q=80', 11, 'active', 0)
ON CONFLICT(id) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  image_url = excluded.image_url,
  display_order = excluded.display_order,
  status = excluded.status;

-- ------------------------------------------------------------------------------
-- 3. EXPANDED SIGNATURE WEDDING DISHES
-- ------------------------------------------------------------------------------
INSERT INTO dishes (id, name, category_id, description, food_type, price_per_person, quantity_per_person, serving_unit, min_order_quantity, prep_time, availability, is_deleted) VALUES

-- Welcome Drinks
('dish_tender_coconut_punch', 'Elaneer Payasam & Tender Coconut Cooler', 'cat_welcome_drinks', 'Fresh tender coconut water blended with soft coconut pulp, cardamom and a touch of condensed milk.', 'veg', 4500, 150, 'ml', 50, '10 mins', 1, 0),
('dish_rose_sharbat', 'Shahi Gulab Saffron Sherbat', 'cat_welcome_drinks', 'Chilled Damascus rose distillate infused with Kashmiri saffron strands, basil seeds and fresh mint.', 'veg', 3500, 150, 'ml', 50, '5 mins', 1, 0),
('dish_kokum_cooler', 'Spiced Kokum & Cumin Cooler', 'cat_welcome_drinks', 'Zesty coastal kokum fruit extract infused with roasted cumin, rock salt, mint sprigs and sparkling water.', 'vegan', 3000, 150, 'ml', 50, '5 mins', 1, 0),

-- Starters & Appetizers
('dish_hara_bhara_kabab', 'Shahi Hara Bhara Kabab', 'cat_starters', 'Pan-seared spinach, green pea and potato patties centered with spiced cashew nuts, served with mint chutney.', 'veg', 5000, 2, 'pcs', 50, '15 mins', 1, 0),
('dish_spring_rolls', 'Crisp Vegetable Gold Spring Rolls', 'cat_starters', 'Crispy hand-rolled wanton crepes stuffed with shredded wok-tossed cabbage, carrots and bell peppers with sweet chili dip.', 'vegan', 4000, 2, 'pcs', 50, '15 mins', 1, 0),
('dish_malai_tikka', 'Murgh Malai Tikka', 'cat_starters', 'Boneless chicken chunks marinated in cream cheese, green cardamom, white pepper and garlic, charred in tandoor.', 'non-veg', 11000, 3, 'pcs', 50, '20 mins', 1, 0),
('dish_fish_amritsari', 'Crispy Amritsari Fish Fry', 'cat_starters', 'Delicate freshwater fish fillets coated in carom seed spiced gram flour batter, fried crisp and sprinkled with chaat masala.', 'non-veg', 13000, 2, 'pcs', 50, '15 mins', 1, 0),

-- South Specialties & Sadya
('dish_bisibelebath', 'Mysore Ghee Bisibelebath', 'cat_south_feasts', 'Classic Karnataka rice, toor dal and assorted vegetables simmered in hand-ground aromatic spice blend, finished with ghee-roasted cashews and boondi.', 'veg', 6000, 150, 'g', 50, '25 mins', 1, 0),
('dish_avial', 'Malabar Coconut Milk Avial', 'cat_south_feasts', 'Traditional melange of 9 garden vegetables simmered gently in thick coconut paste, green chilies, yogurt and curry leaves drizzled with virgin coconut oil.', 'veg', 5000, 100, 'g', 50, '20 mins', 1, 0),
('dish_chettinad_chicken', 'Chettinad Pepper Chicken Fry', 'cat_south_feasts', 'Tender chicken braised with stone-ground kalpasi, fennel, star anise and fresh tellicherry black peppercorns.', 'non-veg', 14000, 120, 'g', 50, '25 mins', 1, 0),
('dish_mutton_sukka', 'Madurai Mutton Chukka Varuval', 'cat_south_feasts', 'Baby lamb chunks slow-roasted with shallots, crushed dry red chilies, curry leaves and country ghee until succulent and caramelized.', 'non-veg', 19000, 120, 'g', 50, '35 mins', 1, 0),

-- Live Stations
('dish_live_jalebi', 'Live Crisp Kesar Jalebi with Rabdi', 'cat_live_counters', 'Spirals of fermented batter fried golden crisp live before guests, dipped in hot saffron syrup and topped with chilled creamy rabdi.', 'veg', 5500, 2, 'pcs', 50, '10 mins', 1, 0),
('dish_live_pasta', 'Live Gourmet Pasta Counter', 'cat_live_counters', 'Penne and fusilli tossed to order in rich Alfredo cheese sauce, zesty Arrabbiata, or basil pesto with gourmet veggies.', 'veg', 7000, 120, 'g', 50, '15 mins', 1, 0),

-- Grand Curries & Gravies
('dish_kadhai_paneer', 'Kadhai Paneer Peshawari', 'cat_main_course', 'Fresh cottage cheese cubes and crunchy bell peppers tossed in a rustic mortar-crushed coriander and Kashmiri chili masala.', 'veg', 9000, 120, 'g', 50, '20 mins', 1, 0),
('dish_methi_malai_mutter', 'Methi Malai Mutter', 'cat_main_course', 'Tender green peas and fresh fenugreek greens bathed in a creamy, velvety cashew-almond sauce seasoned with white pepper.', 'veg', 8500, 120, 'g', 50, '20 mins', 1, 0),

-- Breads
('dish_garlic_naan', 'Charred Garlic & Herb Naan', 'cat_breads', 'Hand-stretched leavened flatbread brushed with roasted minced garlic, fresh coriander and molten farm butter.', 'veg', 4000, 1, 'pcs', 50, '10 mins', 1, 0),
('dish_laccha_paratha', 'Crispy Laccha Paratha', 'cat_breads', 'Multi-layered, flaky whole wheat flatbread layered with ghee and pan-baked until golden and crisp.', 'veg', 3500, 1, 'pcs', 50, '10 mins', 1, 0),

-- Desserts & Sweets
('dish_shahi_tukda', 'Royal Awadhi Shahi Tukda', 'cat_desserts', 'Ghee-crisped brioche bread soaked in saffron-cardamom syrup, crowned with dense malai rabdi, silver leaf and chopped pistachio.', 'veg', 6500, 1, 'pcs', 50, '15 mins', 1, 0),
('dish_moong_dal_halwa', 'Pure Ghee Moong Dal Halwa', 'cat_desserts', 'Slow-roasted golden yellow lentils continuously stirred with A2 cow ghee, whole mawa, saffron and golden raisins.', 'veg', 6000, 80, 'g', 50, '20 mins', 1, 0),
('dish_mysore_pak', 'Royal Melt-in-Mouth Ghee Mysore Pak', 'cat_sweets', 'A regal royal palace delicacy crafted from roasted gram flour, sugar syrup and continuous folds of sizzling hot pure ghee.', 'veg', 4000, 2, 'pcs', 50, '10 mins', 1, 0),

-- Paan & Digestives
('dish_banarasi_paan', 'Shahi Banarasi Meetha Paan', 'cat_paan_digestives', 'Fresh betel leaf rolled with sweet gulkand, tutti-frutti, menthol, fennel seeds, dry dates and coated with edible silver vark.', 'veg', 2500, 1, 'pcs', 50, '5 mins', 1, 0)
ON CONFLICT(id) DO UPDATE SET
  name = excluded.name,
  category_id = excluded.category_id,
  description = excluded.description,
  food_type = excluded.food_type,
  price_per_person = excluded.price_per_person,
  quantity_per_person = excluded.quantity_per_person,
  serving_unit = excluded.serving_unit,
  min_order_quantity = excluded.min_order_quantity,
  prep_time = excluded.prep_time,
  availability = excluded.availability,
  is_deleted = excluded.is_deleted;

-- ------------------------------------------------------------------------------
-- 4. MULTI-ANGLE LUXURY DISH IMAGES (For Carousel, Modal & Gallery)
-- ------------------------------------------------------------------------------
INSERT INTO dish_images (id, dish_id, image_r2_key, image_url, is_primary, display_order, file_name, mime_type) VALUES

-- Elaneer Payasam & Tender Coconut Cooler
('img_elaneer_1', 'dish_tender_coconut_punch', 'dishes/elaneer_1.jpg', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=85', 1, 1, 'elaneer_main.jpg', 'image/jpeg'),
('img_elaneer_2', 'dish_tender_coconut_punch', 'dishes/elaneer_2.jpg', 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=900&q=85', 0, 2, 'elaneer_glass.jpg', 'image/jpeg'),

-- Shahi Gulab Saffron Sherbat
('img_rose_1', 'dish_rose_sharbat', 'dishes/rose_1.jpg', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=900&q=85', 1, 1, 'rose_main.jpg', 'image/jpeg'),
('img_rose_2', 'dish_rose_sharbat', 'dishes/rose_2.jpg', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=85', 0, 2, 'rose_pour.jpg', 'image/jpeg'),

-- Spiced Kokum Cooler
('img_kokum_1', 'dish_kokum_cooler', 'dishes/kokum_1.jpg', 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?auto=format&fit=crop&w=900&q=85', 1, 1, 'kokum_main.jpg', 'image/jpeg'),
('img_kokum_2', 'dish_kokum_cooler', 'dishes/kokum_2.jpg', 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=900&q=85', 0, 2, 'kokum_mint.jpg', 'image/jpeg'),

-- Shahi Hara Bhara Kabab
('img_hbh_1', 'dish_hara_bhara_kabab', 'dishes/hbh_1.jpg', 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=900&q=85', 1, 1, 'hbh_platter.jpg', 'image/jpeg'),
('img_hbh_2', 'dish_hara_bhara_kabab', 'dishes/hbh_2.jpg', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=85', 0, 2, 'hbh_close.jpg', 'image/jpeg'),

-- Spring Rolls
('img_spr_1', 'dish_spring_rolls', 'dishes/spring_rolls_1.jpg', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85', 1, 1, 'spring_rolls.jpg', 'image/jpeg'),
('img_spr_2', 'dish_spring_rolls', 'dishes/spring_rolls_2.jpg', 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=900&q=85', 0, 2, 'spring_rolls_dip.jpg', 'image/jpeg'),

-- Murgh Malai Tikka
('img_malai_1', 'dish_malai_tikka', 'dishes/malai_tikka_1.jpg', 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=900&q=85', 1, 1, 'malai_tikka_skewer.jpg', 'image/jpeg'),
('img_malai_2', 'dish_malai_tikka', 'dishes/malai_tikka_2.jpg', 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=900&q=85', 0, 2, 'malai_tikka_char.jpg', 'image/jpeg'),

-- Amritsari Fish
('img_fish_1', 'dish_fish_amritsari', 'dishes/fish_1.jpg', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85', 1, 1, 'fish_fry.jpg', 'image/jpeg'),
('img_fish_2', 'dish_fish_amritsari', 'dishes/fish_2.jpg', 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=900&q=85', 0, 2, 'fish_lemon.jpg', 'image/jpeg'),

-- Mysore Bisibelebath
('img_bbb_1', 'dish_bisibelebath', 'dishes/bbb_1.jpg', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=900&q=85', 1, 1, 'bisibelebath_bowl.jpg', 'image/jpeg'),
('img_bbb_2', 'dish_bisibelebath', 'dishes/bbb_2.jpg', 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=900&q=85', 0, 2, 'bisibelebath_ghee.jpg', 'image/jpeg'),

-- Malabar Avial
('img_avial_1', 'dish_avial', 'dishes/avial_1.jpg', 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=900&q=85', 1, 1, 'avial_brass.jpg', 'image/jpeg'),
('img_avial_2', 'dish_avial', 'dishes/avial_2.jpg', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=900&q=85', 0, 2, 'avial_leaf.jpg', 'image/jpeg'),

-- Chettinad Pepper Chicken
('img_chett_1', 'dish_chettinad_chicken', 'dishes/chettinad_1.jpg', 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=900&q=85', 1, 1, 'chettinad_fry.jpg', 'image/jpeg'),
('img_chett_2', 'dish_chettinad_chicken', 'dishes/chettinad_2.jpg', 'https://images.unsplash.com/photo-1546833998-877b37c2e5c4?auto=format&fit=crop&w=900&q=85', 0, 2, 'chettinad_curry_leaf.jpg', 'image/jpeg'),

-- Madurai Mutton Sukka
('img_msukka_1', 'dish_mutton_sukka', 'dishes/msukka_1.jpg', 'https://images.unsplash.com/photo-1546833998-877b37c2e5c4?auto=format&fit=crop&w=900&q=85', 1, 1, 'sukka_cast_iron.jpg', 'image/jpeg'),
('img_msukka_2', 'dish_mutton_sukka', 'dishes/msukka_2.jpg', 'https://images.unsplash.com/photo-1545247181-516773ca83f3?auto=format&fit=crop&w=900&q=85', 0, 2, 'sukka_garnish.jpg', 'image/jpeg'),

-- Live Jalebi with Rabdi
('img_jalebi_1', 'dish_live_jalebi', 'dishes/jalebi_1.jpg', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=900&q=85', 1, 1, 'jalebi_crisp.jpg', 'image/jpeg'),
('img_jalebi_2', 'dish_live_jalebi', 'dishes/jalebi_2.jpg', 'https://images.unsplash.com/photo-1605197584547-c93de1a4286b?auto=format&fit=crop&w=900&q=85', 0, 2, 'jalebi_rabdi.jpg', 'image/jpeg'),

-- Live Pasta Counter
('img_pasta_1', 'dish_live_pasta', 'dishes/pasta_1.jpg', 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=900&q=85', 1, 1, 'pasta_pan.jpg', 'image/jpeg'),
('img_pasta_2', 'dish_live_pasta', 'dishes/pasta_2.jpg', 'https://images.unsplash.com/photo-1546833998-877b37c2e5c4?auto=format&fit=crop&w=900&q=85', 0, 2, 'pasta_tossed.jpg', 'image/jpeg'),

-- Kadhai Paneer
('img_kp_1', 'dish_kadhai_paneer', 'dishes/kadhai_paneer_1.jpg', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=900&q=85', 1, 1, 'kadhai_paneer_pot.jpg', 'image/jpeg'),
('img_kp_2', 'dish_kadhai_paneer', 'dishes/kadhai_paneer_2.jpg', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=900&q=85', 0, 2, 'kadhai_paneer_serve.jpg', 'image/jpeg'),

-- Methi Malai Mutter
('img_mmm_1', 'dish_methi_malai_mutter', 'dishes/methi_1.jpg', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=900&q=85', 1, 1, 'methi_makhani.jpg', 'image/jpeg'),
('img_mmm_2', 'dish_methi_malai_mutter', 'dishes/methi_2.jpg', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=900&q=85', 0, 2, 'methi_bowl.jpg', 'image/jpeg'),

-- Garlic Naan
('img_gnaan_1', 'dish_garlic_naan', 'dishes/gnaan_1.jpg', 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=900&q=85', 1, 1, 'garlic_naan_basket.jpg', 'image/jpeg'),
('img_gnaan_2', 'dish_garlic_naan', 'dishes/gnaan_2.jpg', 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=900&q=85', 0, 2, 'garlic_naan_butter.jpg', 'image/jpeg'),

-- Laccha Paratha
('img_lacch_1', 'dish_laccha_paratha', 'dishes/laccha_1.jpg', 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=900&q=85', 1, 1, 'laccha_layers.jpg', 'image/jpeg'),
('img_lacch_2', 'dish_laccha_paratha', 'dishes/laccha_2.jpg', 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=900&q=85', 0, 2, 'laccha_tava.jpg', 'image/jpeg'),

-- Shahi Tukda
('img_stk_1', 'dish_shahi_tukda', 'dishes/stk_1.jpg', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=900&q=85', 1, 1, 'shahi_tukda_silver.jpg', 'image/jpeg'),
('img_stk_2', 'dish_shahi_tukda', 'dishes/stk_2.jpg', 'https://images.unsplash.com/photo-1605197584547-c93de1a4286b?auto=format&fit=crop&w=900&q=85', 0, 2, 'shahi_tukda_rabdi.jpg', 'image/jpeg'),

-- Moong Dal Halwa
('img_mdh_1', 'dish_moong_dal_halwa', 'dishes/mdh_1.jpg', 'https://images.unsplash.com/photo-1605197584547-c93de1a4286b?auto=format&fit=crop&w=900&q=85', 1, 1, 'halwa_ghee.jpg', 'image/jpeg'),
('img_mdh_2', 'dish_moong_dal_halwa', 'dishes/mdh_2.jpg', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=900&q=85', 0, 2, 'halwa_kadhai.jpg', 'image/jpeg'),

-- Mysore Pak
('img_mpak_1', 'dish_mysore_pak', 'dishes/mysore_pak_1.jpg', 'https://images.unsplash.com/photo-1605197584547-c93de1a4286b?auto=format&fit=crop&w=900&q=85', 1, 1, 'mysore_pak_squares.jpg', 'image/jpeg'),
('img_mpak_2', 'dish_mysore_pak', 'dishes/mysore_pak_2.jpg', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=900&q=85', 0, 2, 'mysore_pak_ghee.jpg', 'image/jpeg'),

-- Banarasi Meetha Paan
('img_paan_1', 'dish_banarasi_paan', 'dishes/paan_1.jpg', 'https://images.unsplash.com/photo-1546833998-877b37c2e5c4?auto=format&fit=crop&w=900&q=85', 1, 1, 'paan_silver.jpg', 'image/jpeg'),
('img_paan_2', 'dish_banarasi_paan', 'dishes/paan_2.jpg', 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=900&q=85', 0, 2, 'paan_betel.jpg', 'image/jpeg')
ON CONFLICT(id) DO UPDATE SET
  image_url = excluded.image_url,
  is_primary = excluded.is_primary,
  display_order = excluded.display_order;

-- ------------------------------------------------------------------------------
-- 5. AUTHENTIC RECIPES & INGREDIENT COST BREAKDOWNS
-- ------------------------------------------------------------------------------
INSERT INTO recipes (id, dish_id, title, description, cooking_time, prep_time, servings) VALUES
('rcp_elaneer', 'dish_tender_coconut_punch', 'Royal Elaneer Payasam Cooler', 'Fresh tender coconut water blended with smooth coconut pulp, cardamom and reduced milk.', 10, 10, 10),
('rcp_hbh', 'dish_hara_bhara_kabab', 'Shahi Hara Bhara Kabab Platter', 'Emerald patties of blanched spinach, sweet green peas, and spiced mashed potatoes studded with whole cashews.', 15, 20, 10),
('rcp_bbb', 'dish_bisibelebath', 'Mysore Palace Ghee Bisibelebath', 'Aromatic slow-cooked toor dal and aged rice tossed with cinnamon, cloves, kapok buds and tamarind pulp.', 25, 20, 10),
('rcp_chettinad', 'dish_chettinad_chicken', 'Karaikudi Chettinad Pepper Chicken', 'Stone-ground tellicherry black peppercorns, shallots and curry leaves pan-roasted with tender chicken cuts.', 25, 20, 10),
('rcp_live_jalebi', 'dish_live_jalebi', 'Hot Saffron Live Jalebi with Rabdi', 'Golden crisp fermented spirals dipped in saffron syrup, served with rich reduced milk rabdi.', 15, 15, 10),
('rcp_shahi_tukda', 'dish_shahi_tukda', 'Awadhi Shahi Tukda with Malai Rabdi', 'Desi ghee pan-fried milk bread saturated in saffron sugar syrup, blanketed in thick cardamom rabdi and nuts.', 20, 15, 10),
('rcp_banarasi_paan', 'dish_banarasi_paan', 'Royal Magahi Meetha Paan', 'Hand-folded fresh betel leaves layered with sweet rose petal gulkand, fennel, supari and silver vark.', 5, 10, 10)
ON CONFLICT(id) DO UPDATE SET
  title = excluded.title,
  description = excluded.description,
  cooking_time = excluded.cooking_time,
  prep_time = excluded.prep_time,
  servings = excluded.servings;

-- Recipe Ingredients
INSERT INTO recipe_ingredients (id, recipe_id, name, quantity, unit, notes, display_order) VALUES
-- Elaneer Cooler
('ing_eln_1', 'rcp_elaneer', 'Fresh Tender Coconut Water', 1000, 'ml', 'Naturally sweet fresh tender coconut water', 1),
('ing_eln_2', 'rcp_elaneer', 'Soft Tender Coconut Malai (Pulp)', 300, 'g', 'Silky spoon-scooped soft coconut pulp', 2),
('ing_eln_3', 'rcp_elaneer', 'Thickened Whole Milk', 400, 'ml', 'Boiled and chilled dairy milk with cardamom', 3),

-- Hara Bhara Kabab
('ing_hbh_1', 'rcp_hbh', 'Fresh Spinach (Palak)', 350, 'g', 'Blanched and ice-shocked vibrant green spinach', 1),
('ing_hbh_2', 'rcp_hbh', 'Sweet Green Peas', 200, 'g', 'Steamed and coarse-mashed tender green peas', 2),
('ing_hbh_3', 'rcp_hbh', 'Boiled Potatoes & Roasted Besan', 250, 'g', 'Firm binder seasoned with roasted gram flour', 3),
('ing_hbh_4', 'rcp_hbh', 'Whole Split Cashews', 20, 'pcs', 'Garnish pressed onto each kabab crown', 4),

-- Bisibelebath
('ing_bbb_1', 'rcp_bbb', 'Sona Masoori Rice & Toor Dal', 400, 'g', 'Slow-cooked together till soft and creamy', 1),
('ing_bbb_2', 'rcp_bbb', 'Bisibelebath Spice Powder', 60, 'g', 'Stone-ground with marathi moggu, cinnamon and copra', 2),
('ing_bbb_3', 'rcp_bbb', 'Diced Country Vegetables', 300, 'g', 'Drumstick, shallots, carrots, French beans', 3),
('ing_bbb_4', 'rcp_bbb', 'Pure Cow Ghee & Cashews', 80, 'g', 'Golden fried cashews poured sizzling on top', 4),

-- Chettinad Pepper Chicken
('ing_cht_chk_1', 'rcp_chettinad', 'Farm Fresh Tender Chicken', 1000, 'g', 'Bone-in cuts trimmed and washed with turmeric', 1),
('ing_cht_chk_2', 'rcp_chettinad', 'Tellicherry Black Pepper & Fennel', 40, 'g', 'Freshly ground coarse peppercorns and saunf', 2),
('ing_cht_chk_3', 'rcp_chettinad', 'Small Sambar Shallots', 250, 'g', 'Peeled whole baby shallots caramelized in gingelly oil', 3),

-- Live Jalebi
('ing_lj_1', 'rcp_live_jalebi', 'Fermented Refined Flour Batter', 400, 'g', 'Traditional overnight naturally fermented batter', 1),
('ing_lj_2', 'rcp_live_jalebi', 'Kashmiri Saffron Sugar Syrup', 500, 'ml', 'One-string hot sugar syrup infused with saffron threads', 2),
('ing_lj_3', 'rcp_live_jalebi', 'Chilled Thick Rabdi', 300, 'g', 'Slow-condensed whole cream milk with cardamom', 3),

-- Shahi Tukda
('ing_stk_1', 'rcp_shahi_tukda', 'Artisanal Brioche Bread Slices', 10, 'pcs', 'Crust removed and cut diagonally into triangles', 1),
('ing_stk_2', 'rcp_shahi_tukda', 'Pure Desi Ghee', 150, 'g', 'For golden frying of bread triangles', 2),
('ing_stk_3', 'rcp_shahi_tukda', 'Saffron Cardamom Rabdi Cream', 400, 'ml', 'Dense aromatic reduced milk topping', 3),

-- Banarasi Paan
('ing_pan_1', 'rcp_banarasi_paan', 'Fresh Magahi Betel Leaves', 10, 'pcs', 'Tender rinsed heart-shaped sweet leaves', 1),
('ing_pan_2', 'rcp_banarasi_paan', 'Damascus Rose Petal Gulkand', 100, 'g', 'Sun-cured fragrant rose petal preserve', 2),
('ing_pan_3', 'rcp_banarasi_paan', 'Calcutta Sweet Fennel & Mukhwas', 50, 'g', 'Glazed aniseeds, menthol crystals and dates', 3)
ON CONFLICT(id) DO UPDATE SET
  quantity = excluded.quantity,
  unit = excluded.unit,
  notes = excluded.notes;

-- Recipe Steps
INSERT INTO recipe_steps (id, recipe_id, step_number, instruction) VALUES
('stp_eln_1', 'rcp_elaneer', 1, 'Scoop fresh tender coconut pulp and blend with 200ml tender coconut water into a silky smooth puree.'),
('stp_eln_2', 'rcp_elaneer', 2, 'Gently mix with remaining tender coconut water and chilled cardamom condensed milk. Serve iced.'),

('stp_hbh_1', 'rcp_hbh', 1, 'Coarsely pulse blanched spinach and steamed green peas. Mix with mashed potatoes, roasted besan, green chilies and spices.'),
('stp_hbh_2', 'rcp_hbh', 2, 'Shape into 50g round patties, press a cashew half on top, and shallow-fry on a hot griddle in ghee until crisp and dark green.'),

('stp_bbb_1', 'rcp_bbb', 1, 'Pressure cook rice and toor dal until soft. Separately cook diced vegetables in tamarind water and turmeric.'),
('stp_bbb_2', 'rcp_bbb', 2, 'Combine rice-dal mash with cooked vegetables and fresh bisibelebath powder. Simmer for 10 minutes.'),
('stp_bbb_3', 'rcp_bbb', 3, 'Temper mustard seeds, curry leaves and cashews in generous desi ghee and pour bubbling over the pot. Garnish with crisp boondi.'),

('stp_cht_1', 'rcp_chettinad', 1, 'Dry roast whole coriander, fennel, cumin, dry red chilies and tellicherry peppercorns; grind into aromatic Chettinad masala.'),
('stp_cht_2', 'rcp_chettinad', 2, 'Saute shallots and curry leaves in cold-pressed gingelly oil, add chicken, ground masala and salt. Cook covered till tender, then roast open till dry and glazed.')
ON CONFLICT(id) DO UPDATE SET
  instruction = excluded.instruction;
