# 🔌 API Integration & Documentation — GearUp Frontend

This document maps all frontend components and user workflows to their corresponding GearUp Backend REST API endpoints.

---

## 🛰️ Architecture Overview

The frontend communicates with the backend via a **Same-Origin Next.js Serverless API Gateway** (`/api/[...path]`).

```
Browser Component  ──▶  Next.js Proxy (/api/*)  ──▶  Backend API (Render/Local)
   (Client Side)          (HttpOnly Cookies)         (Authorization: Bearer <token>)
```

- **Base Gateway:** `src/app/api/[...path]/route.ts`
- **Request Client Helper:** `src/lib/api.ts`
- **React Data Fetching Hook:** `src/hooks/use-api-data.ts`

---

## 📋 Comprehensive Endpoint to Component Mapping

### 1. Authentication & Session Management
| Frontend Component | Action / Event | Method | Backend Endpoint | Request Payload / Description | Auth Required |
| :--- | :--- | :---: | :--- | :--- | :---: |
| `src/features/auth/auth-form.tsx` | User Registration | `POST` | `/api/auth/register` | `{ name, email, password, role }` | No |
| `src/features/auth/auth-form.tsx` | User Login | `POST` | `/api/auth/login` | `{ email, password }` (sets HttpOnly token cookie) | No |
| `src/components/layout/header.tsx` | Fetch Current User | `GET` | `/api/auth/me` | Validates session & role | Yes |
| `src/components/layout/header.tsx` | Sign Out | `POST` | `/api/auth/logout` | Clears accessToken & refreshToken cookies | Yes |

---

### 2. Public Catalog & Equipment Details
| Frontend Component | Action / Event | Method | Backend Endpoint | Request Payload / Description | Auth Required |
| :--- | :--- | :---: | :--- | :--- | :---: |
| `src/features/home/home-page.tsx` | Load Featured Gear | `GET` | `/api/gear?limit=4` | Retrieves latest equipment items | No |
| `src/features/home/home-page.tsx` | Category Badges | `GET` | `/api/categories` | Active gear categories | No |
| `src/features/gear/gear-catalog.tsx` | Search & Filter Catalog | `GET` | `/api/gear?...` | Query params: `search`, `categoryId`, `brand`, `minPrice`, `maxPrice`, `isAvailable`, `page`, `limit` | No |
| `src/features/gear/gear-catalog.tsx` | Category Filter Dropdown | `GET` | `/api/categories` | Populates active category filter options | No |
| `src/features/gear/gear-details.tsx` | View Equipment Details | `GET` | `/api/gear/:id` | Full specifications, gallery, provider profile, reviews | No |

---

### 3. Customer Rentals & Checkout Flow
| Frontend Component | Action / Event | Method | Backend Endpoint | Request Payload / Description | Auth Required |
| :--- | :--- | :---: | :--- | :--- | :---: |
| `src/features/gear/gear-details.tsx` | Request Rental Order | `POST` | `/api/rentals` | `{ gearId, startDate, endDate }` | Customer |
| `src/features/dashboard/dashboard.tsx` | View Rental Orders | `GET` | `/api/rentals` | Retrieves user's rental history with status badges | Customer |
| `src/features/dashboard/dashboard.tsx` | Cancel Placed Order | `PATCH` | `/api/rentals/:id/cancel` | Cancels reservation in `PLACED` status & restores stock | Customer |
| `src/features/payment/rental-payment.tsx`| Load Rental for Payment | `GET` | `/api/rentals/:id` | Validates order readiness & total amount | Customer |
| `src/features/payment/secure-checkout.tsx`| Initiate Stripe Checkout | `POST` | `/api/payments/checkout-session` | `{ rentalOrderId }` ➔ Returns Stripe Hosted Checkout URL | Customer |
| `src/features/payment/secure-checkout.tsx`| Verify Stripe Payment | `POST` | `/api/payments/verify-session` | `{ rentalOrderId, sessionId }` ➔ Confirms payment & marks `PAID` | Customer |
| `src/features/dashboard/dashboard.tsx` | View Payment Receipts | `GET` | `/api/payments` | Completed Stripe transaction history | Customer |
| `src/features/reviews/review-form.tsx` | Leave Product Review | `POST` | `/api/reviews` | `{ rentalOrderId, rating, comment }` (unlocked on `RETURNED`) | Customer |

