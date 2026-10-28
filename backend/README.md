# Subscription Leak Detector - Backend API

The Subscription Leak Detector backend is a RESTful API that helps people find and cut hidden recurring costs in their subscriptions. A cost leak occurs when someone unknowingly pays for several overlapping services in one category, for example Spotify and Apple Music under "Music", or Netflix and Disney+ under "Video". Instead of making users convert billing cycles by hand, the API converts every subscription into standard monthly and annual figures, flags the redundant services, and shows exactly how much money is being lost each month and each year.

## Tech Stack

- **Node.js:** Asynchronous JavaScript runtime.
- **Express 5:** Lightweight, flexible web framework used for routing and middleware.
- **MongoDB Atlas:** Fully managed cloud NoSQL database that stores the documents.
- **Mongoose 9:** ODM library that provides strict schemas, models, and type casting.
- **JSON Web Token (jsonwebtoken):** Stateless token-based authentication and route protection.
- **bcrypt:** Widely trusted adaptive hashing algorithm (10 salt rounds) used to secure user passwords.

## Folder Structure

```
backend/
├── config/
│   └── db.js                 # Connects to MongoDB Atlas through Mongoose, using custom DNS servers
├── controllers/
│   ├── authController.js     # Logic for user registration, login, and fetching the profile
│   └── subscriptionController.js # CRUD handlers and the spend analysis engine for subscriptions
├── middleware/
│   ├── auth.js               # Verifies the JWT, protects private routes, and attaches req.user
│   ├── cors.js               # Hand-written CORS headers that allow browser requests
│   ├── errorHandler.js       # Central error handler plus the 404 handler for unmatched routes
│   └── validate.js           # Validates registration and login requests before they reach controllers
├── models/
│   ├── Subscription.js       # Mongoose schema and model for subscription records
│   └── User.js               # Mongoose schema and model for user accounts
├── postman/
│   └── Subscription-Leak-Detector.postman_collection.json # Automated Postman test suite (v2.1 schema)
├── routes/
│   ├── authRoutes.js         # Route definitions for /api/auth endpoints
│   └── subscriptionRoutes.js # Route definitions for /api/subscriptions endpoints
├── utils/
│   ├── normalizeCost.js      # Pure functions that convert billing cycles to monthly/annual costs
│   └── overlapDetector.js    # Groups categories, chooses keep vs redundant, and calculates leaks
├── .env.example              # Template listing the required environment variable keys
├── .gitignore                # Keeps node_modules and sensitive .env files out of Git
├── package.json              # Project metadata, dependencies, and npm scripts
├── server.js                 # Entry point that wires together middleware, database, and routes
└── STYLE_GUIDE.md            # Coding standards and formatting rules for all backend code
```

## Setup & Installation

1. Open your terminal and move into the backend directory:

   ```
   cd backend
   ```

2. Install the project dependencies:

   ```
   npm install
   ```

3. Create your `.env` file from the example template:

   ```
   cp .env.example .env
   ```

4. Fill in the environment variables inside `.env`:

   - `PORT`: Port the HTTP server listens on (e.g. 8080).
   - `MONGO_URI`: MongoDB Atlas connection string (e.g. `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority`).
   - `JWT_SECRET`: A strong, private string used to sign and verify JSON Web Tokens.

   (Never commit your real `.env` file or credentials to Git.)

5. Start the development server:

   ```
   npm start
   ```

   The terminal should print:

   ```
   MongoDB Connected Successfully
   Server is running in http://localhost:8080/
   ```

## API Endpoints Reference

| Method | Endpoint | Auth Required | Purpose | Success Status |
|--------|----------|---------------|---------|----------------|
| GET | `/` | No | Health check and welcome message | 200 OK |
| POST | `/api/auth/register` | No | Create a new user account with a hashed password | 201 Created |
| POST | `/api/auth/login` | No | Verify credentials and issue a 7-day JWT | 200 OK |
| GET | `/api/auth/me` | Yes | Fetch the profile of the logged-in user | 200 OK |
| GET | `/api/subscriptions` | Yes | List all subscriptions owned by the logged-in user | 200 OK |
| POST | `/api/subscriptions` | Yes | Add a new subscription for the logged-in user | 201 Created |
| GET | `/api/subscriptions/analysis` | Yes | Spend breakdown, category grouping, and overlap detection | 200 OK |
| GET | `/api/subscriptions/:id` | Yes | Fetch one subscription by ID (user-scoped) | 200 OK |
| PUT | `/api/subscriptions/:id` | Yes | Update a subscription by ID (user-scoped) | 200 OK |
| DELETE | `/api/subscriptions/:id` | Yes | Remove a subscription by ID (user-scoped) | 200 OK |

