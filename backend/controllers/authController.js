// controllers/authController.js
// Controllers contain the actual logic for each route.
// They receive the request, do the work, and send back a response.

const bcrypt=require("bcrypt")
const User=require("../models/User")

// -------------------------------------------------------
// registerUser - handles POST /api/auth/register
// Expected req.body: { "name": "Test User", "email": "test@example.com", "password": "Test@1234" }
// -------------------------------------------------------
const registerUser=async(req,res,next)=>{
    try{
        // Step 1: Pull the needed fields out of the request body
        // req.body is the parsed JSON the client sent us
        const {name,email,password}=req.body

        // Step 2: Check if someone with this email already exists
        // findOne returns the matching document or null
        // We do this before hashing to fail fast (hashing is slow on purpose)
        const existing_user=await User.findOne({email})
        if(existing_user){
            // 409 Conflict - the resource (email) already exists
            return res.status(409).json({message:"User Already Exists"})
        }

        // Step 3: Hash the password before storing it
        // NEVER store plain-text passwords in a database!
        // bcrypt.hash(password, saltRounds) does two things:
        //   a) Generates a random "salt" (random bytes added to the password before hashing)
        //      so two users with the same password get DIFFERENT hashes
        //   b) Runs the hashing algorithm 2^saltRounds times (here: 2^10 = 1024 rounds)
        //      making it computationally expensive to brute-force
        // saltRounds=10 is the industry standard - high enough to be secure,
        // low enough that it doesn't feel slow to the end user (~100ms)
        const saltRounds=10
        const hashed_password=await bcrypt.hash(password,saltRounds)

        // Step 4: Save the new user to the database
        // User.create() is shorthand for: new User({...}).save()
        // We store the HASH, not the original password
        const new_user=await User.create({
            name:name,
            email:email,
            password:hashed_password
        })

        // Step 5: Respond with 201 Created
        // IMPORTANT: never send back the password or hash - even in a response
        // Only return the fields the client actually needs
        res.status(201).json({
            message:"User Registered Successfully",
            user:{
                id:new_user._id,
                name:new_user.name,
                email:new_user.email
            }
        })
    }
    catch(error){
        // Pass any unexpected error to the error-handling middleware
        // (e.g. DB connection failure, Mongoose validation error)
        next(error)
    }
}

module.exports={registerUser}
