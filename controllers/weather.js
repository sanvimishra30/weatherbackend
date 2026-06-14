const {
  fetchAllWeather,
  fetchWeatherByCity,
  createWeatherRecord,
  updateWeatherRecord,
  deleteWeatherRecord,
} = require("../services/weatherservice");

const { checkValidation } = require("../middleware/weatherValidation");


// GET /api/weather
const getAllWeather = async (req, res) => {
  try {
    const { data, fromCache } = await fetchAllWeather();

    res.status(200).json({
      success: true,
      message: "All weather records fetched",
      fromCache,
      count: data.length,
      data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch weather data" });
  }
};


// GET /api/weather/:city
const getWeatherByCity = async (req, res) => {
  try {
    const city   = req.params.city.toLowerCase();
    const result = await fetchWeatherByCity(city);

    // Service returns null when city not found
    if (!result) {
      return res.status(404).json({
        success: false,
        message: `No weather data found for "${req.params.city}"`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Weather for "${req.params.city}"`,
      fromCache: result.fromCache,
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch weather data" });
  }
};


// POST /api/weather
const createWeather = async (req, res) => {
  const failed = checkValidation(req, res);
  if (failed) return;

  try {
    const weather = await createWeatherRecord(req.body);

    res.status(201).json({
      success: true,
      message: "Weather record created",
      data: weather,
    });
  } catch (error) {
    // Duplicate city — MongoDB error code 11000
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: `A weather record for "${req.body.city}" already exists`,
      });
    }
    res.status(500).json({ success: false, message: "Failed to create weather record" });
  }
};


// PUT /api/weather/:city
const updateWeather = async (req, res) => {
  const failed = checkValidation(req, res);
  if (failed) return;

  try {
    const city    = req.params.city.toLowerCase();
    const weather = await updateWeatherRecord(city, req.body);

    // Service returns null when city not found
    if (!weather) {
      return res.status(404).json({
        success: false,
        message: `No weather data found for "${req.params.city}"`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Weather record for "${req.params.city}" updated`,
      data: weather,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    res.status(500).json({ success: false, message: "Failed to update weather record" });
  }
};


// DELETE /api/weather/:city
const deleteWeather = async (req, res) => {
  try {
    const city    = req.params.city.toLowerCase();
    const weather = await deleteWeatherRecord(city);

    // Service returns null when city not found
    if (!weather) {
      return res.status(404).json({
        success: false,
        message: `No weather data found for "${req.params.city}"`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Weather record for "${req.params.city}" deleted`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete weather record" });
  }
};


module.exports = {
  getAllWeather,
  getWeatherByCity,
  createWeather,
  updateWeather,
  deleteWeather,
};
