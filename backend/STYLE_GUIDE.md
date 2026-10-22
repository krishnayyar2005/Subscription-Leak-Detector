# Subscription Leak Detector - Backend Style Guide

Every future prompt will follow these rules. Read this file before writing any backend code.

---

## Folder Structure (professional, separated by responsibility)

| Folder | Purpose |
|---|---|
| `config/` | Database connection (Mongoose connect logic) |
| `models/` | Mongoose schemas and models |
| `controllers/` | The logic for each route (the handler functions) |
| `routes/` | Only maps URL + method to middleware + controller, using express.Router() |
| `middleware/` | cors, auth (JWT), validation, error handler |
| `utils/` | Pure helper functions (cost normalization, overlap detection) |
| `server.js` | Only wires everything together |

---

## Code Style (beginner-friendly, teacher''s style)

### Module System
- CommonJS only - no ES modules, no import/export
```js
const express=require("express")
module.exports={myFunction}
```

### Formatting Rules
- No semicolons at the end of statements
- No spaces around = in variable declarations: const name="John"
- No space after commas in params: (req,res)=>{}, (err,req,res,next)=>{}
- 4-space indent throughout
- Double quotes for all strings
- else goes on a new line after the closing brace, never on the same line

```js
if(condition){
    // do something
}
else{
    // do something else
}
```

### Functions & Async
- Arrow-function callbacks everywhere: const doThing=(req,res)=>{}
- Async handlers: const handler=async(req,res)=>{} with await for all DB calls
- Wrap all database work in try/catch
- Pass errors to the error-handling middleware: next(error) - never res.send in the catch

```js
const doSomething=async(req,res,next)=>{
    try{
        const result=await Model.find()
        res.json(result)
    }
    catch(error){
        next(error)
    }
}
```

### Comments
- Many short conversational comments - explain what each block does AND why
- Write comments like a teacher talking to a student, not like a documentation tool
- Include small example data in comments where it helps understanding

```js
// req.body looks like: {"email":"user@test.com","password":"abc123"}
const {email,password}=req.body
```

### Variable Names
- Descriptive names; snake_case is fine
- Prefer full words: find_user, check_user, all_subscriptions
- Destructure from req: const {email,password}=req.body, const {id}=req.params

### Logic
- Simple operations only: find, some, filter, map, forEach, reduce
- No classes, no design patterns, no clever one-liners
- Middleware as named arrow functions:

```js
const validationMiddleware=(req,res,next)=>{
    // check something
    next()
}
```

### Middleware
- Auth middleware lives in middleware/auth.js
- Validation middleware lives in middleware/validate.js (or per-route file)
- The CORS middleware is hand-written (no cors package)
- The error handler always has 4 parameters (err,req,res,next) - Express identifies it by the 4-param signature

### Server
- Port 8080 (process.env.PORT || 8080)
- Startup message exactly:
  Server is running in http://localhost:8080/
- Responses always JSON with proper HTTP status codes:
  - 200 - OK (default for res.json())
  - 201 - Created
  - 400 - Bad Request (validation failure)
  - 401 - Unauthorized
  - 404 - Not Found
  - 500 - Internal Server Error

---

## Reference Code Sample

```js
const Subscription=require("../models/Subscription")

// Get single subscription
const getSubscriptionById=async(req,res,next)=>{
    try{
        // params contains key value pair object => {"id":"abc123"}
        const subId=req.params.id
        const find_sub=await Subscription.findById(subId)
        if(find_sub){
            res.json(find_sub)
        }
        else{
            res.status(404).json({message:"Subscription Does Not Exists"})
        }
    }
    catch(error){
        next(error) // sends error to error handling middleware
    }
}
module.exports={getSubscriptionById}
```

---

## Quick Checklist Before Committing

- [ ] CommonJS (require / module.exports) - no import
- [ ] No semicolons
- [ ] No spaces around = in declarations
- [ ] No space after comma in params
- [ ] 4-space indent
- [ ] Double quotes
- [ ] else on new line
- [ ] async/await + try/catch + next(error) for all DB calls
- [ ] Conversational comments on every logical block
- [ ] Descriptive variable names
- [ ] No classes, no design patterns
