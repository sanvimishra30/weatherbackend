const {body, validationResult} = require('express-validator');

const createWeatherRules = [
  body('city')
  .notEmpty().withMessage('city is required')
  .isString().withMessage('city must be a string'),

  body('displayName')
  .notEmpty().withMessage('display name is required')
  .isString().withMessage('display name must be string '),

  body('temperature')
  .notEmpty().withMessage('temperature is required')
  .isNumeric().withMessage('temperature must be a number'),

  body('condition')
  .notEmpty().withMessage('condition is required')
  .isString().withMessage('condition must be a string'),

  body('unit')
    .optional()
    .isIn(['Celsius', 'Fahrenheit']).withMessage("unit must be celsius or fahrenheit"),

    body('humidity')
    .optional()
    .isFloat({min:0,max:100}).withMessage("Humidity must be between 0 and 100"),

    body('wind_speed')
    .optional()
    .isFloat({min:0}).withMessage("wind speed cannot be negative "),

];

const updateWeatherRules = [
  body('city')
  .optional()
  .isString().withMessage('city must be a String'),

  body('displayName')
  .optional()
  .isString().withMessage("display name must be String"),

  body('temperature')
  .optional()
  .isNumeric().withMessage("temperature must be a number"),

  body('condition')
  .optional()
  .isString().withMessage("condition must be a String"),

  body('unit')
  .optional()
  .isIn(['celsius','Fahrenheit']).withMessage("unit is either celsius or fahrenheit"),

  body('humidity')
  .optional()
  .isFloat({min:0,max:100}).withMessage("humidity must be between 0 and 100"),

  body('wind_speed')
  .optional()
  .isFloat({min:0}).withMessage("wind speed cannot be negative"),


];


const checkValidation = (req,res) =>{
  const error = validationResult(req);
  if (!error.isEmpty())
  {
    const messages = error.array().map((e)=> e.msg);
  
  res.status(400).json({
    success: false,
    message:"Validation required",
    errors:messages,
  });

  return true;// we are returning true here to signal to the controller that validation has failed, so it should stop processing the request and return the response immediately. If there are no validation errors, we return null to indicate that everything is good and the controller can continue with its normal flow.
}
return null;
};


module.exports = {
  createWeatherRules,
  updateWeatherRules,
  checkValidation,
};