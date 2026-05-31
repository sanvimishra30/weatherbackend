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

router.get('/',          getAllWeather);
router.get('/:city',     getWeatherByCity);
router.post('/',         createWeather);
router.put('/:city',     updateWeather);
router.delete('/:city',  deleteWeather);

module.exports = router;