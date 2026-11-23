-- 0003_dish_gallery_and_recipes.sql
-- Multiple high-resolution banquet images & authentic recipes for all dishes

-- Secondary and tertiary images
INSERT OR IGNORE INTO dish_images (id, dish_id, image_r2_key, image_url, is_primary, display_order, file_name, mime_type) VALUES
-- Idly
('img_idly_2', 'dish_idly', 'dishes/idly_2.jpg', 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=900&q=85', 0, 2, 'idly_close.jpg', 'image/jpeg'),
('img_idly_3', 'dish_idly', 'dishes/idly_3.jpg', 'https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?auto=format&fit=crop&w=900&q=85', 0, 3, 'idly_brass.jpg', 'image/jpeg'),

-- Medu Vada
('img_vada_2', 'dish_vada', 'dishes/vada_2.jpg', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=85', 0, 2, 'vada_dip.jpg', 'image/jpeg'),
('img_vada_3', 'dish_vada', 'dishes/vada_3.jpg', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=900&q=85', 0, 3, 'vada_banana_leaf.jpg', 'image/jpeg'),

-- Dosa
('img_dosa_2', 'dish_dosa', 'dishes/dosa_2.jpg', 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=900&q=85', 0, 2, 'dosa_roast.jpg', 'image/jpeg'),
('img_dosa_3', 'dish_dosa', 'dishes/dosa_3.jpg', 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=900&q=85', 0, 3, 'dosa_masala.jpg', 'image/jpeg'),

-- Filter Coffee
('img_coffee_2', 'dish_filter_coffee', 'dishes/coffee_2.jpg', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=85', 0, 2, 'coffee_froth.jpg', 'image/jpeg'),
('img_coffee_3', 'dish_filter_coffee', 'dishes/coffee_3.jpg', 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=900&q=85', 0, 3, 'coffee_pour.jpg', 'image/jpeg'),

-- Dum Chicken Biryani
('img_cb_2', 'dish_chicken_biryani', 'dishes/chicken_biryani_2.jpg', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=900&q=85', 0, 2, 'biryani_handi.jpg', 'image/jpeg'),
('img_cb_3', 'dish_chicken_biryani', 'dishes/chicken_biryani_3.jpg', 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=900&q=85', 0, 3, 'biryani_garnished.jpg', 'image/jpeg'),

-- Butter Naan
('img_naan_2', 'dish_butter_naan', 'dishes/naan_2.jpg', 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=900&q=85', 0, 2, 'naan_tandoor.jpg', 'image/jpeg'),

-- Dal Makhani
('img_dal_2', 'dish_dal_makhani', 'dishes/dal_2.jpg', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=900&q=85', 0, 2, 'dal_slow_cooked.jpg', 'image/jpeg'),

-- Mutton Rogan Josh
('img_mutton_2', 'dish_mutton_rogan_josh', 'dishes/mutton_2.jpg', 'https://images.unsplash.com/photo-1546833998-877b37c2e5c4?auto=format&fit=crop&w=900&q=85', 0, 2, 'rogan_josh_brass.jpg', 'image/jpeg'),

-- Gulab Jamun
('img_gj_2', 'dish_gulab_jamun', 'dishes/gj_2.jpg', 'https://images.unsplash.com/photo-1605197584547-c93de1a4286b?auto=format&fit=crop&w=900&q=85', 0, 2, 'jamun_saffron.jpg', 'image/jpeg'),

-- Rasmalai
('img_ras_2', 'dish_rasmalai', 'dishes/ras_2.jpg', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=900&q=85', 0, 2, 'rasmalai_kesar.jpg', 'image/jpeg'),

-- Kulfi Falooda
('img_kulfi_1', 'dish_kulfi_falooda', 'dishes/kulfi_1.jpg', 'https://images.unsplash.com/photo-1560008581-09826d1de69e?auto=format&fit=crop&w=900&q=85', 1, 1, 'kulfi_main.jpg', 'image/jpeg'),
('img_kulfi_2', 'dish_kulfi_falooda', 'dishes/kulfi_2.jpg', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=900&q=85', 0, 2, 'falooda_served.jpg', 'image/jpeg'),

-- Live Chaat Counter
('img_chaat_1', 'dish_live_chaat', 'dishes/chaat_1.jpg', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=85', 1, 1, 'chaat_platter.jpg', 'image/jpeg'),
('img_chaat_2', 'dish_live_chaat', 'dishes/chaat_2.jpg', 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=900&q=85', 0, 2, 'chaat_puffed_puri.jpg', 'image/jpeg'),

-- Tandoori Roti
('img_roti_1', 'dish_tandoori_roti', 'dishes/roti_1.jpg', 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=900&q=85', 1, 1, 'roti_charred.jpg', 'image/jpeg');

-- Authentic Recipes for Dishes
INSERT OR IGNORE INTO recipes (id, dish_id, title, description, cooking_time, prep_time, servings) VALUES
('rcp_idly', 'dish_idly', 'Steamed Ghee Podi Button Idly', 'Handmade fermented batter steamed in cloth molds, tossed in roasted lentils and pure Malnad cow ghee.', 15, 10, 10),
('rcp_vada', 'dish_vada', 'Urad Dal Crisp Medu Vada', 'Crispy exterior with pillowy cloud center, flavored with whole black peppercorns and fresh grated coconut.', 20, 15, 10),
('rcp_dosa', 'dish_dosa', 'Royal Live Ghee Roast Dosa', 'Golden cast-iron crepe smeared with red chilli chutney and filled with heirloom spiced potato mash.', 15, 10, 8),
('rcp_chicken_biryani', 'dish_chicken_biryani', 'Awadhi Dum Chicken Biryani', 'Marinated spring chicken layered with aged fragrant basmati, fried shallots, kewra and saffron milk.', 45, 25, 12),
('rcp_dal_makhani', 'dish_dal_makhani', 'Slow-Charcoal Dal Makhani', 'Whole black urad lentils slow-simmered for 18 hours over tandoor embers with butter and tomato purée.', 60, 20, 10),
('rcp_butter_naan', 'dish_butter_naan', 'Tandoori Butter Naan', 'Refined flour leavened with yogurt and milk, slapped on clay tandoor walls and brushed with cultured butter.', 10, 15, 10),
('rcp_gulab_jamun', 'dish_gulab_jamun', 'Shahi Khoya Gulab Jamun', 'Slow-fried soft khoya dumplings soaked in saffron, cardamom and rose-water scented sugar nectar.', 30, 20, 12),
('rcp_filter_coffee', 'dish_filter_coffee', 'Kumbakonam Degree Filter Coffee', 'Dark roast plantation peaberry decoction blended with boiled frothy cow milk in traditional brass tumbler.', 10, 5, 10);

-- Recipe Ingredients for Dishes
INSERT OR IGNORE INTO recipe_ingredients (id, recipe_id, name, quantity, unit, notes, display_order) VALUES
-- Idly
('ing_idly_1', 'rcp_idly', 'Fermented Idly Rice Batter', 500, 'g', 'Stone-ground parboiled rice & urad dal', 1),
('ing_idly_2', 'rcp_idly', 'Desi Cow Ghee', 80, 'g', 'A2 cow ghee from grass-fed churn', 2),
('ing_idly_3', 'rcp_idly', 'Gunpowder Molagapodi', 40, 'g', 'Roasted chana dal, urad dal, red chillies', 3),
('ing_idly_4', 'rcp_idly', 'Curry Leaves & Hing', 10, 'g', 'Crisp tempered in ghee', 4),

-- Vada
('ing_vada_1', 'rcp_vada', 'Whole Urad Gota Batter', 450, 'g', 'Fluffy aerated batter without water', 1),
('ing_vada_2', 'rcp_vada', 'Cracked Black Pepper & Cumin', 20, 'g', 'Coarsely crushed Malabar black pepper', 2),
('ing_vada_3', 'rcp_vada', 'Fresh Coconut Bits & Ginger', 50, 'g', 'Finely diced crunch elements', 3),
('ing_vada_4', 'rcp_vada', 'Curry Leaves & Asafoetida', 10, 'g', 'Fresh aromatic tempering', 4),

-- Dosa
('ing_dosa_1', 'rcp_dosa', 'Aged Dosa Batter', 600, 'g', 'Stone-ground fermented crisp batter', 1),
('ing_dosa_2', 'rcp_dosa', 'Pure Desi Ghee', 100, 'g', 'Generously drizzled over cast iron', 2),
('ing_dosa_3', 'rcp_dosa', 'Spiced Potato Masala', 350, 'g', 'Yukon potatoes tempered with mustard & onions', 3),
('ing_dosa_4', 'rcp_dosa', 'Mysore Red Chilly Chutney', 60, 'g', 'Spicy garlic and roasted red chilli paste', 4),

-- Chicken Biryani
('ing_cb_1', 'rcp_chicken_biryani', 'Aged Basmati Rice', 600, 'g', 'Extra-long grain 2-year aged rice', 1),
('ing_cb_2', 'rcp_chicken_biryani', 'Farm Fresh Spring Chicken', 750, 'g', 'Bone-in cuts marinated in curd & shahi garam masala', 2),
('ing_cb_3', 'rcp_chicken_biryani', 'Golden Fried Onions (Birista)', 150, 'g', 'Caramelized thin shallot slices', 3),
('ing_cb_4', 'rcp_chicken_biryani', 'Kashmiri Saffron & Desi Ghee', 60, 'g', 'Infused in warm whole milk', 4),

-- Dal Makhani
('ing_dm_1', 'rcp_dal_makhani', 'Whole Black Urad Lentils', 400, 'g', 'Overnight soaked and slow-simmered', 1),
('ing_dm_2', 'rcp_dal_makhani', 'White Unsalted Butter', 120, 'g', 'Cultured hand-churned makhan', 2),
('ing_dm_3', 'rcp_dal_makhani', 'Vine-Ripe Tomato Concasse', 200, 'g', 'Slow-reduced silky tomato gravy', 3),
('ing_dm_4', 'rcp_dal_makhani', 'Fresh Heavy Cream & Kasuri Methi', 60, 'g', 'Sun-dried fenugreek leaves', 4),

-- Butter Naan
('ing_bn_1', 'rcp_butter_naan', 'Fine Flour Dough (Maida)', 500, 'g', 'Enriched with milk, yogurt and light sugar', 1),
('ing_bn_2', 'rcp_butter_naan', 'Farm Butter', 90, 'g', 'Melted over hot baked bread', 2),
('ing_bn_3', 'rcp_butter_naan', 'Nigella Seeds (Kalonji) & Coriander', 15, 'g', 'Pressed onto raw dough surface', 3),

-- Gulab Jamun
('ing_gj_1', 'rcp_gulab_jamun', 'Haryali Mawa / Khoya', 350, 'g', 'Reduced whole milk solids', 1),
('ing_gj_2', 'rcp_gulab_jamun', 'Fresh Chenna (Paneer)', 100, 'g', 'Fine crumb paneer for tenderness', 2),
('ing_gj_3', 'rcp_gulab_jamun', 'Saffron & Rose Sugar Nectar', 400, 'ml', 'Single-thread syrup infused with green cardamom', 3),
('ing_gj_4', 'rcp_gulab_jamun', 'Pistachios & Edible Silver Leaf', 20, 'g', 'Finely slivered royal garnish', 4),

-- Filter Coffee
('ing_fc_1', 'rcp_filter_coffee', 'Chicory Roasted Arabica Coffee', 70, 'g', 'Coarsely ground plantation blend (85:15)', 1),
('ing_fc_2', 'rcp_filter_coffee', 'Full Cream Farm Milk', 800, 'ml', 'Boiled hot and vigorously frothed', 2),
('ing_fc_3', 'rcp_filter_coffee', 'Raw Cane Sugar', 60, 'g', 'Unrefined traditional sweetness', 3);
