// Hand-written CORS middleware - we do NOT install the cors npm package
// CORS (Cross-Origin Resource Sharing) lets the browser talk to our API
// from a different origin (e.g. frontend on port 5500, backend on 8080)

const corsMiddleware=(req,res,next)=>{

    // Allow any origin to call our API
    // In production you would replace "*" with your actual frontend URL
    res.setHeader("Access-Control-Allow-Origin","*")

    // Which request headers are allowed to be sent by the client
    res.setHeader("Access-Control-Allow-Headers","Content-Type, Authorization")

    // Which HTTP methods our API supports
    res.setHeader("Access-Control-Allow-Methods","GET,POST,PUT,DELETE,OPTIONS")

    // Browsers send a "preflight" OPTIONS request before the real request
    // to check if CORS is allowed. We reply with 204 No Content and stop here.
    if(req.method==="OPTIONS"){
        res.status(204).end()
        return
    }

    // For every other method, hand control to the next middleware
    next()
}

module.exports=corsMiddleware
