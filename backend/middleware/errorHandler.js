// Error-handling middleware and 404 (not found) middleware

// -------------------------------------------------------
// WHY does the error handler need 4 parameters?
// Express identifies an error-handling middleware ONLY by its
// function signature having exactly 4 params: (err, req, res, next).
// If you write only 3 params, Express treats it as a normal
// middleware and the errors will never reach it.
// -------------------------------------------------------

// This middleware catches any error passed via next(error) from controllers
const errorHandler=(err,req,res,next)=>{

    // Log the full error so we can debug it in the terminal
    console.error("ERROR:", err)

    // -------------------------------------------------------
    // MONGOOSE VALIDATION ERROR
    // Happens when a required field is missing or a validator fails.
    // err.errors is an object like: { name: ValidatorError, email: ValidatorError }
    // We join all the messages so the client gets a readable list.
    // Example response: { message: "Name is required, Email is required" }
    // -------------------------------------------------------
    if(err.name==="ValidationError"){
        const messages=Object.values(err.errors).map(e=>e.message).join(", ")
        return res.status(400).json({message:messages})
    }

    // -------------------------------------------------------
    // DUPLICATE KEY ERROR (MongoDB error code 11000)
    // MongoDB throws this when a unique-indexed field (like email) is already taken.
    // We check err.code instead of err.name because MongoDB sets a numeric code.
    // -------------------------------------------------------
    if(err.code===11000){
        return res.status(409).json({message:"Email already registered"})
    }

    // -------------------------------------------------------
    // CAST ERROR (invalid MongoDB ObjectId)
    // Happens when a route like GET /api/users/:id receives an id
    // that cannot be cast to a valid Mongoose ObjectId (e.g. "abc" instead of a 24-char hex)
    // -------------------------------------------------------
    if(err.name==="CastError"){
        return res.status(400).json({message:"Invalid ID"})
    }

    // Use the status code attached to the error if one exists,
    // otherwise fall back to 500 (Internal Server Error)
    const statusCode=err.statusCode||500

    // Use the error message if one exists, otherwise use a generic message
    const message=err.message||"Something went wrong"

    res.status(statusCode).json({message:message})
}

// This middleware fires when no route matched the incoming request
// It must be registered AFTER all routes so only truly unmatched requests reach it
const notFoundMiddleware=(req,res,next)=>{
    res.status(404).json({message:"Route Not Found"})
}

module.exports={errorHandler,notFoundMiddleware}