## Request & Response Examples

### 1. Register User (`POST /api/auth/register`)

Request Body:

```json
{
  "name": "Demo User",
  "email": "demo@example.com",
  "password": "Demo@1234"
}
```

Response (201 Created):

```json
{
  "message": "User Registered Successfully",
  "user": {
    "id": "6adc4ba3aec7730efdcab4f1",
    "name": "Demo User",
    "email": "demo@example.com"
  }
}
```

### 2. Login User (`POST /api/auth/login`)

Request Body:

```json
{
  "email": "demo@example.com",
  "password": "Demo@1234"
}
```

Response (200 OK):

```json
{
  "message": "Login Successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "6adc4ba3aec7730efdcab4f1",
    "name": "Demo User",
    "email": "demo@example.com"
  }
}
```

### 3. Create Subscription (`POST /api/subscriptions`)

Headers:

```
Authorization: Bearer <token>
Content-Type: application/json
```

Request Body:

```json
{
  "name": "Spotify",
  "category": "Music",
  "cost": 9.99,
  "cycle": "Monthly"
}
```

Response (201 Created):

```json
{
  "message": "Subscription Added Successfully",
  "subscription": {
    "_id": "6adc4ba3aec7730efdcab4fd",
    "name": "Spotify",
    "category": "Music",
    "cost": 9.99,
    "cycle": "Monthly",
    "user": "6adc4ba3aec7730efdcab4f1",
    "createdAt": "2026-10-24T06:00:00.000Z",
    "updatedAt": "2026-10-24T06:00:00.000Z"
  }
}
```

### 4. Spend & Overlap Analysis (`GET /api/subscriptions/analysis`)

Headers:

```
Authorization: Bearer <token>
```

Response (200 OK):

```json
{
  "summary": {
    "activeCount": 9,
    "monthlyTotal": 120.68,
    "annualTotal": 1448.2
  },
  "byCategory": [
    {
      "category": "Music",
      "count": 3,
      "monthly": 35.62,
      "annual": 427.44,
      "percentage": 29.52
    },
    {
      "category": "Video",
      "count": 3,
      "monthly": 35.06,
      "annual": 420.76,
      "percentage": 29.05
    },
    {
      "category": "Fitness",
      "count": 1,
      "monthly": 30,
      "annual": 360,
      "percentage": 24.86
    },
    {
      "category": "Other",
      "count": 2,
      "monthly": 20,
      "annual": 240,
      "percentage": 16.57
    }
  ],
  "overlaps": {
    "overlapCount": 2,
    "totalMonthlyLeak": 37.81,
    "totalAnnualLeak": 453.76,
    "overlaps": [
      {
        "category": "Video",
        "count": 3,
        "keep": {
          "id": "6adc4ba4aec7730efdcab500",
          "name": "Netflix",
          "cycle": "Monthly",
          "cost": 15.49,
          "monthlyCost": 15.49
        },
        "redundant": [
          {
            "id": "6adc4ba4aec7730efdcab501",
            "name": "Prime Video",
            "cycle": "Yearly",
            "cost": 139,
            "monthlyCost": 11.58,
            "annualCost": 139
          },
          {
            "id": "6adc4ba4aec7730efdcab502",
            "name": "Disney Plus",
            "cycle": "Monthly",
            "cost": 7.99,
            "monthlyCost": 7.99,
            "annualCost": 95.88
          }
        ],
        "monthlyLeak": 19.57,
        "annualLeak": 234.88
      },
      {
        "category": "Music",
        "count": 3,
        "keep": {
          "id": "6adc4ba4aec7730efdcab4ff",
          "name": "YouTube Music",
          "cycle": "Weekly",
          "cost": 4,
          "monthlyCost": 17.38
        },
        "redundant": [
          {
            "id": "6adc4ba3aec7730efdcab4fd",
            "name": "Spotify",
            "cycle": "Monthly",
            "cost": 9.99,
            "monthlyCost": 9.99,
            "annualCost": 119.88
          },
          {
            "id": "6adc4ba3aec7730efdcab4fe",
            "name": "Apple Music",
            "cycle": "Yearly",
            "cost": 99,
            "monthlyCost": 8.25,
            "annualCost": 99
          }
        ],
        "monthlyLeak": 18.24,
        "annualLeak": 218.88
      }
    ]
  },
  "leakPercentage": 31.33
}
```

