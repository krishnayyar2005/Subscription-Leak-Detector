# Subscription Leak Detector - Backend API

The Subscription Leak Detector Backend is a RESTful API built to help individuals uncover and eliminate hidden recurring expenses in their personal subscriptions. A **cost leak** happens when a user unknowingly pays for multiple overlapping subscriptions in the same category (such as paying simultaneously for Spotify and Apple Music in "Music", or Netflix and Disney+ in "Video"). Rather than expecting users to calculate complex cycle conversions in their head, this API normalizes all subscriptions into unified monthly and annual equivalents, identifies redundant services, and highlights exactly how much money is leaking each month and year.

---

## Tech Stack

- **Node.js**: Asynchronous JavaScript runtime environment.
- **Express 5**: Fast, unopinionated web application framework for routing and middleware.
- **MongoDB Atlas**: Fully managed cloud NoSQL database for document storage.
- **Mongoose 9**: Object Data Modeling (ODM) library providing strict schema validation, models, and type casting.
- **JSON Web Token (jsonwebtoken)**: Stateless token-based user authentication and route protection.
- **bcrypt**: Industry-standard adaptive cryptographic hashing algorithm (salt rounds: 10) for securing user passwords.

---

## Folder Structure

```text
backend/
├── config/
│   └── db.js                 # Establishes connection to MongoDB Atlas using Mongoose and custom DNS servers
├── controllers/
│   ├── authController.js     # Business logic for user registration, login, and profile fetching
│   └── subscriptionController.js # CRUD handlers and spend analysis engine for subscriptions
├── middleware/
│   ├── auth.js               # JWT verification middleware protecting private routes and attaching req.user
│   ├── cors.js               # Hand-written CORS headers enabling browser communication
│   ├── errorHandler.js       # Centralized error handler and 404 unmatched route handler
│   └── validate.js           # Pre-controller request validation for user registration and login
├── models/
│   ├── Subscription.js       # Mongoose schema and model definition for subscription records
│   └── User.js               # Mongoose schema and model definition for user accounts
├── postman/
│   └── Subscription-Leak-Detector.postman_collection.json # Automated Postman test suite (v2.1 schema)
├── routes/
│   ├── authRoutes.js         # Routes mapping for /api/auth endpoints
│   └── subscriptionRoutes.js # Routes mapping for /api/subscriptions endpoints
├── utils/
│   ├── normalizeCost.js      # Pure mathematical functions to normalize billing cycles to monthly/annual costs
│   └── overlapDetector.js    # Logic grouping categories, picking keep vs redundant, and computing leaks
├── .env.example              # Template documenting required environment variable keys
├── .gitignore                # Prevents committing node_modules and sensitive .env files
├── package.json              # Project metadata, dependencies, and npm run scripts
├── server.js                 # Application entry point wiring middleware, database, and routes
└── STYLE_GUIDE.md            # Coding standards and formatting rules for all backend code
```

---

## Setup & Installation

