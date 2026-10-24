// controllers/subscriptionController.js
// Controllers handle the business logic for subscription operations.
// Every controller here is protected and user-scoped, meaning operations
// only affect the subscriptions of the currently logged-in user.

const Subscription=require("../models/Subscription")
const {toMonthly,toAnnual,round2}=require("../utils/normalizeCost")
const {detectOverlaps}=require("../utils/overlapDetector")

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

// -------------------------------------------------------
// getAnalysis - handles GET /api/subscriptions/analysis
// Analyzes all subscriptions for the currently logged-in user:
// 1. summary: { activeCount, monthlyTotal, annualTotal }
// 2. byCategory: breakdown per category with monthly/annual spend, counts, and percentages
// 3. overlaps: duplicate subscriptions in the same category detected as spending leaks
// 4. leakPercentage: percentage of total monthly spend wasted on duplicates
//
// WORKED EXAMPLE:
// Suppose User A has 3 subscriptions:
//   - Spotify: $9.99 Monthly (Music)
//   - Apple Music: $99 Yearly -> $99 / 12 = $8.25 Monthly (Music)
//   - Netflix: $15.49 Monthly (Video)
//
// Calculation:
// - monthlyTotal = 9.99 + 8.25 + 15.49 = $33.73
// - annualTotal  = (9.99 * 12) + 99 + (15.49 * 12) = 119.88 + 99 + 185.88 = $404.76
// - byCategory:
//     * Music: count 2, monthly $18.24, annual $218.88, percentage = (18.24 / 33.73) * 100 = 54.08%
//     * Video: count 1, monthly $15.49, annual $185.88, percentage = (15.49 / 33.73) * 100 = 45.92%
// - overlaps (via detectOverlaps):
//     * Music has 2 items -> Keep Spotify ($9.99), leak Apple Music ($8.25/mo, $99/yr)
//     * totalMonthlyLeak = $8.25
// - leakPercentage = (8.25 / 33.73) * 100 = 24.46%
// -------------------------------------------------------
const getAnalysis=async(req,res,next)=>{
    try{
        // Step 1: Load ONLY the logged-in user's subscriptions
        // WHAT DOES .lean() DO?
        // By default, Mongoose wraps query results into heavy Mongoose Document
        // objects with internal change-tracking, getters, setters, and prototype methods.
        // Calling .lean() tells Mongoose to skip document hydration and return plain,
        // lightweight JavaScript objects instead.
        // This uses significantly less memory, runs much faster, and allows us to pass
        // the subscription objects directly to pure helper functions like detectOverlaps.
        const subscriptions=await Subscription.find({user:req.user._id}).lean()

        // Step 2: Handle empty subscriptions gracefully
        // If the user has no subscriptions, return zeros and empty arrays in the exact same response shape
        if(subscriptions.length===0){
            return res.status(200).json({
                summary:{
                    activeCount:0,
                    monthlyTotal:0,
                    annualTotal:0
                },
                byCategory:[],
                overlaps:{
                    overlapCount:0,
                    totalMonthlyLeak:0,
                    totalAnnualLeak:0,
                    overlaps:[]
                },
                leakPercentage:0
            })
        }

        // Step 3: Compute unrounded monthly and annual costs, and group by category
        // WHY KEEP UNROUNDED TOTALS?
        // Rounding floating-point numbers during intermediate additions causes rounding errors
        // to compound across multiple items. We keep full unrounded precision throughout
        // the calculations and only apply round2 at the very end when building the response.
        let raw_monthly_total=0
        let raw_annual_total=0

        // Plain object for category grouping:
        // { "Music": { count: 3, raw_monthly: 35.62, raw_annual: 427.44 }, ... }
        const category_groups={}

        subscriptions.forEach((sub)=>{
            const sub_monthly=toMonthly(sub.cost,sub.cycle)
            const sub_annual=toAnnual(sub.cost,sub.cycle)

            raw_monthly_total=raw_monthly_total+sub_monthly
            raw_annual_total=raw_annual_total+sub_annual

            // Clean category string - note that "Other" category IS included here
            // because byCategory powers the total spend breakdown chart.
            const cat_name=sub.category?sub.category.trim():"Other"

            if(!category_groups[cat_name]){
                category_groups[cat_name]={
                    count:0,
                    raw_monthly:0,
                    raw_annual:0
                }
            }

            category_groups[cat_name].count=category_groups[cat_name].count+1
            category_groups[cat_name].raw_monthly=category_groups[cat_name].raw_monthly+sub_monthly
            category_groups[cat_name].raw_annual=category_groups[cat_name].raw_annual+sub_annual
        })

        // Step 4: Build byCategory array with rounded values and percentages
        // percentage = (category monthly / total monthly) * 100 (or 0 if total is 0)
        const byCategory=Object.keys(category_groups).map((cat_name)=>{
            const group=category_groups[cat_name]
            const percentage=raw_monthly_total===0?0:round2((group.raw_monthly/raw_monthly_total)*100)

            return {
                category:cat_name,
                count:group.count,
                monthly:round2(group.raw_monthly),
                annual:round2(group.raw_annual),
                percentage:percentage
            }
        })

        // Sort categories by monthly spend DESCENDING (highest spend category first)
        byCategory.sort((a,b)=>{
            return b.monthly-a.monthly
        })

        // Step 5: Detect overlaps among subscriptions
        // detectOverlaps receives the plain lean objects and computes keep vs redundant services.
        // It automatically skips the "Other" category and groups with only 1 item.
        const overlaps=detectOverlaps(subscriptions)

        // Step 6: Compute leakPercentage
        // detectOverlaps returns totalMonthlyLeak already rounded to 2 decimals.
        // We compute the percentage using that leak total against the unrounded monthlyTotal for accuracy,
        // and round the resulting percentage with round2 at the very end.
        const leakPercentage=raw_monthly_total===0?0:round2((overlaps.totalMonthlyLeak/raw_monthly_total)*100)

        // Step 7: Build the summary object with rounded totals
        const summary={
            activeCount:subscriptions.length,
            monthlyTotal:round2(raw_monthly_total),
            annualTotal:round2(raw_annual_total)
        }

        // Step 8: Respond 200 with the exact specified analysis shape
        res.status(200).json({
            summary,
            byCategory,
            overlaps,
            leakPercentage
        })
    }
    catch(error){
        // Forward any unexpected error to the centralized error-handling middleware
        next(error)
    }
}

module.exports={
    createSubscription,
    getSubscriptions,
    getSubscriptionById,
    updateSubscription,
    deleteSubscription,
    getAnalysis
}
