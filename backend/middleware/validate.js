// middleware/validate.js
// -------------------------------------------------------
// WHAT IS VALIDATION MIDDLEWARE?
// Validation middleware sits between the route and the controller.
// Its only job is to check that the incoming request body has the
// right shape and values BEFORE the controller runs.
//
// WHY do this before the controller?
// The controller should focus on business logic (save user, issue token...).
// If we mix "is the email valid?" checks inside the controller, the code
// becomes messy. Separating concerns keeps each file small and readable.
//
// HOW does next() work here?
//   - If validation PASSES, we call next() -> Express moves to the
//     next middleware/controller in the chain.
//   - If validation FAILS, we return a 400 response immediately and
//     do NOT call next(), so the controller never runs.
// -------------------------------------------------------

// -------------------------------------------------------
// validateRegister
// Runs before the registerUser controller on POST /api/auth/register
// Checks: name, email, password
// Collects ALL errors (not just the first one) so the client
// can fix everything in one go, not one error at a time.
// -------------------------------------------------------
const validateRegister=(req,res,next)=>{

    // req.body may be undefined if no JSON was sent at all,
    // so we fall back to an empty object to avoid crashes
    // e.g. const {name} = undefined  would throw a TypeError
    const {name,email,password}=req.body||{}

    // We collect every broken rule into this array
    // e.g. ["Name is required", "Enter a valid email"]
    const errors=[]

    // --- NAME CHECK ---
    // trim() removes leading/trailing spaces so "   " counts as empty
    if(!name || name.trim()===""){
        errors.push("Name is required")
    }

    // --- EMAIL CHECKS ---
    // First check: is the field present at all?
    if(!email || email.trim()===""){
        errors.push("Email is required")
    }
    // Second check: does it look like a valid email?
    // The regex requires: something @ something . something
    // e.g. "a@b.c" passes, "notanemail" fails
    else{
        // Simple email pattern: one or more chars, @, one or more chars, ., one or more chars
        const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if(!emailPattern.test(email)){
            errors.push("Enter a valid email")
        }
    }

    // --- PASSWORD CHECKS ---
    // All password-strength rules are applied HERE, not in the controller,
    // so the controller only ever sees a valid password worth hashing.
    if(!password || password.trim()===""){
        errors.push("Password must be at least 8 characters and include one uppercase letter and one special character")
    }
    else{
        // We check three sub-rules and report them as one combined message
        // to avoid overwhelming the user with multiple password messages.
        const long_enough=password.length>=8
        // [A-Z] matches any uppercase English letter
        const has_uppercase=/[A-Z]/.test(password)
        // Special character: anything that is NOT a letter, digit, or whitespace
        const has_special=/[^a-zA-Z0-9\s]/.test(password)

        if(!long_enough || !has_uppercase || !has_special){
            errors.push("Password must be at least 8 characters and include one uppercase letter and one special character")
        }
    }

    // If any errors were collected, stop here and tell the client
    // DO NOT call next() - the controller should not run with bad data
    if(errors.length>0){
        return res.status(400).json({message:"Validation failed",errors:errors})
    }

    // All checks passed - hand control to the next middleware or controller
    next()
}

// -------------------------------------------------------
// validateLogin
// Runs before the loginUser controller on POST /api/auth/login
// Only checks that email looks valid and password is present.
// We do NOT check password strength here - the user's stored
// password might be an older hash that pre-dates our strength rules.
// -------------------------------------------------------
const validateLogin=(req,res,next)=>{

    const {email,password}=req.body||{}

    const errors=[]

    // --- EMAIL CHECKS ---
    if(!email || email.trim()===""){
        errors.push("Email is required")
    }
    else{
        const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if(!emailPattern.test(email)){
            errors.push("Enter a valid email")
        }
    }

    // --- PASSWORD CHECK ---
    // On login we only need to know the field was provided -
    // bcrypt.compare() will handle correctness checking in the controller
    if(!password || password.trim()===""){
        errors.push("Password is required")
    }

    if(errors.length>0){
        return res.status(400).json({message:"Validation failed",errors:errors})
    }

    next()
}

module.exports={validateRegister,validateLogin}
