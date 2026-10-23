// models/User.js
// A "model" is the JS class Mongoose gives us to talk to a MongoDB collection.
// Before we can create the model, we first define a "schema" - a blueprint
// that tells Mongoose what fields each document should have and their rules.

const mongoose=require("mongoose")

// -------------------------------------------------------
// SCHEMA - the blueprint for every user document
// Think of it like the columns of a database table.
// Each field has a "type" and optional validation rules.
// -------------------------------------------------------
const userSchema=new mongoose.Schema(
    {
        // name: plain string, must be provided, trim removes accidental whitespace
        // e.g. "  John Doe  " becomes "John Doe" automatically
        name:{
            type:String,
            required:[true,"Name is required"],
            trim:true
        },

        // email: must be unique across all users (MongoDB will enforce this with an index)
        // lowercase:true means "john@EXAMPLE.COM" is stored as "john@example.com"
        // so two users can't register with the same email in different cases
        email:{
            type:String,
            required:[true,"Email is required"],
            unique:true,
            lowercase:true,
            trim:true
        },

        // password: we store the BCRYPT HASH here, NOT the plain-text password.
        // No minlength rule here - validation of the original password
        // (before hashing) will be done in a separate validation middleware.
        password:{
            type:String,
            required:[true,"Password is required"]
        }
    },
    {
        // timestamps:true tells Mongoose to automatically add two fields:
        //   createdAt - when the document was first created
        //   updatedAt - when the document was last changed
        // Very useful for audit trails without writing any extra code.
        timestamps:true
    }
)

// -------------------------------------------------------
// MODEL - the compiled class we use in controllers
// "User" becomes the collection name "users" in MongoDB (lowercase + plural)
// mongoose.model("User", userSchema) returns a constructor we can call:
//   User.find(), User.create(), User.findOne(), etc.
// -------------------------------------------------------
const User=mongoose.model("User",userSchema)

module.exports=User
