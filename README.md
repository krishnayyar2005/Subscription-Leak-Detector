# Subscription Leak Detector

A full-stack personal finance web application designed to help individuals audit recurring expenses, uncover hidden "cost leaks," manage budgets, and eliminate unnecessary spending on overlapping subscriptions.

A **cost leak** happens when a user unintentionally pays for multiple subscriptions that serve the same purpose within a single category—such as paying concurrently for Spotify, Apple Music, and YouTube Music in "Music," or Netflix and Disney+ in "Video." Because billing cycles vary (weekly, monthly, annual), calculating real waste in one's head is difficult. Subscription Leak Detector unifies all subscriptions into standardized monthly and annual cost equivalents, automatically detects redundant subscriptions within categories, and pinpoints exactly how much money can be saved every month and year.

---

## ✨ Key Features

- **Centralized Subscription Management**: Add, view, and delete recurring subscriptions with custom names, categories, billing cycles (weekly, monthly, yearly), costs, billing dates, and payment methods.
- **Automated Overlap & Leak Detection**: Server-side computational engine that groups subscriptions by category, identifies duplicate services, keeps the highest-tier service, and quantifies redundant leakage.
- **Interactive Financial Dashboard**: High-level spending metrics including active subscription count, total monthly spend, projected annual leaks, and spending leak percentages.
- **Dynamic Renewal Calendar**: Chronological calendar view mapping upcoming renewal dates to help users anticipate charges and avoid unexpected auto-debits.
- **Budget Goal Tracker**: User-customizable monthly spending limits with progress indicators and threshold alerts.
- **Category Spend Reports**: Breakdown of expenditures by category with monthly/annual totals and real-time overlap warning badges.
- **Multi-Currency & Theme Switching**: Client-side conversion support across USD ($), EUR (€), GBP (£), INR (₹), and JPY (¥), paired with responsive dark and light themes.
- **Secure Authentication & Data Isolation**: User registration and login powered by JSON Web Tokens (JWT) and bcrypt password hashing, ensuring each user's financial records remain private.

---

## 🏛️ System Architecture

The application uses a decoupled client-server architecture:

```text
+-----------------------------------------------------------------------------------+
|                        Browser Client (Vanilla HTML/CSS/JS)                       |
|   (budget, calendar, dashboard, login, overlaps, reports, subscription)           |
|                                                                                   |
|   LocalStorage (Client-Only Preferences & Session):                               |
|   • essara_token (JWT Bearer Token)     • essara_currency (Active Currency)       |
|   • essara_session (User Profile Info)  • essara_theme (Dark / Light Theme)       |
|   • essara_budget_<userId> (User-Specific Monthly Budget Target)                  |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          | HTTP REST Requests (Fetch API with JWT)
                                          v
+-----------------------------------------------------------------------------------+
|                           Express 5 REST API (Node.js)                            |
|                                                                                   |
|   • Middleware: Custom CORS, express.json(), validateRegister/Login, authMiddleware|
|   • Route Handlers: /api/auth, /api/subscriptions                                 |
|   • Analysis Engine: utils/normalizeCost.js, utils/overlapDetector.js             |
|   • Centralized Error & 404 Handlers: middleware/errorHandler.js                  |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          | Mongoose 9 ODM (Encrypted TLS Connection)
                                          v
+-----------------------------------------------------------------------------------+
|                             MongoDB Atlas (Cloud NoSQL)                           |
|   • Users Collection: Salted & hashed passwords, user metadata                    |
|   • Subscriptions Collection: User-scoped subscription documents (userId indexed) |
+-----------------------------------------------------------------------------------+
```

### Security & Storage Principles

1. **Zero Direct Database Access**: The frontend browser client never communicates with MongoDB Atlas directly. The Express REST API protects database credentials, validates all incoming data, and verifies JWT tokens on every protected request.
2. **Strict User Scoping**: Subscriptions in MongoDB include a `userId` reference; database queries in the controller strictly filter by `req.user.id`, preventing cross-account data leakage.
3. **Clean LocalStorage Boundaries**: LocalStorage is reserved strictly for non-sensitive client preferences and tokens:
   - `essara_token`: JWT token for authenticating HTTP requests.
   - `essara_session`: Cached basic user profile info (`{ id, name, email }`).
   - `essara_budget_<userId>`: User-specific budget goal target.
   - `essara_currency`: Active display currency preference.
   - `essara_theme`: Active dark or light visual mode.
   *No user credentials, plain passwords, or full subscription lists are ever stored in LocalStorage.*

---

## 📂 Project Structure

