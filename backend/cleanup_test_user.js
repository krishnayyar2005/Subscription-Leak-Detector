// Temporary cleanup script: delete valid1@example.com from the database
require("dotenv").config()
const mongoose=require("mongoose")
const User=require("./models/User")

const cleanup=async()=>{
    await mongoose.connect(process.env.MONGO_URI)
    const result=await User.deleteOne({email:"valid1@example.com"})
    console.log("Deleted count:", result.deletedCount)
    if(result.deletedCount===1){
        console.log("PASS: test user deleted successfully")
    }
    else{
        console.log("WARN: user not found or already deleted")
    }
    await mongoose.disconnect()
    process.exit(0)
}

cleanup().catch(err=>{
    console.error(err)
    process.exit(1)
})
