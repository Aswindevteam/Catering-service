-- 0004_rasmalai_and_dish_recipes.sql
-- Add authentic recipe and ingredients for Rasmalai and remaining dishes

INSERT OR IGNORE INTO recipes (id, dish_id, title, description, cooking_time, prep_time, servings) VALUES
('rcp_rasmalai', 'dish_rasmalai', 'Shahi Kesar Pista Rasmalai', 'Tender hand-rolled chenna discs poached in light syrup, submerged in saffron rabdi milk with slivered nuts.', 30, 20, 10),
('rcp_kulfi', 'dish_kulfi_falooda', 'Royal Matka Kulfi with Rose Falooda', 'Slow-caramelized milk solids churned with pistachios, served over chilled cornstarch vermicelli and rose syrup.', 40, 20, 10),
('rcp_chaat', 'dish_live_chaat', 'Delhi Chandni Chowk Live Chaat Platter', 'Crisp wheat puris stuffed with spiced potatoes and black chickpeas, topped with sweet yogurt and chutneys.', 15, 20, 15);

INSERT OR IGNORE INTO recipe_ingredients (id, recipe_id, name, quantity, unit, notes, display_order) VALUES
-- Rasmalai
('ing_ras_1', 'rcp_rasmalai', 'Fresh Cow Milk Chenna', 400, 'g', 'Soft hand-kneaded cottage cheese discs', 1),
('ing_ras_2', 'rcp_rasmalai', 'Kashmiri Mogra Saffron', 2, 'g', 'Deep crimson saffron strands', 2),
('ing_ras_3', 'rcp_rasmalai', 'Thickened Saffron Rabdi Milk', 600, 'ml', 'Slow-reduced whole cream milk with cardamom', 3),
('ing_ras_4', 'rcp_rasmalai', 'Slivered Pistachios & Almonds', 40, 'g', 'Finely roasted nut slivers', 4),

-- Kulfi Falooda
('ing_klf_1', 'rcp_kulfi', 'Caramelized Rabdi Kulfi Base', 500, 'g', 'Whole buffalo milk slow-reduced with cardamom', 1),
('ing_klf_2', 'rcp_kulfi', 'Cornstarch Sev (Falooda)', 150, 'g', 'Handmade silky transparent vermicelli', 2),
('ing_klf_3', 'rcp_kulfi', 'Damascus Rose Syrup & Sabja Seeds', 80, 'ml', 'Fragrant rose nectar with soaked basil seeds', 3),

-- Live Chaat
('ing_cht_1', 'rcp_chaat', 'Crisp Semolina Puris', 30, 'pcs', 'Golden hollow puffed puris', 1),
('ing_cht_2', 'rcp_chaat', 'Spiced Potato & Kala Chana Mash', 350, 'g', 'Tempered with roasted cumin and rock salt', 2),
('ing_cht_3', 'rcp_chaat', 'Sweet Chilled Curd (Dahi)', 400, 'g', 'Whisked sweetened hung curd', 3),
('ing_cht_4', 'rcp_chaat', 'Tamarind & Mint Chutneys', 120, 'ml', 'Tangy saunth and zesty coriander mint chutney', 4);

INSERT OR IGNORE INTO recipe_steps (id, recipe_id, step_number, instruction) VALUES
('stp_ras_1', 'rcp_rasmalai', 1, 'Knead fresh chenna with fingertips on marble slab until smooth and pliable without graininess.'),
('stp_ras_2', 'rcp_rasmalai', 2, 'Divide into small flat dumplings and poach in rolling boiling light sugar syrup for 10 minutes until spongy.'),
('stp_ras_3', 'rcp_rasmalai', 3, 'Slowly simmer full-cream milk with saffron and green cardamom until reduced by half into fragrant rabdi.'),
('stp_ras_4', 'rcp_rasmalai', 4, 'Squeeze excess syrup gently from chenna discs and submerge in warm saffron rabdi. Chill for 4 hours and garnish with slivered pistachios.');
