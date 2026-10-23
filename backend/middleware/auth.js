// middleware/auth.js
// -------------------------------------------------------
// WHAT IS A PROTECTED ROUTE?
// A protected route is one that only logged-in users can access.
// "Logged-in" here means the client must send a valid JWT token.
// If the token is missing, fake, or expired, we reject the request
// BEFORE the controller even runs - no database user data is leaked.
//
// HOW DOES IT WORK?
// 1. The client logs in via POST /api/auth/login and receives a token.
// 2. For every protected request the client adds a header:
//      Authorization: Bearer eyJhbGci...
// 3. This middleware reads that header, verifies the token, looks up
//    the user, and attaches them to req so the controller can use them.
// -------------------------------------------------------

const jwt=require("jsonwebtoken")
const User=require("../models/User")

// -------------------------------------------------------
// WHAT IS THE BEARER TOKEN FORMAT?
// HTTP has a standard pattern for sending credentials:
//   Authorization: <scheme> <credentials>
// "Bearer" is the scheme name (think of it as "here is my badge").
// The token that follows is the JWT the server issued on login.
// Example header value:  "Bearer eyJhbGciOiJIUzI1NiJ9.eyJpZCI6..."
// -------------------------------------------------------
const authMiddleware=async(req,res,next)=>{
    try{
        // Step 1: Read the Authorization header
        // req.headers.authorization looks like: "Bearer eyJhbGci..."
        // If the client forgot to send it, it will be undefined
        const auth_header=req.headers.authorization

        if(!auth_header || !auth_header.startsWith("Bearer ")){
            // 401 Unauthorized - no token at all, or wrong format
            return res.status(401).json({message:"Access denied. No token provided"})
        }

        // Step 2: Extract just the token part
        // "Bearer eyJhbGci..." -> split by space -> ["Bearer", "eyJhbGci..."]
        // index [1] gives us the raw token string
        const token=auth_header.split(" ")[1]

        // Step 3: Verify the token
        // -------------------------------------------------------
        // jwt.verify(token, secret) does TWO things at once:
        //   a) Checks the SIGNATURE - proves the token was issued by
        //      us (using our secret) and has not been tampered with.
        //   b) Checks the EXPIRY - if the "exp" claim is in the past,
        //      it throws a JsonWebTokenError / TokenExpiredError.
        // If either check fails, it throws and we catch it below.
        // If both pass, it returns the decoded payload: { id, iat, exp }
        // -------------------------------------------------------
        const decoded=jwt.verify(token,process.env.JWT_SECRET)

        // Step 4: Make sure the user still exists in the database
        // The token might be valid, but the account might have been deleted.
        // .select("-password") tells Mongoose: give me all fields EXCEPT password.
        // This means req.user will never accidentally contain the hash.
        const find_user=await User.findById(decoded.id).select("-password")

        if(!find_user){
            // Token was real but the user behind it no longer exists
            return res.status(401).json({message:"User no longer exists"})
        }

        // Step 5: Attach the user to the request object
        // -------------------------------------------------------
        // WHY attach req.user?
        // Every Express middleware and controller in this request's chain
        // can now read req.user without making another DB call.
        // e.g. in getMyProfile: req.user._id, req.user.name, req.user.email
        // This is a standard Express pattern for sharing data between
        // middleware and controllers on the same request.
        // -------------------------------------------------------
        req.user=find_user

        // Step 6: Hand control to the next middleware or controller
        next()
    }
    catch(error){
        // jwt.verify throws when the token is invalid or expired
        // We catch that here and return a clean 401 (not a 500)
        return res.status(401).json({message:"Invalid or expired token"})
    }
}

module.exports={authMiddleware}
