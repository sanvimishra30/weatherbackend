const { body, validationResult } = require("express-validator");


const createWeatherRules = [
  body("city")
    .notEmpty().withMessage("City is required")
    .isString().withMessage("City must be text"),

  body("displayName")
    .notEmpty().withMessage("Display name is required")
    .isString().withMessage("Display name must be text"),

  body("temperature")
    .notEmpty().withMessage("Temperature is required")
    .isNumeric().withMessage("Temperature must be a number"),

  body("condition")
    .notEmpty().withMessage("Condition is required")
    .isString().withMessage("Condition must be text"),

  // optional fields — only validated IF the user sends them
  body("unit")
    .optional()
    .isIn(["Celsius", "Fahrenheit"]).withMessage("Unit must be Celsius or Fahrenheit"),

  body("humidity")
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage("Humidity must be between 0 and 100"),

  body("wind_speed")
    .optional()
    .isFloat({ min: 0 }).withMessage("Wind speed cannot be negative"),
];



const updateWeatherRules = [
  body("displayName")
    .optional()
    .isString().withMessage("Display name must be text"),

  body("temperature")
    .optional()
    .isNumeric().withMessage("Temperature must be a number"),

  body("condition")
    .optional()
    .isString().withMessage("Condition must be text"),

  body("unit")
    .optional()
    .isIn(["Celsius", "Fahrenheit"]).withMessage("Unit must be Celsius or Fahrenheit"),

  body("humidity")
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage("Humidity must be between 0 and 100"),

  body("wind_speed")
    .optional()
    .isFloat({ min: 0 }).withMessage("Wind speed cannot be negative"),
];


const checkValidation = (req, res) => {
  const errors = validationResult(req);

if (!errors.isEmpty()) {
     const messages = errors.array().map((e) => e.msg);//

    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: messages,   
    });

    return true; 
  }

  return null; 
};


module.exports = {
  createWeatherRules,
  updateWeatherRules,
  checkValidation,
};