```text
Subscription-Leak-Detector/
├── budget/                  # Monthly budget planner interface (budget.html, js/budget.js)
├── calendar/                # Renewal calendar interface (calendar.html, js/calendar.js)
├── css/                     # Global styles, variables, typography, and page stylesheets
├── dashboard/               # Primary dashboard interface (dashboard.html)
├── index/                   # Marketing landing page (index.html)
├── js/                      # Core frontend scripts (api.js for HTTP client, script.js for dashboard/reports engine)
├── login/                   # Authentication view for login and account creation (login.html)
├── overlaps/                # Overlap leak analysis view (index.html)
├── reports/                 # Category expenditure reports table (reports.html, js/script.js)
├── subscription/            # Subscription listing and entry forms (subscription.html, js/script.js)
├── README.md                # Project documentation and setup guide
└── backend/                 # Express REST API and MongoDB backend
    ├── config/              # Database connection setup via Mongoose (db.js)
    ├── controllers/         # Endpoint business logic (authController.js, subscriptionController.js)
    ├── middleware/          # Handlers for auth (auth.js), cors (cors.js), errors (errorHandler.js), validation (validate.js)
    ├── models/              # Mongoose data schemas and models (User.js, Subscription.js)
    ├── postman/             # Automated test suite (Subscription-Leak-Detector.postman_collection.json)
    ├── routes/              # Route definitions (/api/auth in authRoutes.js, /api/subscriptions in subscriptionRoutes.js)
    ├── utils/               # Cost normalization (normalizeCost.js) and overlap detection (overlapDetector.js)
    ├── .env.example         # Template for environment configuration variables
    ├── package.json         # Node.js dependencies, scripts, and project metadata
    ├── README.md            # Detailed backend API documentation and schema references
    └── server.js            # Express application entry point and server startup
```

---

## 🚀 How to Run

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cloud database cluster (or local MongoDB instance)
- A modern web browser and [VS Code Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) (or any static HTTP server)

### 1. Backend Setup
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` configuration file from the template:
   ```bash
   # On Windows PowerShell:
   Copy-Item .env.example .env

   # On macOS / Linux:
   cp .env.example .env
   ```
4. Edit `backend/.env` with your actual configuration values:
   ```env
   PORT=8080
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key_here
   ```
5. Start the backend API:
   ```bash
   npm start
   ```
   The backend will connect to MongoDB Atlas and listen at `http://localhost:8080/`.

### 2. Frontend Setup
1. From the project root, open the workspace in VS Code.
2. Right-click on `login/login.html` and select **"Open with Live Server"** (or use any static file server running on `http://127.0.0.1:5500`).
3. Create a new account or log in with existing credentials.

> **Important**: The backend server must remain running at `http://localhost:8080` while using the application. All pages depend on the REST API for authentication, data reads, mutations, and spend analysis.

---

## 📄 Frontend Pages & API Integration

| Page | File Path | API Endpoints Used | Description |
|---|---|---|---|
| **Login / Signup** | `login/login.html` | `POST /api/auth/login`<br>`POST /api/auth/register` | Authenticates users, validates form inputs, and saves the issued JWT token. |
| **Dashboard** | `dashboard/dashboard.html` | `GET /api/subscriptions/analysis`<br>`GET /api/subscriptions` | Displays spend totals, active subscriptions, projected annual leak, and leak percentage. |
| **Subscriptions** | `subscription/subscription.html` | `GET /api/subscriptions`<br>`POST /api/subscriptions`<br>`DELETE /api/subscriptions/:id` | Lists all user subscriptions, adds new entries, and deletes existing records. |
| **Overlaps** | `overlaps/index.html` | `GET /api/subscriptions/analysis` | Displays identified duplicate categories, kept services, redundant items, and potential savings. |
| **Reports** | `reports/reports.html` | `GET /api/subscriptions/analysis` | Shows categorized spending table with monthly/annual totals and overlap status badges. |
| **Budget Planner** | `budget/budget.html` | `GET /api/subscriptions` | Computes monthly spend against the user's budget goal stored in `essara_budget_<userId>`. |
| **Renewal Calendar** | `calendar/calendar.html` | `GET /api/subscriptions` | Maps recurring renewal dates on an interactive monthly calendar. |

---

## 🧮 The Cost Normalization & Overlap Algorithm

The server-side analysis engine operates in two coordinated phases:

### 1. Billing-Cycle Normalization
Because subscriptions bill at different intervals, every cost is converted into a standard base monthly equivalent before comparison:
- **Weekly**: `cost * 4.345` (derived from 52.14 weeks per year / 12 months).
- **Monthly**: `cost * 1.0` (direct baseline).
- **Yearly**: `cost / 12` (annual cost amortized across 12 months).
- **Annual Equivalent**: `monthlyCost * 12`.

### 2. Overlap & Leak Detection
1. **Grouping**: Subscriptions are grouped by their `category`.
2. **Filtering**: The category `"Other"` is ignored (uncategorized services are not considered duplicates). Any category with fewer than two subscriptions is also ignored.
3. **Sorting & Selection**: In each multi-item category, subscriptions are converted to their monthly cost equivalent and sorted descending.
4. **Kept vs. Redundant**:
   - The subscription with the highest monthly equivalent is marked **`keep`** (the user has demonstrated willingness to pay most for this service).
   - All other subscriptions in the category are flagged as **`redundant`** (the cost leak).
