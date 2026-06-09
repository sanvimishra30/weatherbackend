const express = require('express');


const Weather = require("../models/weather");
const router = express.Router();
const {
  getAllWeather,
  getWeatherByCity,
  createWeather,
  updateWeather,
  deleteWeather,
} = require('../controllers/weather');

const {
  createWeatherRules,
  updateWeatherRules,
} = require("../middleware/weatherValidation");


router.get('/',          getAllWeather);
router.get('/:city',     getWeatherByCity);
router.post('/',         createWeatherRules,createWeather);
router.put('/:city',     updateWeatherRules,updateWeather);
router.delete('/:city',  deleteWeather);

module.exports = router;