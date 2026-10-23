// controllers/subscriptionController.js
// Controllers handle the business logic for subscription operations.
// Every controller here is protected and user-scoped, meaning operations
// only affect the subscriptions of the currently logged-in user.

const Subscription=require("../models/Subscription")

// -------------------------------------------------------
// createSubscription - handles POST /api/subscriptions
// Adds a new subscription for the currently logged-in user.
// Expected req.body: { "name": "Spotify", "category": "Music", "cost": 9.99, "cycle": "Monthly", ... }
// -------------------------------------------------------
const createSubscription=async(req,res,next)=>{
    try{
        // Step 1: Destructure only the allowed subscription fields from req.body
        // Notice we do NOT take "user" from req.body!
        // Even if a malicious client sends a "user" field in the body trying to
        // create a subscription for another user account, we ignore it.
        const {name,category,cost,cycle,renewalDate,paymentMethod,cardDigits}=req.body

        // Step 2: Create the subscription document
        // WHY user:req.user._id?
        // The owner of the subscription ALWAYS comes directly from req.user._id,
        // which was verified from the JWT token in authMiddleware.
        // This guarantees that one user can never create a subscription under another user's account.
        const new_subscription=await Subscription.create({
            name,
            category,
            cost,
            cycle,
            renewalDate,
            paymentMethod,
            cardDigits,
            user:req.user._id
        })

        // Step 3: Respond with 201 Created and the new subscription
        res.status(201).json({
            message:"Subscription Added Successfully",
            subscription:new_subscription
        })
    }
    catch(error){
        // Pass any validation error or DB failure to the centralized errorHandler
        next(error)
    }
}

// -------------------------------------------------------
// getSubscriptions - handles GET /api/subscriptions
// Retrieves all subscriptions belonging to the currently logged-in user.
// -------------------------------------------------------
const getSubscriptions=async(req,res,next)=>{
    try{
        // WHY match user:req.user._id?
        // This is user-scoping in action: we search ONLY for subscriptions where the
        // owner matches the logged-in user's ID. This prevents any user from viewing
        // another user's private financial subscriptions.
        //
        // WHAT DOES .populate() DO?
        // In the database, the "user" field is just a raw MongoDB ObjectId (e.g. 6adae656...).
        // .populate("user","name email") tells Mongoose to look up the User collection,
        // find the matching user document, and replace that raw ObjectId with an object
        // containing only the user's "name" and "email" fields.
        // By specifying "name email", we ensure the password hash is excluded and never sent back.
        //
        // We sort by createdAt: -1 so the most recently created subscriptions appear first.
        const subscriptions=await Subscription.find({user:req.user._id})
            .sort({createdAt:-1})
            .populate("user","name email")

        // Respond with 200 OK, the count of subscriptions, and the array of subscriptions
        res.status(200).json({
            count:subscriptions.length,
            subscriptions
        })
    }
    catch(error){
        next(error)
    }
}

// -------------------------------------------------------
// getSubscriptionById - handles GET /api/subscriptions/:id
// Retrieves a single subscription by its ID, ensuring it belongs to the logged-in user.
// -------------------------------------------------------
const getSubscriptionById=async(req,res,next)=>{
    try{
        // WHY match both _id AND user:req.user._id?
        // If we only looked up by _id, User B could view User A's subscription
        // just by guessing or obtaining its 24-character ID (an IDOR vulnerability).
        // By also matching user:req.user._id, Mongoose only returns the subscription if it
        // is owned by the logged-in user. If the ID belongs to someone else, findOne returns null.
        const subscription=await Subscription.findOne({
            _id:req.params.id,
            user:req.user._id
        }).populate("user","name email")

        // If found, return the subscription; if null, return 404 Not Found
        if(subscription){
            res.status(200).json(subscription)
        }
        else{
            res.status(404).json({message:"Subscription Not Found"})
        }
    }
    catch(error){
        next(error)
    }
}

// -------------------------------------------------------
// updateSubscription - handles PUT /api/subscriptions/:id
// Updates an existing subscription belonging to the logged-in user.
// -------------------------------------------------------
const updateSubscription=async(req,res,next)=>{
    try{
        // WHY match user:req.user._id in findOneAndUpdate?
        // We must include user:req.user._id in the query filter so one user can never
        // modify or tamper with another user's subscription data.
        // If the subscription belongs to someone else, the query finds nothing and returns null.
        //
        // Step 1: Whitelist only safe fields that the client is permitted to update.
        // We deliberately ignore any "user" property in req.body to prevent privilege escalation
        // or reassigning ownership of the subscription to someone else.
        const allowed_fields=["name","category","cost","cycle","renewalDate","paymentMethod","cardDigits"]
        const updates={}

        allowed_fields.forEach(field=>{
            if(req.body[field]!==undefined){
                updates[field]=req.body[field]
            }
        })

        // Step 2: Update the document in MongoDB
        // WHAT DO {new:true, runValidators:true} DO?
        // - new:true tells Mongoose to return the modified document AFTER updates are applied.
        //   Without this option, findOneAndUpdate returns the old document BEFORE the changes.
        // - runValidators:true forces Mongoose to run schema validation (like min cost: 0.01,
        //   category enum, regex) against the new values. By default, Mongoose only validates
        //   on create/save, not on updates.
        const updated_subscription=await Subscription.findOneAndUpdate(
            {_id:req.params.id,user:req.user._id},
            updates,
            {new:true,runValidators:true}
        )

        // If the subscription was found and updated, respond 200 with the updated document
        if(updated_subscription){
            res.status(200).json({
                message:"Subscription Updated Successfully",
                subscription:updated_subscription
            })
        }
        else{
            res.status(404).json({message:"Subscription Not Found"})
        }
    }
    catch(error){
        next(error)
    }
}

// -------------------------------------------------------
// deleteSubscription - handles DELETE /api/subscriptions/:id
// Deletes a subscription belonging to the logged-in user.
// -------------------------------------------------------
const deleteSubscription=async(req,res,next)=>{
    try{
        // WHY match user:req.user._id?
        // We match user:req.user._id so one user can never delete another user's data.
        // If User B tries to delete User A's subscription ID, findOneAndDelete finds no match,
        // does nothing to the database, and returns null so we can respond 404.
        const deleted_subscription=await Subscription.findOneAndDelete({
            _id:req.params.id,
            user:req.user._id
        })

        // If deleted, respond 200; if not found, respond 404
        if(deleted_subscription){
            res.status(200).json({message:"Subscription Deleted Successfully"})
        }
        else{
            res.status(404).json({message:"Subscription Not Found"})
        }
    }
    catch(error){
        next(error)
    }
}

module.exports={
    createSubscription,
    getSubscriptions,
    getSubscriptionById,
    updateSubscription,
    deleteSubscription
}
