// controllers/weather.js

const Weather = require("../models/weather");

const getAllWeather = async (req, res) => {
    try {
        const allWeather = await Weather.find();
        res.status(200).json({
            message: "Get all weather data",
            data: allWeather
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getWeatherByCity = async (req, res) => {
    try {
        const { city } = req.params;
        const weather = await Weather.findOne({ city: city.toLowerCase() });
        
        if (!weather) {
            return res.status(404).json({
                message: `Weather for ${city} not found`
            });
        }

        res.status(200).json({
            message: `Weather for ${city}`,
            data: weather
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const createWeather = async (req, res) => {
    try {
        const weatherData = req.body;
        
        const weather = new Weather(weatherData);
        await weather.save();

        res.status(201).json({
            message: "Weather created successfully",
            data: weather
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const updateWeather = async (req, res) => {
    try {
        const { city } = req.params;
        const updatedData = req.body;

        const weather = await Weather.findOneAndUpdate(
            { city: city.toLowerCase() },
            updatedData,
            { new: true, runValidators: true }
        );

        if (!weather) {
            return res.status(404).json({
                message: `Weather for ${city} not found`
            });
        }

        res.status(200).json({
            message: `Weather updated for ${city}`,
            data: weather
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const deleteWeather = async (req, res) => {
    try {
        const { city } = req.params;

        const weather = await Weather.findOneAndDelete({ city: city.toLowerCase() });

        if (!weather) {
            return res.status(404).json({
                message: `Weather for ${city} not found`
            });
        }

        res.status(200).json({
            message: `Weather deleted for ${city}`,
            data: weather
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    getAllWeather,
    getWeatherByCity,
    createWeather,
    updateWeather,
    deleteWeather
};