const { registerUser, loginUser } = require("../services/authservice");
const { checkValidation }         = require("../middleware/authValidation");

const register = async(req,res) =>{

    const failed = checkValidation(req,res);
    if(failed) return;

    try{
        const result = await registerUser(req.body);
        res.status(201).json({
            success:true,
            message:"Account successfully created",
            data:result,

        });
    }
    catch(error){
        console.error("REGISTER ERROR:", error);
        if (error.code === 11000) {
        return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
        });
    }

    res.status(500).json({
        success: false,
        message: "Registration failed",
    });
    }
};


const login = async(req,res) =>{
    const failed = checkValidation(req.body);
    if(failed) return ;

    try{
        const result = await loginUser(req.body);
        if(!result){
            return res.status(401).json({
            success: false,
            message: "Invalid email or password",
        
        });
        }
        res.status(200).json({
        success: true,
        message: "Login successful",
        data:    result,

    });
    }
    catch(error){
        console.error("LOGIN ERROR:", error);
        res.status(500).json({
        success: false,
        message: "Login failed",
        });
    }
};

module.exports={register,login}

