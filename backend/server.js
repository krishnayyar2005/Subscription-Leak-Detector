// Load environment variables FIRST before anything else
// This makes process.env.PORT, process.env.MONGO_URI etc. available everywhere
require("dotenv").config()

const express=require("express")
const connectDB=require("./config/db")

// Import our hand-written middlewares
const corsMiddleware=require("./middleware/cors")
const {errorHandler,notFoundMiddleware}=require("./middleware/errorHandler")

// Create the Express application
const app=express()

// --- GLOBAL MIDDLEWARE ---

// Parse incoming JSON request bodies
// Without this, req.body would be undefined for POST/PUT requests
app.use(express.json())

// Apply CORS so the browser-based frontend can talk to this API
app.use(corsMiddleware)

// --- ROUTES ---

// Health-check / welcome route
// GET http://localhost:8080/
app.get("/",(req,res)=>{
    res.json({message:"Welcome to Subscription Leak Detector API"})
})

// --- CATCH-ALL MIDDLEWARE (must come after all routes) ---

// If no route above matched, send a 404
app.use(notFoundMiddleware)

// Error handler must be LAST - Express knows it is an error handler
// because it has 4 parameters (err, req, res, next)
app.use(errorHandler)

// --- START SERVER ---

// Connect to MongoDB Atlas first, then start the HTTP server
// This order matters: we want the DB ready before accepting any requests
const PORT=process.env.PORT||8080
connectDB().then(()=>{
    app.listen(PORT,()=>{
        console.log(`Server is running in http://localhost:${PORT}/`)
    })
})
