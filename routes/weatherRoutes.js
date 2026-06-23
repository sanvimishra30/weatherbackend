const express = require("express");

const router = express.Router();
const {
  getAllWeather,
  getWeatherByCity,
  createWeather,
  updateWeather,
  deleteWeather,} = require("../controllers/weather");

  const {createWeatherRules,
          updateWeatherRules , } = require("../middleware/weatherValidation");

          const { protect } = require("../middleware/authMiddleware");

          router.get('/',getAllWeather);
          router.get('/:city',getWeatherByCity);

          router.post(  "/",       protect, createWeatherRules, createWeather);
          router.put(   "/:city",  protect, updateWeatherRules, updateWeather);
          router.delete("/:city",  protect, deleteWeather);


          module.exports= router;

