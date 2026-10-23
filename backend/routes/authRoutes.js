// routes/authRoutes.js
// Routes only map a URL + HTTP method to the right controller function.
// They do NOT contain any business logic - that lives in controllers/.

const express=require("express")
const {registerUser}=require("../controllers/authController")

// Import only the middleware we need on this router right now.
// validateLogin will be wired up when the login route is added.
const {validateRegister}=require("../middleware/validate")

// express.Router() creates a mini-application that handles a subset of routes
// We mount it in server.js under "/api/auth", so:
//   POST /api/auth/register  =>  validateRegister  =>  registerUser controller
const router=express.Router()

// POST /register  (full path: POST /api/auth/register)
// Middleware chain: validateRegister runs first; if it calls next(),
// registerUser runs; if validateRegister returns a 400, registerUser never runs.
router.post("/register",validateRegister,registerUser)

module.exports=router
