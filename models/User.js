const mongoose  = require("mongoose");
const bcrypt = require ("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:[true,"Nameis required"],
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
            minlength:[6,"password should be atleast 6 characters"],


        }
        

    },
    {
        timestamp:true,
    }
);

module.exports = mongoose.model("User",userSchema)
