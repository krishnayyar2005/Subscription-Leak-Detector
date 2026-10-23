// routes/authRoutes.js
// Routes only map a URL + HTTP method to the right controller function.
// They do NOT contain any business logic - that lives in controllers/.

const express=require("express")
const {registerUser,loginUser}=require("../controllers/authController")

// Import validation middleware for both routes
const {validateRegister,validateLogin}=require("../middleware/validate")

// express.Router() creates a mini-application that handles a subset of routes
// We mount it in server.js under "/api/auth", so:
//   POST /api/auth/register  =>  validateRegister  =>  registerUser controller
const router=express.Router()

// POST /register  (full path: POST /api/auth/register)
// Middleware chain: validateRegister runs first; if it calls next(),
// registerUser runs; if validateRegister returns a 400, registerUser never runs.
router.post("/register",validateRegister,registerUser)

// POST /login  (full path: POST /api/auth/login)
// validateLogin checks email format + password presence before loginUser runs.
// We do NOT check password strength on login - just that the field exists.
router.post("/login",validateLogin,loginUser)

module.exports=router
