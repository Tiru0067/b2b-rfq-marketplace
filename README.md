# ProcureX — Enterprise B2B RFQ Marketplace

> A production-grade, full-stack B2B Request for Quotation (RFQ) marketplace built with React, Node.js/Express, PostgreSQL, and Prisma ORM.

[![Live Frontend](https://img.shields.io/badge/Live_App-Vercel-black?logo=vercel)](https://b2b-rfq-marketplace-gamma.vercel.app)
[![Live Backend](https://img.shields.io/badge/Live_API-Render-46E3B7?logo=render)](https://b2b-rfq-marketplace-1-kq2x.onrender.com/api/health)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717?logo=github)](https://github.com/Tiru0067/b2b-rfq-marketplace)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

* **Live Application URL**: [https://b2b-rfq-marketplace-gamma.vercel.app](https://b2b-rfq-marketplace-gamma.vercel.app)
* **Live REST API (Render)**: [https://b2b-rfq-marketplace-1-kq2x.onrender.com/api](https://b2b-rfq-marketplace-1-kq2x.onrender.com/api)
* **Backend Health Check**: [https://b2b-rfq-marketplace-1-kq2x.onrender.com/api/health](https://b2b-rfq-marketplace-1-kq2x.onrender.com/api/health)

---

## 1. Overview

**ProcureX** connects corporate buyers who need goods or services in volume with qualified suppliers who submit competitive commercial bids.

```
BUYER                                        SUPPLIER
  │                                             │
  │  Create RFQ                                 │  Browse Market Feed
  │  "100 Ergonomic Office Chairs"              │  Search / Filter by Location
  │                                             │
  └─────────────────── RFQ ─────────────────────┘
                                                │
                                            Submit Quote
                                            ₹4,20,000 · 14 Days
                                            "Factory direct pricing..."
                                                │
  Buyer Evaluates Quotations ◄──────────────────┘
  (Highlights Lowest Bid & Fastest Lead Time)
  │
  ▼
  Buyer Awards Deal to Winner
  (RFQ closes automatically, winning quote marked AWARDED)
```

---

## 2. Technology Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | React 19 + Vite + Tailwind CSS v4 | Ultra-fast SPA with reactive state, zero bloat, and enterprise styling. |
| **Routing & Icons** | React Router v7 + Lucide React | Clean client-side navigation with route guards and scalable icons. |
| **Backend API** | Node.js + Express (ES Modules) | Lightweight, predictable REST API following the Router-Controller pattern. |
| **Database & ORM** | PostgreSQL (Neon Serverless) + Prisma | Strongly typed relational schema, automatic migrations, and referential integrity. |
| **Auth & Security** | JWT (JSON Web Tokens) + `bcryptjs` | Stateless, role-based session authorization (`BUYER` vs `SUPPLIER`). |
| **Validation** | Zod | Declarative schema validation enforcing business rules on the API boundary. |

---

## 3. High-Level Architecture

```
                      ┌───────────────────────────────────────┐
                      │          React 19 Frontend            │
                      │  (Vite + Tailwind v4 + React Router)  │
                      └──────────────────┬────────────────────┘
                                         │  HTTP / REST (Axios)
                                         │  Bearer JWT Authorization
                                         ▼
                      ┌───────────────────────────────────────┐
                      │          Express REST API             │
                      │  - CORS & Body Parser Middleware      │
                      │  - JWT Authentication Guard           │
                      │  - Role Authorization (Buyer/Supplier)│
                      │  - Zod Input Validation Layer         │
                      │  - Centralized Error Handler          │
                      └──────────────────┬────────────────────┘
                                         │  Type-safe Queries
                                         ▼
                      ┌───────────────────────────────────────┐
                      │              Prisma ORM               │
                      └──────────────────┬────────────────────┘
                                         │  Connection Pooling
                                         ▼
                      ┌───────────────────────────────────────┐
                      │       Neon PostgreSQL Database        │
                      │  - users (id, email, password, role)  │
                      │  - rfqs (id, specs, quantity, status) │
                      │  - quotations (price, days, notes)    │
                      └───────────────────────────────────────┘
```

---

## 4. Key Engineering & Architecture Decisions

1. **Role-Based Authorization Guards**:
   - `BUYER`: Can create, edit, manage, and toggle their own RFQs, and view all supplier bids received for them. Cannot submit bids.
   - `SUPPLIER`: Can browse, search, and inspect open RFQs, submit commercial quotations, and track submission history. Cannot create RFQs.
2. **Resource Ownership Verification**:
   - A buyer can only edit or view quotations for RFQs they authored (`rfq.buyerId === req.user.id`). Unauthorized cross-tenant attempts return `403 Forbidden`.
3. **Backend-First Validation**:
   - Client-side validation improves user experience, but server-side Zod schemas strictly guarantee that quantities > 0, prices > 0, and deadlines are valid future timestamps.
4. **Duplicate Bid Prevention**:
   - Suppliers can only submit one quote per RFQ, enforced by a Prisma composite unique constraint `@@unique([rfqId, supplierId])` and controller checks.
5. **Atomic Deal Awarding**:
   - When a buyer clicks "Award Deal" on their preferred quotation, an atomic Prisma transaction runs:
     - Sets the chosen quotation status to `AWARDED`.
     - Sets competing quotations on that RFQ to `NOT_SELECTED`.
     - Closes the RFQ (`status: CLOSED`), preventing any further bids.
6. **Reopen Protection & Deadline Validation**:
   - Reopening an RFQ whose original deadline has expired prompts the buyer to choose a new future deadline. Reopening with past deadlines is rejected at the API level.
7. **Full Supplier History & Transparency**:
   - Suppliers retain permanent access in `/my-quotes` to review the full specification (description, volume, delivery location, deadline) for every RFQ they bid on, alongside the commercial outcome (`Awarded to You`, `Not Selected`, or `Under Review`).
8. **Smart Bid Highlights**:
   - When a buyer inspects received quotations, the application automatically analyzes competing bids and displays:
     - 🟢 **Lowest Bid** (most cost-effective price)
     - ⚡ **Fastest Delivery** (shortest fulfillment lead time)
     - ⚪ **Standard Bid** (balanced competitive proposals in between)
     - ⚪ **Single Bid** (when only one quotation is submitted)
9. **State Handling (Loading, Empty, Error)**:
   - Every view handles loading spinners, non-blocking error banners with retry buttons, and friendly empty states with calls-to-action.

---

## 5. Seed Demo Accounts

The database comes pre-seeded with realistic enterprise procurement data. You can log in with 1 click using the demo buttons on `/login` or enter the credentials below:

| Role | Email | Password | Organization / Name |
| :--- | :--- | :--- | :--- |
| **Buyer** | `buyer1@techcorp.com` | `password123` | Priya Sharma (TechCorp Solutions) |
| **Buyer** | `buyer2@apexlogistics.com` | `password123` | Rohan Mehta (Apex Retail) |
| **Supplier** | `supplier1@acme.com` | `password123` | Acme Furnishings & Gear |
| **Supplier** | `supplier2@zenith.com` | `password123` | Zenith Wholesale Supplies |
| **Supplier** | `supplier3@omni.com` | `password123` | Omni Industrial Solutions |
| **Supplier** | `supplier4@primepack.com` | `password123` | Prime Logistics & Packaging |

---

## 6. REST API Endpoints

### Authentication
* `POST /api/auth/register` — Create buyer or supplier account
* `POST /api/auth/login` — Authenticate and receive signed JWT
* `GET /api/auth/me` — Get current logged-in user profile

### Buyer Endpoints (Protected: BUYER only)
* `POST /api/rfqs` — Create a new RFQ
* `GET /api/buyer/rfqs` — List all RFQs authored by current buyer (with quote counts)
* `GET /api/buyer/rfqs/:id` — Get full RFQ details + all received supplier quotations
* `PUT /api/buyer/rfqs/:id` — Edit an existing RFQ (ownership checked)
* `PATCH /api/buyer/rfqs/:id/status` — Toggle RFQ status between `OPEN` and `CLOSED` (requires future deadline if reopening expired RFQ)
* `PATCH /api/buyer/rfqs/:id/award/:quoteId` — Award contract to chosen quotation and automatically close RFQ

### Supplier Endpoints (Protected: SUPPLIER only)
* `GET /api/rfqs` — Browse and filter open RFQs (supports `?search=` and `?location=`)
* `GET /api/rfqs/:id` — View complete specification for an RFQ
* `POST /api/rfqs/:id/quotations` — Submit quotation (price, lead time, notes)
* `GET /api/supplier/quotations` — View all submitted quotations history with status (`AWARDED`, `NOT_SELECTED`, `PENDING`)

---

## 7. Local Setup & Running Instructions

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database (or free [Neon](https://neon.tech) database)

### Backend Setup
```bash
cd server
npm install

# Configure environment variables in server/.env
# PORT=5000
# DATABASE_URL="your-postgresql-connection-string"
# JWT_SECRET="your-secret-key"

# Run Prisma migrations & seed demo data
npx prisma db push
node prisma/seed.js

# Start backend server
npm run dev
```
Backend will start on `http://localhost:5000`.

### Frontend Setup
```bash
cd client
npm install

# Start Vite development server
npm run dev
```
Frontend will start on `http://localhost:3000` (automatically proxies `/api` calls to port 5000).

---

## 8. Assumptions & Limitations

1. **Currency**: Pricing is standardized in Indian Rupees (₹).
2. **Single Quotation per Supplier**: A supplier can currently submit one active quotation per RFQ to keep bidding clean.
3. **Logistics & Delivery**: The scope focuses on the procurement and quotation stage (bidding and deal awarding); post-bid warehouse logistics/shipping tracking happens in third-party ERP systems.

---

## License
ISC
