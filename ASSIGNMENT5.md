# Assignment 5 — GearUp Frontend

Rent Sports & Outdoor Gear Instantly.

## Constraints

- Work only in gearup-frontned; keep existing Next.js, React, TypeScript and Tailwind packages.
- Consume the existing GearUp backend; do not change backend projects.
- Responsive, accessible UI with next/image, loading skeletons, error boundaries and feedback.

## Scope

- Home, searchable gear catalog with category/brand/price/availability filters.
- Gear details, gallery, provider, specifications, rental dates and price summary.
- Registration (Customer/Provider), login and server-checked role-protected dashboards.
- Customer orders, cancellation, payment history and returned-order reviews.
- Provider inventory CRUD with image URLs, stock, pricing and order status actions.
- Admin user search/pagination and suspension, gear and rental moderation views.
- Payment initiation and success/cancel pages. Existing backend returns PaymentIntents rather than hosted Checkout URLs; hosted redirect requires backend support. Never present an unverified payment as successful.

## Routes

/, /gear, /gear/[id], /auth/login, /auth/register,
/dashboard/customer, /dashboard/customer/orders/[id]/pay,
/dashboard/provider, /dashboard/provider/gear/new,
/dashboard/provider/gear/[id]/edit, /dashboard/provider/orders,
/dashboard/admin, /payment/success, /payment/cancel.

## API mapping (actual backend)

- /api/auth/register, /api/auth/login, /api/auth/me
- /api/gear, /api/gear/:id, /api/categories
- /api/rentals, /api/rentals/:id, PATCH /api/rentals/:id/cancel
- /api/payments/create, /api/payments/confirm, /api/payments
- /api/provider/gear/my, POST /api/provider/gear, PUT/DELETE /api/provider/gear/:id
- /api/provider/orders, PATCH /api/provider/orders/:id
- /api/admin/users, PATCH /api/admin/users/:id, /api/admin/gear, /api/admin/rentals
- POST /api/reviews

## Status colors

PLACED amber; CONFIRMED blue; PAID purple; PICKED_UP green; RETURNED gray; CANCELLED red.

## Integration notes

Use a same-origin server API gateway to keep tokens in HttpOnly cookies. Configure GEARUP_API_URL (default http://localhost:5000). Date overlap validation remains authoritative on the backend; the current public API does not expose a reservation calendar.

## Implementation review

These statuses describe code implementation, not a completed live rental/payment acceptance test.

| Requirement                                              | Current state                                                                             |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Home, catalog, details, optimized images                 | Implemented                                                                               |
| Category, brand, maximum price and current-stock filters | Implemented                                                                               |
| Minimum price and date-availability filters              | Not implemented                                                                           |
| Customer/provider registration, login and role guards    | Implemented; Next.js 16 uses `proxy.ts`                                                   |
| Rental dates and price summary                           | Implemented; native date constraints, no reservation calendar                             |
| Customer rentals, payments and returned-order reviews    | Implemented                                                                               |
| Provider gear CRUD and rental status actions             | Implemented                                                                               |
| Admin statistics, user search/pagination and suspension  | Implemented                                                                               |
| Admin gear/rental inspection                             | Implemented as read-only lists                                                            |
| Stripe payment form and outcome pages                    | Implemented with Stripe.js; credentials and live verification required                    |
| Hosted Stripe Checkout or SSLCommerz redirect            | Not implemented; backend exposes PaymentIntents                                           |
| Prevent overlapping reservations                         | Requires backend availability/overlap support                                             |
| Toast notifications / optimistic updates                 | Toast feedback and refetch are implemented; optimistic behavior is not implemented |
| Skeletons and route error fallback                       | Implemented                                                                               |

See README.md for the feature-by-feature source map and setup requirements.

## Source review findings — 2026-11-13

- Fixed admin pagination for gear and rental lists (previously pagination was only rendered for users).
- Fixed payment-history gear names to read `rentalOrder.gear.title` from the actual API response.
- Backend blocker: public auth validation accepts ADMIN and the registration service saves the requested role directly.
- Backend blocker: payment confirmation does not bind the supplied PaymentIntent to the stored intent, order, customer, currency and amount. Mock configuration also accepts confirmation without Stripe verification.
- Backend blocker: rental stock is read before the transaction and written as an absolute value. Concurrent bookings can pass the same stock check. Reservation date overlap is not checked.
- Hosted checkout, reservation calendar, production build and end-to-end payment verification remain incomplete. Source review and static checks do not establish live correctness.

## Backend corrections authorized and implemented

The findings above are historical. Public registration now rejects ADMIN in both validation and service logic. Payment confirmation verifies the stored intent, ownership, order metadata, currency, amount and received amount; mock confirmation and automatic test-card confirmation were removed. Webhooks require a signature and use the same verification. Payment requests reuse the stored intent and use Stripe idempotency keys.

Rental creation reads stock, checks overlapping active reservations and creates the order inside a serializable transaction. Concurrent conflicts abort rather than oversell. Cancellation/return use expected-status updates to prevent duplicate stock restoration. Pickup requires payment. Existing conservative stock semantics remain: any outstanding reservation consumes a unit until cancellation/return, even if dates do not overlap. A public date calendar is still not implemented.

Regression command: `node --test tests/security.cjs` in gearup-backend. These isolated tests mock Stripe/database access; live Stripe and PostgreSQL concurrency acceptance tests remain required.

