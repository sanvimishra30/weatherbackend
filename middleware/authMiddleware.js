const jwt = require("jsonwebtoken");
const user = require("../models/User");
const User = require("../models/User");

const protect = async (req,res,next) => {
    console.log("AUTH HEADER:", req.headers.authorization);
    try{

        const authHeader=req.headers.authorization;

        if(!authHeader || !authHeader.startsWith("Bearer")){
            return res.status(401).json({
                success:false,
                message:"NO token provided please login",
            });
        }
        const token = authHeader.split("Bearer ")[1];
        console.log("TOKEN:", token);
        console.log("JWT SECRET:", process.env.JWT_SECRET);

        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        console.log("DECODED:", decoded);

        const user = await User.findById(decoded.id).select ("-password");
        console.log("USER FOUND:", user);

        if (!user) {
        return res.status(401).json({
        success: false,
        message: "User no longer exists.",
        });
    }

    req.user = user;
    next();

    }
    catch(error){
        console.log("MIDDLEWARE ERROR:", error.name, error.message);
        if (error.name === "TokenExpiredError") {
        return res.status(401).json({
        success: false,
        message: "Token has expired. Please log in again.",
        });
    }
    return res.status(401).json({
        success: false,
        message: "Invalid token. Please log in again.",
    });
    }
};

module.exports={protect};