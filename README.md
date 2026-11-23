# Wedding Feast – Wedding Catering & Food Estimation Platform

A complete, production-ready, responsive web application for managing wedding catering menus, dishes, recipes, pricing rules, and real-time customer food selections with instant catering cost estimation.

Built following the supplied Figma design system featuring an Indian royal wedding theme with ivory, cream, deep maroon (`#68182B`), royal gold (`#C99738`), and elegant typography.

---

## 🏰 Features & Interfaces

### 1. Admin Management Portal (`/admin`)
- **Dashboard (`/admin/dashboard`)**:
  - Live metric cards (Total Dishes, Total Events, Customer Selections, Estimated Revenue) with percentage trends queried directly from Cloudflare D1.
  - Smooth SVG curve Revenue Overview chart with monthly markers.
  - Popular Dishes with visual progress bars, dish thumbnails, and selection percentages.
  - Recent Activities feed tracking events, dish updates, and incoming customer selections.
  - Royal wedding mandap decoration banner.
- **Food Categories (`/admin/categories`)**:
  - Grid of category cards (Starters, Main Course, Rice & Biryani, Breads, Desserts, Beverages, Live Counters, Ice Creams, Traditional Sweets).
  - Add / Edit / Soft Delete categories.
  - Category status toggle switches (Active / Inactive).
  - Category image upload directly to Cloudflare R2 object storage.
- **Manage Dishes (`/admin/dishes`)**:
  - Search dishes by keyword.
  - Filter by Category, Dietary Type (Veg, Non-Veg, Vegan), and Status (Active, Inactive).
  - Grid View and Professional Data Table view toggles.
  - Dish cards with Veg/Non-Veg indicators, price per person, status badges, and action buttons.
  - Pagination controls.
- **Add / Edit Dish (`/admin/dishes/new` & `/admin/dishes/:id/edit`)**:
  - Two-column layout matching Figma Screen 4.
  - Multi-image upload to Cloudflare R2 with image strip and primary image selector.
  - Full form fields: Dish Name, Category dropdown, Food Type radio chips (Veg, Non-Veg, Vegan), Description, Price per Person (₹), Quantity per Person (g/ml/pcs), Minimum Order Qty, Preparation Time, Availability toggle.
  - Sub-tabs for Ingredients, Recipe Instructions, and Nutrition Info.
- **Recipe Management (`/admin/recipes`)**:
  - Dish preview card on left with image, price, and prep time.
  - Dish selector dropdown.
  - Ingredients table (Ingredient, Quantity, Unit, actions edit/delete) with "+ Add Ingredient".
  - Ordered Preparation Steps with numbered steps and Cooking Time badge.
- **Pricing & Estimation Settings (`/admin/pricing`)**:
  - General Settings, Catering Charges, Transportation, Taxes & Others tabs matching Figma Screen 6.
  - Configurable serving quantities, currency (INR ₹), Catering service charges (%), Transportation charge (₹), GST (%).
  - Live Estimated Cost Preview (per guest) card dynamically updating based on settings.
- **Customer Selections & Bookings (`/admin/selections`)**:
  - View all incoming customer wedding catering bookings.
  - Modal view displaying itemized dish breakdown, bulk preparation quantities (in kg), and financial audit.

---

### 2. Customer Website (`/` and `/menu`)
- **Event Details Configuration**:
  - Couple / Host Name, Event Name, Event Type, Event Date, Venue, Number of Guests (with quick stepper e.g. 100, 200, 350, 500+ guests), Contact details.
- **Two-Column Selection Experience (65% / 35%)**:
  - **Left Panel (65%)**:
    - Category navigation pills (All, Starters, Main Course, Biryani, Breads, Desserts, Beverages, Live Counters, etc.).
    - Search bar and Pure Veg / Non-Veg / Vegan dietary filters.
    - Dish cards with high-res photography, portion per guest, price per person, and "Add to Feast" / Portion Adjustment stepper.
  - **Right Panel (35% Sticky Live Estimate)**:
    - Real-time instant estimation calculated on backend using integer paise.
    - Selected dishes list with portions, unit price, and dish subtotal.
    - Transparent cost breakdown: Food Subtotal, Catering Service Charge, Transportation, GST, Grand Total, and Estimated Cost per Guest.
    - Real-time updates as dishes are added, removed, or guest count changes.
- **Menu Review & Booking (`/menu-review`)**:
  - Complete review grouped by category.
  - Bulk preparation requirements (e.g. 35 kg Paneer Tikka, 52.5 kg Biryani).
  - Special dietary instructions input.
  - "Confirm & Submit Selection" button saving directly to Cloudflare D1 with atomic database records.
  - Confirmed Booking reference receipt.

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | Angular 21 | Standalone components, Reactive Forms, Signals, SCSS, Desktop-first responsive |
| **Backend** | Cloudflare Workers | TypeScript, Hono REST framework, Web Crypto JWT authentication |
| **Database** | Cloudflare D1 | SQLite serverless relational database, foreign keys, migrations |
| **Object Storage** | Cloudflare R2 | S3-compatible asset storage, unique keys, metadata in D1 |
| **Monetary Math** | Minor Units | All prices and amounts calculated in integer **paise** (1 INR = 100 paise) |

