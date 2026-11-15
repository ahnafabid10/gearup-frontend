# GearUp Frontend

Next.js App Router + React + TypeScript + Tailwind CSS. Uses the original project dependencies only.

## Run

1. Run your GearUp backend on port 5000.
2. Optionally set `GEARUP_API_URL` in `.env.local` to your backend origin (without `/api`). Default: `http://localhost:5000`.
3. `npm install`
4. `npm run dev`
5. Open http://localhost:3000.

`npm run lint` checks source; `npm run build` creates a production build.

## Features

Responsive landing page, real API catalog/search/category/brand/price/stock filtering, gear gallery, native date controls and rental quote, customer/provider registration, login and logout, role-checked dashboards, rentals and payments, returned-order reviews, provider inventory CRUD, order status actions, admin users and moderation lists, skeletons and error recovery.

Next.js 16 calls Middleware `proxy.ts`. Proxy checks authentication cookies; the server dashboard layout validates the current user with the backend and enforces the role. Mutating APIs still enforce backend authorization. The same-origin gateway keeps authentication tokens in HttpOnly cookies and rejects cross-origin mutations.

## Backend limitations

- `/api/payments/create` creates a PaymentIntent. The payment page mounts Stripe Payment Element using Stripe.js, then confirms the payment through Stripe and the backend. Set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `.env.local` and configure matching Stripe credentials on the backend. Mock secrets are rejected. This is an embedded payment form; hosted Stripe Checkout/SSLCommerz redirect is not implemented. The outcome page reads the rental status from the backend.
- The API exposes available stock, but no date-based reservations calendar or overlap checking. Date controls reject past dates and invalid date ranges. Date-specific availability filtering requires a backend extension.
- Image input accepts HTTPS URLs (one per line); binary file upload requires a backend upload endpoint. Images use next/image optimization.
- Overview metrics use server totals where exposed; provider/customer lists use their complete returned collections. Failed metrics display a dash.

See ASSIGNMENT5.md for requirements and actual API mappings.

## How to read the code

Start with a route under `src/app`, then follow its import into `src/features`. Routes handle Next.js parameters; feature components handle screen state, actions and markup.

| Location                              | Responsibility                                               |
| ------------------------------------- | ------------------------------------------------------------ |
| `src/app/page.tsx`                    | Home route; imports `features/home/home-page.tsx`            |
| `src/features/auth`                   | Login, registration and form submission                      |
| `src/features/gear`                   | Search filters, gear details and rental requests             |
| `src/features/dashboard`              | Role-based tables, actions and overview metrics              |
| `src/features/inventory`              | Provider gear create/edit form                               |
| `src/features/reviews`                | Returned-rental review form                                  |
| `src/features/payment`                | Rental payment summary, Stripe form and outcome verification |
| `src/components/layout`               | Shared header and footer                                     |
| `src/components/shared`               | Loading, empty/error state and status badge                  |
| `src/components/gear`                 | Reusable gear card                                           |
| `src/hooks/use-api-data.ts`           | Fetch state, reload and stale-response handling              |
| `src/lib/api.ts`                      | Browser API requests and list response normalization         |
| `src/lib/types.ts`                    | Shared API record and response shapes                        |
| `src/lib/format.ts`                   | Currency and date formatting                                 |
| `src/app/api/[...path]/route.ts`      | Server gateway and HttpOnly authentication cookies           |
| `src/proxy.ts`                        | Authentication-cookie route guard                            |
| `src/app/dashboard/[role]/layout.tsx` | Backend-verified role guard                                  |
| `src/app/globals.css`                 | Shared design rules followed by responsive overrides         |

For a rental request, read `features/gear/gear-details.tsx` → `lib/api.ts` → `app/api/[...path]/route.ts`. In the backend, follow `src/app.ts` → `modules/rental/rental.route.ts` → `rental.controller.ts` → `rental.service.ts` → Prisma. The backend already uses the same route/controller/service pattern for auth, gear, payment, admin and reviews.

Keep new routes thin, place feature behavior beside its screen, and put reusable UI in `components`. Form handlers live above the returned JSX so request logic can be read independently of markup. No project dependencies were added for this organization.

## Validation

TypeScript and ESLint checks pass. In the managed Windows environment the production build is blocked when Turbopack starts Node worker processes (the workers exit before connecting, including the existing Tailwind loader). A production build and browser/end-to-end rental/payment verification are still required in a normal local runtime with the backend running.
