-- Initial Schema Migration for Wedding Feast Platform
-- All monetary amounts stored in integer minor units (paise, e.g. 10000 = ₹100.00)

-- 1. Admin Users
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  full_name TEXT,
  avatar_url TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);

-- 2. Food Categories
CREATE TABLE IF NOT EXISTS food_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  image_r2_key TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'inactive'
  is_deleted INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_categories_display_order ON food_categories(display_order);
CREATE INDEX IF NOT EXISTS idx_categories_status ON food_categories(status);

-- 3. Dishes
CREATE TABLE IF NOT EXISTS dishes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category_id TEXT NOT NULL,
  description TEXT,
  food_type TEXT NOT NULL DEFAULT 'veg', -- 'veg', 'non-veg', 'vegan'
  price_per_person INTEGER NOT NULL, -- in paise (e.g. ₹80 = 8000)
  quantity_per_person INTEGER NOT NULL DEFAULT 100,
  serving_unit TEXT NOT NULL DEFAULT 'g', -- 'g', 'ml', 'pcs'
  min_order_quantity INTEGER NOT NULL DEFAULT 50,
  prep_time TEXT NOT NULL DEFAULT '20 mins',
  availability INTEGER NOT NULL DEFAULT 1, -- 1=active, 0=inactive
  is_deleted INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (category_id) REFERENCES food_categories(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_dishes_category ON dishes(category_id);
CREATE INDEX IF NOT EXISTS idx_dishes_food_type ON dishes(food_type);
CREATE INDEX IF NOT EXISTS idx_dishes_availability ON dishes(availability);
CREATE INDEX IF NOT EXISTS idx_dishes_is_deleted ON dishes(is_deleted);

-- 4. Dish Images
CREATE TABLE IF NOT EXISTS dish_images (
  id TEXT PRIMARY KEY,
  dish_id TEXT NOT NULL,
  image_r2_key TEXT NOT NULL,
  image_url TEXT NOT NULL,
  is_primary INTEGER NOT NULL DEFAULT 0,
  display_order INTEGER NOT NULL DEFAULT 0,
  file_name TEXT,
  file_size INTEGER,
  mime_type TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_dish_images_dish ON dish_images(dish_id);
CREATE INDEX IF NOT EXISTS idx_dish_images_primary ON dish_images(is_primary);

-- 5. Recipes
CREATE TABLE IF NOT EXISTS recipes (
  id TEXT PRIMARY KEY,
  dish_id TEXT NOT NULL UNIQUE,
  title TEXT,
  description TEXT,
  cooking_time INTEGER NOT NULL DEFAULT 30, -- minutes
  prep_time INTEGER NOT NULL DEFAULT 15, -- minutes
  servings INTEGER NOT NULL DEFAULT 10,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_recipes_dish ON recipes(dish_id);

-- 6. Recipe Ingredients
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id TEXT PRIMARY KEY,
  recipe_id TEXT NOT NULL,
  name TEXT NOT NULL,
  quantity REAL NOT NULL,
  unit TEXT NOT NULL DEFAULT 'g', -- 'g', 'kg', 'ml', 'l', 'tbsp', 'tsp', 'pcs'
  notes TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);

-- 7. Recipe Steps
CREATE TABLE IF NOT EXISTS recipe_steps (
  id TEXT PRIMARY KEY,
  recipe_id TEXT NOT NULL,
  step_number INTEGER NOT NULL,
  instruction TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_recipe_steps_recipe ON recipe_steps(recipe_id);

-- 8. Estimation Settings
CREATE TABLE IF NOT EXISTS estimation_settings (
  id TEXT PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  default_serving_quantity INTEGER NOT NULL DEFAULT 100,
  currency TEXT NOT NULL DEFAULT 'INR',
  currency_symbol TEXT NOT NULL DEFAULT '₹',
  service_charge_rate REAL NOT NULL DEFAULT 5.0, -- percentage (5.0%)
  service_charge_enabled INTEGER NOT NULL DEFAULT 1,
  transportation_charge INTEGER NOT NULL DEFAULT 200000, -- in paise (₹2,000 = 200000)
  transportation_enabled INTEGER NOT NULL DEFAULT 1,
  gst_rate REAL NOT NULL DEFAULT 5.0, -- percentage (5.0%)
  gst_enabled INTEGER NOT NULL DEFAULT 1,
  min_guests INTEGER NOT NULL DEFAULT 50,
  is_active INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 9. Events
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  event_name TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'Wedding', 'Reception', 'Sangeet', 'Engagement', 'Haldi', etc.
  event_date TEXT NOT NULL,
  venue TEXT NOT NULL,
  guest_count INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled'
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

-- 10. Customer Selections
CREATE TABLE IF NOT EXISTS customer_selections (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  subtotal INTEGER NOT NULL, -- in paise
  service_charge INTEGER NOT NULL DEFAULT 0, -- in paise
  transportation_charge INTEGER NOT NULL DEFAULT 0, -- in paise
  gst_amount INTEGER NOT NULL DEFAULT 0, -- in paise
  grand_total INTEGER NOT NULL, -- in paise
  cost_per_guest INTEGER NOT NULL, -- in paise
  status TEXT NOT NULL DEFAULT 'submitted', -- 'draft', 'submitted', 'approved'
  special_requests TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_customer_selections_event ON customer_selections(event_id);

-- 11. Customer Selection Items
CREATE TABLE IF NOT EXISTS customer_selection_items (
  id TEXT PRIMARY KEY,
  selection_id TEXT NOT NULL,
  dish_id TEXT NOT NULL,
  dish_name TEXT NOT NULL,
  category_name TEXT,
  price_per_person INTEGER NOT NULL, -- in paise
  quantity_per_person INTEGER NOT NULL,
  serving_unit TEXT NOT NULL,
  total_guest_count INTEGER NOT NULL,
  total_calculated_quantity REAL NOT NULL,
  total_dish_cost INTEGER NOT NULL, -- in paise (price_per_person * total_guest_count)
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (selection_id) REFERENCES customer_selections(id) ON DELETE CASCADE,
  FOREIGN KEY (dish_id) REFERENCES dishes(id)
);

CREATE INDEX IF NOT EXISTS idx_selection_items_selection ON customer_selection_items(selection_id);
CREATE INDEX IF NOT EXISTS idx_selection_items_dish ON customer_selection_items(dish_id);
