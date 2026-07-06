const mongoose  = require("mongoose");


const userSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:[true,"Name is required"],
            trim:true,
        },
        email:{
            type:String,
            required:[true,"email is required"],
            unique:true,
            trim:true,
            lowercase:true,
        },
        password:{
            type:String,
            required:[true,"Password is required "],
            minlength:[6,"password should be at least 6 characters"],


        }
        

    },
    {
        timestamp:true,
    }
);

module.exports = mongoose.model("User",userSchema)