5. **Leak Aggregation**:
   - `monthlyLeak` = sum of monthly equivalents for all redundant items.
   - `annualLeak` = `monthlyLeak * 12`.

### Worked Example: Category "Music"
Suppose a user has entered three music services:
- **Spotify**: $9.99 / Monthly &rarr; Monthly = **$9.99**
- **Apple Music**: $99.00 / Yearly &rarr; Monthly = $99.00 / 12 = **$8.25**
- **YouTube Music**: $4.00 / Weekly &rarr; Monthly = $4.00 &times; 4.345 = **$17.38**

**Analysis Result:**
- **Kept**: YouTube Music ($17.38/mo equivalent)
- **Redundant (Leak)**: Spotify ($9.99/mo) + Apple Music ($8.25/mo)
- **Monthly Leak**: $9.99 + $8.25 = **$18.24 / month**
- **Annual Leak**: $18.24 &times; 12 = **$218.88 / year**

---

## 📡 REST API Summary

All endpoints are prefixed with `/api`. For complete request/response schemas, sample payloads, and status codes, see [backend/README.md](backend/README.md).

| Method | Endpoint | Auth Required | Purpose |
|---|---|---|---|
| `GET` | `/` | No | Health check and API welcome message |
| `POST` | `/api/auth/register` | No | Register a new user account (hashes password with bcrypt) |
| `POST` | `/api/auth/login` | No | Authenticate user credentials and return JWT Bearer token |
| `GET` | `/api/auth/me` | Yes (Bearer JWT) | Retrieve the authenticated user's profile |
| `GET` | `/api/subscriptions` | Yes (Bearer JWT) | Retrieve all subscriptions for the authenticated user |
| `POST` | `/api/subscriptions` | Yes (Bearer JWT) | Create a new subscription record for the authenticated user |
| `GET` | `/api/subscriptions/analysis` | Yes (Bearer JWT) | Calculate spend summary, category breakdowns, and overlap leaks |
| `GET` | `/api/subscriptions/:id` | Yes (Bearer JWT) | Fetch a specific subscription by MongoDB ObjectId |
| `PUT` | `/api/subscriptions/:id` | Yes (Bearer JWT) | Update an existing subscription by ID |
| `DELETE` | `/api/subscriptions/:id` | Yes (Bearer JWT) | Delete a specific subscription by ID |

An automated Postman test suite covering positive, negative, and edge test cases is included at [backend/postman/Subscription-Leak-Detector.postman_collection.json](backend/postman/Subscription-Leak-Detector.postman_collection.json).

---

## 🎓 Course Syllabus Coverage

The following table maps academic web and backend engineering syllabus concepts to their exact implementation in this project:

| Syllabus Topic | Practical Application in Project | File / Directory Reference |
|---|---|---|
| **Express Routing & Body Parsing** | Modular routers mounted with `express.Router()`; JSON request payload handling via `express.json()` | `backend/routes/authRoutes.js`<br>`backend/routes/subscriptionRoutes.js`<br>`backend/server.js` |
| **Custom Middleware Architecture** | Route protection via Bearer token verification, hand-written CORS headers, and pre-controller request validators | `backend/middleware/auth.js`<br>`backend/middleware/cors.js`<br>`backend/middleware/validate.js` |
| **Centralized Error Handling** | Dedicated 4-argument Express error handler intercepting runtime exceptions, Mongoose cast errors, duplicate keys, and 404s | `backend/middleware/errorHandler.js`<br>`backend/server.js` |
| **Authentication & Cryptography** | Salted password hashing via `bcrypt` (10 salt rounds); stateless session management via `jsonwebtoken` (JWT) | `backend/controllers/authController.js`<br>`backend/models/User.js`<br>`backend/middleware/auth.js` |
| **Database Modeling & Validation** | Strict Mongoose schemas with required fields, enum cycle constraints, positive number validation, and User-Subscription relationships | `backend/models/User.js`<br>`backend/models/Subscription.js`<br>`backend/config/db.js` |
| **Client-Side API Integration** | Asynchronous HTTP requests using native `fetch`, `async/await`, dynamic DOM injection, and token headers | `js/api.js`<br>`js/script.js`<br>`budget/js/budget.js`<br>`calendar/js/calendar.js` |
| **State & Preference Persistence** | Browser `localStorage` management for JWT session tokens, active currency, theme mode, and per-user budget limits | `js/api.js`<br>`js/script.js`<br>`budget/js/budget.js` |
| **Configuration & Environments** | Environment variable management isolating secrets (`MONGO_URI`, `JWT_SECRET`, `PORT`) from source control | `backend/server.js`<br>`backend/config/db.js`<br>`backend/.env.example` |
| **API Testing & Verification** | Complete Postman collection test scripts validating HTTP status codes, response shapes, and error structures | `backend/postman/Subscription-Leak-Detector.postman_collection.json` |

---

## 👥 Team & Credits

- **Project Developer(s)**: `[Student Name / Team Members Placeholder]`
- **Course**: Backend Engineering (BEE) / College Capstone Project
- **Academic Year**: 2025–2026
