# MediFind Backend — API Server

The backend of MediFind is a Node.js REST API built using Express, validated with Zod, and configured with a PostgreSQL database via Prisma ORM.

---

## Module & Router Structure

The server splits features into routes under `src/routes/`:
1. **Auth Router (`auth.routes.js`)**: Resolves login, registration, OTP request/verification, Google authentication, session listings, tokens refresh, and logouts.
2. **Pharmacy Router (`pharmacy.routes.js`)**: Manages medical store setup, onboarding, verification workflows, and detail retrieval.
3. **Medicine Router (`medicine.routes.js`)**: Catalogs system-wide medicines (search, details, creation, updates, deletion).
4. **Inventory Router (`inventory.v2.routes.js`)**: Stores inventory items (batch numbers, prices, stock quantities, stock adjustments).
5. **Commerce Router (`commerce.routes.js`)**: Drives customer-facing operations including cart, uploads for prescriptions, checkouts, and ratings reviews.
6. **Dashboard Router (`dashboard.routes.js`)**: Serves profile data summaries for customers, managers, pharmacists, and admins.

---

## API Endpoints Reference

This is the single source of truth for documented endpoint locations in the application:

### Authentication Namespace (`/api/v1/auth`)
* `POST /register` — Register a new account.
* `POST /login` — Traditional email/password session issue.
* `POST /otp/request` — Create validation code.
* `POST /otp/verify` — Check code validity and log in.
* `POST /google` — Sign in using Google OAuth.
* `POST /refresh` — Refresh the JSON Web Token.
* `POST /logout` — Revoke active token.
* `GET /sessions` — View logged-in sessions.

### Pharmacies Namespace (`/api/v1/pharmacies`)
* `POST /` — Register a pharmacy store (Owner only).
* `GET /mine` — Return pharmacy owned by the requester.
* `GET /admin/pending` — List stores awaiting verification (Admin only).
* `GET /:storeId` — Retrieve detailed pharmacy metadata.
* `PATCH /:storeId` — Update store details (Manager/Owner only).
* `PATCH /:storeId/verification` — Verify, suspend, or reject a store license (Admin only).

### Medicine Namespace (`/api/v1/medicines`)
* `GET /` — Search and paginate the catalog.
* `GET /:id` — Details of a specific medicine.
* `POST /` — Introduce a new catalog entry (Admin/Pharmacist only).
* `PATCH /:id` — Edit an entry (Admin/Pharmacist only).
* `DELETE /:id` — Mark an entry inactive (Admin only).

### Inventory Namespace (`/api/v1/inventory`)
* `GET /store/:storeId` — View inventory stock listings for a pharmacy.
* `POST /store/:storeId` — Insert new inventory batch record (Owner/Manager/Pharmacist only).
* `PATCH /:id` — Update stock levels (Owner/Manager/Pharmacist only).
* `DELETE /:id` — Remove stock items (Owner/Manager/Pharmacist only).

### Commerce Namespace (`/api/v1/commerce`)
* `GET /search` — Distance-based and price-based nearby store comparisons.
* `GET /cart` — Return current cart.
* `POST /cart/items` — Add or modify cart items.
* `DELETE /cart/items/:inventoryId` — Remove a cart item.
* `POST /prescriptions` — Upload medical records.
* `POST /checkout` — Transact and create orders.
* `GET /orders` — Returns user order logs.
* `PATCH /orders/:id/status` — Modify order stages (Admin only).
* `POST /reviews` — Rate a pharmacy store.

### Dashboard Namespace (`/api/v1/dashboard`)
* `GET /admin/overview` — Platform KPI stats (Admin only).
* `GET /pharmacy/overview/:storeId` — Store performance statistics.
* `GET /customer` — User metrics, saved stores, prescriptions.
* `POST /ai/symptom-search` — Disclaimer-backed search index helper.

---

## Database Schema (Prisma Models)

The schema database configuration is defined in [server/prisma/schema.prisma](file:///c:/Users/vishwanath_cse/Documents/New%20project/server/prisma/schema.prisma).
Key relations include:
* **User** is linked to multiple **MedicalStore** ownerships, **Session** caches, **OtpCode** codes, **Cart** objects, **Prescription** uploads, and **CommerceOrder** items.
* **MedicalStore** houses inventory lines (**Inventory**), reviews (**StoreReview**), and coordinates orders (**CommerceOrder**).
* **Inventory** associates **Medicine** descriptions with **MedicalStore** prices and stocks.
* **CommerceOrder** connects customer **User**, target **MedicalStore**, payments (**Payment**), and purchased item details (**OrderItem**).

### Migrations
To manage PostgreSQL schemas:
```bash
# Generate the client files
npx prisma generate

# Create and deploy development migrations
npx prisma migrate dev --name <migration_name>

# Deploy production migrations
npx prisma migrate deploy
```

---

## Auth & Role-Based Access Control (RBAC)

The application enforces security checks through route middleware:
1. `requireAuth`: Reads and validates JWT tokens from the HTTP header.
2. `allowRoles("ROLE1", "ROLE2")`: Restricts paths to specific enum profiles (`CUSTOMER`, `PHARMACY_OWNER`, `PHARMACY_MANAGER`, `PHARMACIST`, `DELIVERY_PARTNER`, `ADMIN`).
3. `requireStoreAccess`: Validates that a pharmacy employee belongs to the store being managed.

---

## Environment Variables

Copy `server/.env.example` to `server/.env` and update the parameters:
* `DATABASE_URL`: PostgreSQL connection string (e.g. `postgresql://postgres:password@localhost:5432/medifind`).
* `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`: Secrets for signing tokens.
* `PORT`: Node server listener port (defaults to `4000`).
* `CLIENT_URL`: CORS configuration.
* `REDIS_URL`: Cache layer parameters (for sessions/rate-limits).
* `CLOUDINARY_URL`: Storage parameters for prescription attachments.
* `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`: UPI payment gateway.
* `STRIPE_API_KEY`: Card payment gateways.
* `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN`: SMS delivery configurations.
* `RESEND_API_KEY`: Email delivery configurations.

---

## Development Commands

Run inside the `server/` folder:
* **Install dependencies**: `pnpm install`
* **Run in watch mode**: `pnpm dev`
* **Start production bundle**: `pnpm start`
* **Generate Prisma Client**: `pnpm prisma:generate`
* **Migrate database changes**: `pnpm prisma:migrate`
