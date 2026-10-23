// controllers/authController.js
// Controllers contain the actual logic for each route.
// They receive the request, do the work, and send back a response.

const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")
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

// -------------------------------------------------------
// loginUser - handles POST /api/auth/login
// Expected req.body: { "email": "user@example.com", "password": "Secret@123" }
// -------------------------------------------------------
const loginUser=async(req,res,next)=>{
    try{
        // Step 1: Normalise the email the same way the schema does
        // The schema has lowercase:true, so "USER@EXAMPLE.COM" is stored as
        // "user@example.com". We must normalise here too so the lookup matches.
        const {email,password}=req.body
        const normalised_email=email.toLowerCase().trim()

        // Step 2: Look for the user in the database
        // findOne returns the document (with the hashed password) or null
        const find_user=await User.findOne({email:normalised_email})
        if(!find_user){
            // 401 Unauthorized - we deliberately use the SAME message whether
            // the email doesn't exist OR the password is wrong.
            // Reason: telling an attacker "email not found" lets them enumerate
            // which emails are registered. A vague message gives them no info.
            return res.status(401).json({message:"Invalid email or password"})
        }

        // Step 3: Compare the plain-text password the user sent
        // against the bcrypt hash stored in the database.
        // bcrypt.compare() handles the salt internally - we never touch it.
        const password_matches=await bcrypt.compare(password,find_user.password)
        if(!password_matches){
            // Same vague message as above - don't reveal which field is wrong
            return res.status(401).json({message:"Invalid email or password"})
        }

        // Step 4: Check that JWT_SECRET is configured before trying to sign
        // If it is missing the app should crash loudly (500) rather than
        // silently issue unsigned tokens or throw a cryptic error
        if(!process.env.JWT_SECRET){
            const config_error=new Error("JWT_SECRET is not set - cannot issue token")
            config_error.statusCode=500
            return next(config_error)
        }

        // Step 5: Create a JSON Web Token (JWT)
        // -------------------------------------------------------
        // A JWT is a compact, URL-safe string that has three parts:
        //   Header  . Payload . Signature
        // - PAYLOAD: the data we want to carry. We put the user's id so that
        //   protected routes can know WHO made the request without another DB call.
        //   { id: "6adae656..." }
        // - SECRET: process.env.JWT_SECRET is a private string known only to the
        //   server. It is used to sign the token so that nobody can tamper with
        //   the payload (changing id to an admin id, for example) without
        //   invalidating the signature.
        // - expiresIn: "7d" means the token becomes invalid after 7 days.
        //   The "exp" (expiration) claim is embedded in the payload automatically.
        // -------------------------------------------------------
        const token=jwt.sign(
            {id:find_user._id},          // payload - who the token represents
            process.env.JWT_SECRET,       // secret - only the server knows this
            {expiresIn:"7d"}             // token expires in 7 days
        )

        // Step 6: Send back the token and safe user info
        // IMPORTANT: never include the password hash in the response
        res.status(200).json({
            message:"Login Successful",
            token:token,
            user:{
                id:find_user._id,
                name:find_user.name,
                email:find_user.email
            }
        })
    }
    catch(error){
        next(error)
    }
}

module.exports={registerUser,loginUser}
