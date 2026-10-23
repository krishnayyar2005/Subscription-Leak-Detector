// models/Subscription.js
// Defines the blueprint (schema) for every subscription document
// stored in the "subscriptions" collection in MongoDB.

const mongoose=require("mongoose")

const subscriptionSchema=new mongoose.Schema(
    {
        // -------------------------------------------------------
        // user - links this subscription to its owner
        // Type: ObjectId - MongoDB's unique 24-character document ID
        // ref:"User" tells Mongoose WHICH collection to look in when
        // we later call .populate("user").
        // populate() swaps the raw ObjectId for the full User document
        // (or selected fields) so we can read name/email without a
        // second manual query.
        // Example: instead of { user: "6adae656..." } we get
        //          { user: { name:"Alice", email:"alice@..." } }
        // -------------------------------------------------------
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:[true,"User is required"]
        },

        // name - what the user calls this subscription, e.g. "Spotify"
        name:{
            type:String,
            required:[true,"Subscription name is required"],
            trim:true
        },

        // -------------------------------------------------------
        // category - a controlled list of allowed values (an enum).
        // WHY use enum in the schema?
        // If the client sends "Muzik" or "music" (lowercase) we want
        // Mongoose to reject it immediately with a clear message
        // BEFORE any controller logic runs - same principle as having
        // required on a field.
        // -------------------------------------------------------
        category:{
            type:String,
            required:[true,"Category is required"],
            enum:{
                values:["Music","Video","Gaming","Cloud Storage","Fitness","News","Productivity","Food","Other"],
                message:"{VALUE} is not a valid category"
            }
        },

        // -------------------------------------------------------
        // cost - the subscription price in USD (base currency).
        // WHY min:0.01 and not min:0?
        // A subscription that costs exactly $0 is effectively free
        // and should not appear in a "leak" detector.
        // The min validator is defined with a tuple: [value, message]
        // so Mongoose uses our message instead of the default one.
        // -------------------------------------------------------
        cost:{
            type:Number,
            required:[true,"Cost is required"],
            min:[0.01,"Cost must be at least 0.01"]
        },

        // -------------------------------------------------------
        // cycle - how often the subscription bills the user.
        // Stored as an enum so the frontend and backend always agree
        // on the exact casing - no "monthly" vs "Monthly" confusion.
        // -------------------------------------------------------
        cycle:{
            type:String,
            required:[true,"Billing cycle is required"],
            enum:{
                values:["Weekly","Monthly","Yearly"],
                message:"{VALUE} is not a valid billing cycle. Use Weekly, Monthly, or Yearly"
            }
        },

        // renewalDate - when the next payment is due (optional)
        // Stored as a JS Date; Mongoose will coerce "2025-01-15" strings too
        renewalDate:{
            type:Date
        },

        // paymentMethod - optional tag for which payment instrument was used
        // e.g. "cc" = credit card, "dc" = debit card, "upi" = UPI
        paymentMethod:{
            type:String,
            enum:{
                values:["cc","dc","upi","paypal","net"],
                message:"{VALUE} is not a valid payment method"
            }
        },

        // -------------------------------------------------------
        // cardDigits - last 4 digits of the card (optional).
        // WHY use match (regex) in the schema?
        // match is a built-in Mongoose validator that tests a string
        // against a regular expression. If the string does not match,
        // Mongoose raises a ValidationError with the custom message.
        // /^\d{4}$/ means: start(^), exactly four digits(\d{4}), end($)
        // So "1234" passes; "12" or "12345" or "abcd" all fail.
        // -------------------------------------------------------
        cardDigits:{
            type:String,
            match:[/^\d{4}$/,"cardDigits must be exactly 4 numeric digits"]
        }
    },
    {
        // timestamps:true adds createdAt and updatedAt automatically
        // Useful for sorting subscriptions by when they were added
        timestamps:true
    }
)

// -------------------------------------------------------
// MODEL
// "Subscription" -> collection name "subscriptions" in MongoDB
// We export the model so controllers can call:
//   Subscription.find(), Subscription.create(), etc.
// -------------------------------------------------------
module.exports=mongoose.model("Subscription",subscriptionSchema)