---

### 4. Provider Inventory & Rental Management
| Frontend Component | Action / Event | Method | Backend Endpoint | Request Payload / Description | Auth Required |
| :--- | :--- | :---: | :--- | :--- | :---: |
| `src/features/dashboard/dashboard.tsx` | Load Provider Listings | `GET` | `/api/provider/gear/my` | Retrieves provider's owned equipment items | Provider |
| `src/features/inventory/gear-form.tsx` | Create Equipment Listing | `POST` | `/api/provider/gear` | `{ title, description, brand, categoryId, dailyPrice, depositAmount, totalStock, images, isAvailable }` | Provider |
| `src/features/inventory/gear-form.tsx` | Update Equipment Listing | `PUT` | `/api/provider/gear/:id` | Updates specifications, pricing, stock, or availability | Provider |
| `src/features/dashboard/dashboard.tsx` | Delete Equipment Listing | `DELETE` | `/api/provider/gear/:id` | Permanently deletes gear listing | Provider |
| `src/features/dashboard/dashboard.tsx` | View Incoming Bookings | `GET` | `/api/provider/orders` | Retrieves incoming rental orders | Provider |
| `src/features/dashboard/dashboard.tsx` | Transition Order Status | `PATCH` | `/api/provider/orders/:id` | `{ status: "CONFIRMED" \| "PICKED_UP" \| "RETURNED" }` | Provider |
| `src/features/categories/category-management.tsx` | Suggest Category | `POST` | `/api/categories/suggestions` | `{ name, description }` | Provider |
| `src/features/categories/category-management.tsx` | View Own Suggestions | `GET` | `/api/categories/suggestions` | Track status (`PENDING`, `APPROVED`, `REJECTED`) | Provider |

---

### 5. Admin Moderation & Platform Control
| Frontend Component | Action / Event | Method | Backend Endpoint | Request Payload / Description | Auth Required |
| :--- | :--- | :---: | :--- | :--- | :---: |
| `src/features/dashboard/dashboard-overview.tsx` | Platform Metrics | `GET` | `/api/admin/users?limit=1`, `/api/gear?limit=1`, `/api/admin/rentals` | Aggregates global totals | Admin |
| `src/features/dashboard/dashboard.tsx` | Member Directory | `GET` | `/api/admin/users?search=&page=&limit=` | Paginated user list with role & counts | Admin |
| `src/features/dashboard/dashboard.tsx` | Suspend/Activate User | `PATCH` | `/api/admin/users/:id` | `{ status: "ACTIVE" \| "SUSPENDED" }` | Admin |
| `src/features/dashboard/dashboard.tsx` | Inspect All Gear | `GET` | `/api/admin/gear` | Platform-wide gear moderation | Admin |
| `src/features/dashboard/dashboard.tsx` | Inspect All Rentals | `GET` | `/api/admin/rentals` | Platform-wide rental audit | Admin |
| `src/features/categories/category-management.tsx` | Manage Categories | `GET` | `/api/categories/manage` | All active & inactive categories | Admin |
| `src/features/categories/category-management.tsx` | Create Category | `POST` | `/api/categories` | `{ name, description, image, slug }` | Admin |
| `src/features/categories/category-management.tsx` | Update Category | `PATCH` | `/api/categories/:id` | `{ name, description, image, slug, isActive }` | Admin |
| `src/features/categories/category-management.tsx` | Delete Category | `DELETE` | `/api/categories/:id` | Deletes unused category | Admin |
| `src/features/categories/category-management.tsx` | Review Suggestions | `PATCH` | `/api/categories/suggestions/:id` | `{ status: "APPROVED" \| "REJECTED", reviewNote }` | Admin |

---

### 6. User Profile Management
| Frontend Component | Action / Event | Method | Backend Endpoint | Request Payload / Description | Auth Required |
| :--- | :--- | :---: | :--- | :--- | :---: |
| `src/features/dashboard/profile-settings.tsx` | Get Profile Details | `GET` | `/api/users/profile` | Fetches contact & address details | Yes |
| `src/features/dashboard/profile-settings.tsx` | Update Profile Details | `PATCH` | `/api/users/profile` | `{ name, phone, address }` | Yes |