---

## 🗄️ Database Design (Cloudflare D1)

The platform includes full SQL migrations under `backend/migrations/`:
1. `admin_users`: Authentication with SHA-256 password hash & JWT sessions.
2. `food_categories`: Category metadata, display order, soft deletion (`is_deleted`).
3. `dishes`: Dishes with food type (`veg`/`non-veg`/`vegan`), price in paise, portion units.
4. `dish_images`: Multiple R2 image keys per dish, primary image flag.
5. `recipes`: Dish cooking time, prep time, servings.
6. `recipe_ingredients`: Name, quantity, unit (`g`, `kg`, `ml`, `l`, `pcs`, `tbsp`, `tsp`).
7. `recipe_steps`: Ordered preparation instructions.
8. `estimation_settings`: Configurable service charges, transport fees, GST rates.
9. `events`: Customer wedding details, venue, date, guest count.
10. `customer_selections`: Computed subtotal, service fee, GST, grand total, per guest cost.
11. `customer_selection_items`: Itemized dish costs, guest count, and bulk quantities.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- npm
- Cloudflare Wrangler CLI (`npm install -g wrangler`)

### Default Admin Credentials
- **Username**: `admin`
- **Password**: `Admin@123`
- **Email**: `admin@weddingfeast.com`

---

### Step 1: Backend Setup & Database Migration
```bash
cd backend
npm install

# Apply database migrations to local Cloudflare D1:
npm run migrate:local

# Start backend Cloudflare Worker (runs on port 8787):
npm run dev
```

### Step 2: Frontend Setup
```bash
cd frontend
npm install

# Start Angular development server:
npx ng serve --port 4201
```

Open `http://localhost:4201/` in your browser.

---

## ☁️ Cloudflare Production Deployment

### 1. Create Cloudflare D1 Database
```bash
wrangler d1 create wedding-feast-db
```
Copy the generated `database_id` into `backend/wrangler.jsonc`.

### 2. Create Cloudflare R2 Bucket
```bash
wrangler r2 bucket create wedding-feast-images
```

### 3. Apply Migrations to Remote D1
```bash
cd backend
wrangler d1 migrations apply wedding-feast-db --remote
```

### 4. Deploy Backend Worker
```bash
cd backend
wrangler deploy
```

### 5. Build & Deploy Frontend (Cloudflare Pages)
```bash
cd frontend
npm run build
wrangler pages deploy dist/frontend/browser --project-name=wedding-feast-frontend
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Admin login with SHA-256 hash & JWT |
| `GET` | `/api/auth/me` | Current authenticated admin profile |
| `GET` | `/api/categories` | List active / all food categories |
| `POST` | `/api/categories` | Admin create category |
| `PUT` | `/api/categories/:id` | Admin update category |
| `DELETE` | `/api/categories/:id` | Admin soft delete category |
| `POST` | `/api/categories/:id/image` | Upload category image to R2 |
| `GET` | `/api/dishes` | List dishes with filters, search, pagination |
| `GET` | `/api/dishes/:id` | Get dish details with images and recipe |
| `POST` | `/api/dishes` | Admin create dish |
| `PUT` | `/api/dishes/:id` | Admin update dish |
| `DELETE` | `/api/dishes/:id` | Admin delete dish |
| `POST` | `/api/dishes/:id/images` | Upload image to R2 and store in D1 |
| `DELETE` | `/api/dishes/:id/images/:imgId`| Delete image from R2 and D1 |
| `GET` | `/api/recipes` | List recipes |
| `GET` | `/api/recipes/dish/:dishId` | Get recipe for a dish |
| `POST` | `/api/recipes` | Create or update recipe with ingredients & steps |
| `GET` | `/api/pricing-settings` | Get estimation settings |
| `PUT` | `/api/pricing-settings` | Admin update pricing rules |
| `POST` | `/api/selections/calculate` | Live estimation calculation without saving |
| `POST` | `/api/selections` | Submit customer wedding catering order |
| `GET` | `/api/selections` | Admin list all customer bookings |
| `GET` | `/api/selections/:id` | Get customer booking with full breakdown |
| `GET` | `/api/dashboard/overview` | Admin dashboard metrics from D1 |
| `GET` | `/api/dashboard/popular-dishes` | Most popular dishes |
| `GET` | `/api/dashboard/revenue` | Revenue trend data |
| `GET` | `/api/images/*` | Controlled image delivery from Cloudflare R2 |
