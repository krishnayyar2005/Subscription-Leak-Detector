// routes/authRoutes.js
// Routes only map a URL + HTTP method to the right controller function.
// They do NOT contain any business logic - that lives in controllers/.

const express=require("express")
const {registerUser}=require("../controllers/authController")

// express.Router() creates a mini-application that handles a subset of routes
// We mount it in server.js under "/api/auth", so:
//   POST /api/auth/register  =>  registerUser controller
const router=express.Router()

// POST /register  (full path: POST /api/auth/register)
router.post("/register",registerUser)

module.exports=router
