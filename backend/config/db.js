// config/db.js - Responsible for connecting to MongoDB Atlas using Mongoose

const mongoose=require("mongoose")

// -------------------------------------------------------------------
// WHAT IS MongoDB Atlas?
// MongoDB Atlas is a cloud-hosted MongoDB service. Instead of running
// a database on your own computer, your data lives on MongoDB's servers.
// You talk to it over the internet using a "connection string" (MONGO_URI).
//
// WHAT IS THE CONNECTION STRING (MONGO_URI)?
// It looks like: mongodb+srv://<user>:<password>@cluster0.xxxx.mongodb.net/
// It tells Mongoose WHERE the database is, WHO you are, and the PASSWORD.
// We store it in .env so it is never exposed in source code.
//
// WHAT IS process.exit(1)?
// It forcefully stops the Node.js process and returns exit code 1 to the OS.
// Exit code 0 = success, any other number = failure.
// We use it here because if the DB connection fails, the whole app is broken
// and there is no point in keeping the server running.
// -------------------------------------------------------------------

const connectDB=async()=>{

    // Safety check: if MONGO_URI was never set in .env, warn the developer
    // and stop immediately instead of showing a confusing Mongoose error
    if(!process.env.MONGO_URI){
        console.log("MONGO_URI is not set. Please add MONGO_URI to your .env file.")
        process.exit(1)
    }

    try{
        // mongoose.connect() returns a promise, so we await it
        // It reads the URI from the environment variable we loaded via dotenv
        await mongoose.connect(process.env.MONGO_URI)

        // If we reach this line the handshake with Atlas was successful
        console.log("MongoDB Connected Successfully")
    }
    catch(error){
        // Only log the error message, not the full stack trace
        // The message usually tells us exactly what went wrong
        // Common causes:
        //   - Wrong password in MONGO_URI
        //   - Your IP address is not whitelisted in Atlas Network Access
        //   - Special characters in the password are not URL-encoded
        //   - The cluster name or database name in the URI is wrong
        console.log("MongoDB connection failed:", error.message)

        // Stop the server - no point running without a database
        process.exit(1)
    }
}

module.exports=connectDB
