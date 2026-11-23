// Environment Bindings for Cloudflare Workers
export interface Env {
  DB: D1Database;
  IMAGES_BUCKET: R2Bucket;
  JWT_SECRET: string;
  ENVIRONMENT: string;
  PUBLIC_R2_URL: string;
  ASSETS?: Fetcher;
}

// User & Auth
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  role: string;
  full_name: string | null;
  avatar_url: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface AdminUserSafe {
  id: string;
  username: string;
  email: string;
  role: string;
  full_name: string | null;
  avatar_url: string | null;
}

// Food Category
export interface FoodCategory {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  image_r2_key: string | null;
  display_order: number;
  status: 'active' | 'inactive';
  is_deleted: number;
  dish_count?: number;
  created_at: string;
  updated_at: string;
}

// Dish & Images
export interface Dish {
  id: string;
  name: string;
  category_id: string;
  category_name?: string;
  description: string | null;
  food_type: 'veg' | 'non-veg' | 'vegan';
  price_per_person: number; // in paise
  quantity_per_person: number;
  serving_unit: string;
  min_order_quantity: number;
  prep_time: string;
  availability: number; // 1=active, 0=inactive
  is_deleted: number;
  created_at: string;
  updated_at: string;
  images?: DishImage[];
  primary_image_url?: string;
}

export interface DishImage {
  id: string;
  dish_id: string;
  image_r2_key: string;
  image_url: string;
  is_primary: number;
  display_order: number;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  created_at: string;
}

// Recipe
export interface Recipe {
  id: string;
  dish_id: string;
  dish_name?: string;
  title: string | null;
  description: string | null;
  cooking_time: number;
  prep_time: number;
  servings: number;
  created_at: string;
  updated_at: string;
  ingredients?: RecipeIngredient[];
  steps?: RecipeStep[];
}

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  name: string;
  quantity: number;
  unit: string;
  notes: string | null;
  display_order: number;
  created_at: string;
}

export interface RecipeStep {
  id: string;
  recipe_id: string;
  step_number: number;
  instruction: string;
  created_at: string;
}

// Estimation Settings
export interface EstimationSettings {
  id: string;
  setting_key: string;
  default_serving_quantity: number;
  currency: string;
  currency_symbol: string;
  service_charge_rate: number;
  service_charge_enabled: number;
  transportation_charge: number; // in paise
  transportation_enabled: number;
  gst_rate: number;
  gst_enabled: number;
  min_guests: number;
  is_active: number;
  updated_at: string;
}

// Events & Selections
export interface WeddingEvent {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  event_name: string;
  event_type: string;
  event_date: string;
  venue: string;
  guest_count: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerSelection {
  id: string;
  event_id: string;
  subtotal: number; // in paise
  service_charge: number; // in paise
  transportation_charge: number; // in paise
  gst_amount: number; // in paise
  grand_total: number; // in paise
  cost_per_guest: number; // in paise
  status: 'draft' | 'submitted' | 'approved';
  special_requests: string | null;
  created_at: string;
  updated_at: string;
  event?: WeddingEvent;
  items?: CustomerSelectionItem[];
}

export interface CustomerSelectionItem {
  id: string;
  selection_id: string;
  dish_id: string;
  dish_name: string;
  category_name: string | null;
  price_per_person: number; // in paise
  quantity_per_person: number;
  serving_unit: string;
  total_guest_count: number;
  total_calculated_quantity: number;
  total_dish_cost: number; // in paise
  created_at: string;
}

// Real-time calculation request & response
export interface CalculateEstimationRequest {
  guest_count: number;
  dish_selections: {
    dish_id: string;
    quantity_per_person?: number;
  }[];
}

export interface CalculateEstimationResponse {
  guest_count: number;
  items: {
    dish_id: string;
    dish_name: string;
    category_id: string;
    category_name: string;
    food_type: string;
    price_per_person: number;
    quantity_per_person: number;
    serving_unit: string;
    total_dish_quantity: number;
    dish_cost: number;
  }[];
  subtotal: number;
  service_charge: number;
  service_charge_rate: number;
  service_charge_enabled: boolean;
  transportation_charge: number;
  transportation_enabled: boolean;
  taxable_amount: number;
  gst_amount: number;
  gst_rate: number;
  gst_enabled: boolean;
  grand_total: number;
  cost_per_guest: number;
}