## How the Algorithm Works

### 1. Billing-Cycle Normalization

Subscriptions are billed weekly, monthly, or yearly. Before any costs are compared or added up, each one is converted into a common monthly and annual equivalent:

- **Weekly:** `cost * 4.345` (52.14 weeks per year ÷ 12 months)
- **Monthly:** `cost`
- **Yearly:** `cost / 12`
- **Annual Cost:** `monthly * 12`

**Note on Precision:** Every intermediate sum and cycle conversion keeps full floating-point precision. Rounding to 2 decimal places with `round2` happens only at the final step, when the HTTP response is built, so rounding errors never pile up.

### 2. Overlap & Leak Detection

- **Grouping:** Subscriptions are grouped by category (trimmed and case-insensitive).
- **"Other" is excluded:** The "Other" category still appears in `byCategory` so total spend is tracked, but it is intentionally skipped during overlap detection, since unrelated miscellaneous services (such as cloud backups and meal prep) are not real functional duplicates.
- **Singletons are skipped:** A category with just 1 active subscription has nothing to duplicate, so it is ignored.
- **Keep vs. Redundant:** In an overlapping category, items are sorted from highest to lowest normalized monthly cost. The most expensive one is marked **Keep**, on the assumption that it is the service the user values or uses most.
- **Leak Calculation:** Every other subscription in the category is marked **Redundant**. Their combined monthly cost is the `monthlyLeak`, and `annualLeak = monthlyLeak * 12`.

### Worked Example (Music Category)

Say a user has:

- Spotify: $9.99 / month = $9.99 / month
- Apple Music: $99.00 / year = $99 ÷ 12 = $8.25 / month
- YouTube Music: $4.00 / week = $4 × 4.345 = $17.38 / month

**Keep:** YouTube Music ($17.38/mo), the most expensive service.
**Redundant:** Spotify ($9.99/mo) and Apple Music ($8.25/mo).

**Monthly Leak:** 9.99 + 8.25 = $18.24 / month
**Annual Leak:** 18.24 * 12 = $218.88 / year

## Security Architecture

- **Password Hashing (bcrypt):** Passwords are never saved in plain text. Each one is salted and hashed with 10 bcrypt rounds before it is written to MongoDB. The responses from `registerUser`, `loginUser`, and `getMyProfile` remove the password field entirely.
- **JWT Authentication:** Sessions are stateless. Tokens are signed with `process.env.JWT_SECRET` and expire after 7 days. Protected routes need this header:

  ```
  Authorization: Bearer <token>
  ```

- **Strict User-Scoping:** Every subscription query (`find`, `findById`, `findOneAndUpdate`, `findOneAndDelete`) filters by `{ user: req.user._id }`. A user can never read, change, or delete another account's subscriptions, which prevents Insecure Direct Object Reference (IDOR) attacks.
- **Input Whitelisting:** Controllers destructure only the expected body fields and ignore any `user` value sent by the client, so ownership can't be forged.

## Error Handling & Status Codes

All errors are routed through a central error-handling middleware (`errorHandler.js`), which returns a consistent JSON error format:

```json
{
  "message": "Specific error description here"
}
```

### Common HTTP Status Codes

- **200 OK:** The request succeeded (GET, PUT, DELETE).
- **201 Created:** A resource was created (POST).
- **400 Bad Request:** Failed input validation, missing required fields, an invalid enum value, or a malformed ID (CastError).
- **401 Unauthorized:** The JWT is missing, expired, or invalid, or the login credentials are wrong.
- **404 Not Found:** The subscription ID doesn't exist, or the API route doesn't match anything.
- **409 Conflict:** An attempt to register with an email address that is already in the database.
- **500 Internal Server Error:** An unhandled server exception or missing server configuration.

## Testing with Postman

A ready-made automated test suite for all endpoints is included at `backend/postman/Subscription-Leak-Detector.postman_collection.json`.

### How to Run in Postman:

1. Open the Postman application.
2. Click **Import** in the top-left corner and choose `backend/postman/Subscription-Leak-Detector.postman_collection.json`.
3. Click the **Subscription Leak Detector** collection in the left sidebar.
4. Click **Run collection** to open the Collection Runner.
5. Make sure all folders are selected, in this order:
   1. Health
   2. Auth
   3. Subscriptions (CRUD)
   4. Analysis
   5. Cleanup
6. Click **Run Subscription Leak Detector**.

All 29 requests run one after another. Pre-request scripts automatically create an isolated demo user and pass the JWT token and subscription IDs along between tests.