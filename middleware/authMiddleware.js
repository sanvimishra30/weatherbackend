const jwt = require("jsonwebtoken");
const user = require("../models/User");
const User = require("../models/User");

const protect = async (req,res,next) => {
    try{

        const authHeader=req.headers.authorization;

        if(!authHeader || !authHeader.startswith("Bearer")){
            return res.status(401).json({
                success:false,
                message:"NO token provided please login",
            });
        }
        const token = authHeader.split("")[1];

        const decoded = jwt.verify(token,process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select ("-password");

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