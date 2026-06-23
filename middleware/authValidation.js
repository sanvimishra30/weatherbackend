const { body, validationResult } = require("express-validator");

const registerRules = [
    body("name")
    .notEmpty().withMessage("Name is required")
    .isString().withMessage("Name must be text"),

    body("email")
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email address"),
    

    body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    
];

const loginRules = [
    body("email")
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email"),

    body("password")
    .notEmpty().withMessage("Password is required"),
];

const checkValidation = (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    res.status(400).json({
    success: false,
    message: "Validation failed",
    errors:  messages,
    });
    return true;
    }

    return null;
};


module.exports = { registerRules, loginRules, checkValidation };
