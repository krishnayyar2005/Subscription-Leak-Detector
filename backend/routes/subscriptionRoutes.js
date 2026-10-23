// routes/subscriptionRoutes.js
// Routes map incoming HTTP requests (method + URL path) to their respective controller functions.
// All subscription endpoints are protected by authMiddleware.

const express=require("express")
const {authMiddleware}=require("../middleware/auth")
const {
    createSubscription,
    getSubscriptions,
    getSubscriptionById,
    updateSubscription,
    deleteSubscription
}=require("../controllers/subscriptionController")

const router=express.Router()

// -------------------------------------------------------
// WHY router.use(authMiddleware)?
// router.use() applies a middleware to every single route defined on this router.
// By placing authMiddleware at the top of the router, all subscription endpoints
// (POST, GET, PUT, DELETE) are automatically guarded.
// The client MUST send a valid JWT Bearer token on every request, or authMiddleware
// returns 401 Unauthorized before any controller runs.
// This eliminates the risk of forgetting to protect an individual route.
// -------------------------------------------------------
router.use(authMiddleware)

// POST /api/subscriptions -> Create a new subscription for the logged-in user
router.post("/",createSubscription)

// GET /api/subscriptions -> Get all subscriptions belonging to the logged-in user
router.get("/",getSubscriptions)

// the /analysis route will be added ABOVE this line later, because /:id would otherwise treat the word analysis as an id
router.get("/:id",getSubscriptionById)

// PUT /api/subscriptions/:id -> Update an existing subscription by ID
router.put("/:id",updateSubscription)

// DELETE /api/subscriptions/:id -> Delete a subscription by ID
router.delete("/:id",deleteSubscription)

module.exports=router