1. Open your terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install project dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` configuration file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Configure the environment variables inside `.env`:
   - `PORT`: The HTTP port for the server to listen on (e.g. `8080`).
   - `MONGO_URI`: The MongoDB Atlas connection string (e.g. `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority`).
   - `JWT_SECRET`: A secure, secret string used to sign and verify JSON Web Tokens.

   *(Never commit your real `.env` file or credentials to Git).*

5. Start the development server:
   ```bash
   npm start
   ```
   The terminal will output:
   ```text
   MongoDB Connected Successfully
   Server is running in http://localhost:8080/
   ```

---

## API Endpoints Reference

| Method | Endpoint | Auth Required | Purpose | Success Status |
|---|---|:---:|---|:---:|
| `GET` | `/` | No | Server health check and welcome message | `200 OK` |
| `POST` | `/api/auth/register` | No | Register a new user account with hashed password | `201 Created` |
| `POST` | `/api/auth/login` | No | Authenticate user credentials and issue a 7-day JWT | `200 OK` |
| `GET` | `/api/auth/me` | Yes | Retrieve current logged-in user's profile | `200 OK` |
| `GET` | `/api/subscriptions` | Yes | Get all subscriptions belonging to logged-in user | `200 OK` |
| `POST` | `/api/subscriptions` | Yes | Create a new subscription for logged-in user | `201 Created` |
| `GET` | `/api/subscriptions/analysis` | Yes | Spend breakdown, category grouping, and overlap detection | `200 OK` |
| `GET` | `/api/subscriptions/:id` | Yes | Get single subscription by ID (user-scoped) | `200 OK` |
| `PUT` | `/api/subscriptions/:id` | Yes | Update subscription by ID (user-scoped) | `200 OK` |
| `DELETE`| `/api/subscriptions/:id` | Yes | Delete subscription by ID (user-scoped) | `200 OK` |

---

## Request & Response Examples

### 1. Register User (`POST /api/auth/register`)
**Request Body:**
```json
{
  "name": "Demo User",
  "email": "demo@example.com",
  "password": "Demo@1234"
}
```
**Response (`201 Created`):**
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
**Request Body:**
```json
{
  "email": "demo@example.com",
  "password": "Demo@1234"
}
```
**Response (`200 OK`):**
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
**Headers:**
```text
Authorization: Bearer <token>
Content-Type: application/json
```
**Request Body:**
```json
{
  "name": "Spotify",
  "category": "Music",
  "cost": 9.99,
  "cycle": "Monthly"
}
```
**Response (`201 Created`):**
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
**Headers:**
```text
Authorization: Bearer <token>
```
**Response (`200 OK`):**
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

---

## How the Algorithm Works

### 1. Billing-Cycle Normalization
Subscriptions bill on different intervals: weekly, monthly, and yearly. Before comparing or summing costs, each subscription is mathematically converted into unified monthly and annual equivalents:
- **Weekly**: `cost * 4.345` (based on 52.14 weeks per year ÷ 12 months)
- **Monthly**: `cost`
- **Yearly**: `cost / 12`
- **Annual Cost**: `monthly * 12`

> **Note on Precision**: All intermediate sums and cycle calculations maintain full floating-point precision. Values are rounded to 2 decimal places using `round2` **only** at the very end when constructing the final HTTP response, preventing compounding rounding errors.

### 2. Overlap & Leak Detection
- **Grouping**: Subscriptions are grouped by category (case-insensitive and trimmed).
- **Exclusion of "Other"**: The `"Other"` category is preserved in `byCategory` for total spend tracking, but is deliberately skipped during overlap detection because unrelated miscellaneous services (e.g. cloud backups and meal prep) are not true functional duplicates.
- **Singletons Ignored**: Categories with only 1 active subscription have no duplicates and are skipped.
- **Keep vs. Redundant**: For overlapping categories, items are sorted descending by normalized monthly cost. The priciest item is marked as **Keep** (assuming the user values or uses that primary service the most).
- **Leak Calculation**: All other subscriptions in that category are marked as **Redundant**. The sum of their monthly costs is the `monthlyLeak`, and `annualLeak = monthlyLeak * 12`.

### Worked Example (Music Category)
Suppose a user has:
1. **Spotify**: $9.99 / month = **$9.99 / month**
2. **Apple Music**: $99.00 / year = $99 ÷ 12 = **$8.25 / month**
3. **YouTube Music**: $4.00 / week = $4 × 4.345 = **$17.38 / month**

- **Keep**: YouTube Music ($17.38/mo) is the priciest service.
- **Redundant Leaks**: Spotify ($9.99/mo) + Apple Music ($8.25/mo).
- **Monthly Leak**: `9.99 + 8.25 = $18.24 / month`
- **Annual Leak**: `18.24 * 12 = $218.88 / year`

---

## Security Architecture

1. **Password Hashing (bcrypt)**: Plain-text passwords are never stored. Passwords are salted and hashed with 10 rounds of bcrypt before being written to MongoDB. Responses from `registerUser`, `loginUser`, and `getMyProfile` strip the password field completely.
2. **JWT Authentication**: User sessions are stateless. Tokens are signed with `process.env.JWT_SECRET` and expire in 7 days. Protected routes require the header:
   ```text
   Authorization: Bearer <token>
   ```
3. **Strict User-Scoping**: Every single database query for subscriptions (`find`, `findById`, `findOneAndUpdate`, `findOneAndDelete`) matches `{ user: req.user._id }`. Users can never read, modify, or delete any subscription belonging to another account (preventing Insecure Direct Object Reference / IDOR vulnerabilities).
4. **Input Whitelisting**: Body destructurings in controllers ignore any client-supplied `user` fields, ensuring ownership cannot be forged.

---

## Error Handling & Status Codes

All errors pass through a centralized error-handling middleware (`errorHandler.js`) that returns consistent JSON error envelopes:
```json
{
  "message": "Specific error description here"
}
```

### Common HTTP Status Codes
- `200 OK`: Request succeeded (GET, PUT, DELETE).
- `201 Created`: Resource successfully created (POST).
- `400 Bad Request`: Input validation failure, missing required fields, schema enum mismatch, or invalid ID format (CastError).
- `401 Unauthorized`: Missing, expired, or invalid JWT token, or incorrect login credentials.
- `404 Not Found`: Target subscription ID does not exist or unmatched API route.
- `409 Conflict`: Attempting to register an email address that already exists in the database.
- `500 Internal Server Error`: Unhandled server exception or missing server configuration.

---

## Testing with Postman

An automated test suite covering all endpoints is provided in `backend/postman/Subscription-Leak-Detector.postman_collection.json`.

### How to Run in Postman:
1. Open the Postman application.
2. Click **Import** in the top-left corner and select `backend/postman/Subscription-Leak-Detector.postman_collection.json`.
3. In the left sidebar, click the **Subscription Leak Detector** collection.
4. Click **Run collection** to open the Collection Runner.
5. Ensure all folders are selected in order:
   - `1. Health`
   - `2. Auth`
   - `3. Subscriptions (CRUD)`
   - `4. Analysis`
   - `5. Cleanup`
6. Click **Run Subscription Leak Detector**.
7. All 29 requests will execute sequentially. Pre-request scripts will dynamically create an isolated demo user and chain JWT tokens and subscription IDs across tests.
