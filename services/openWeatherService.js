// console.log("1. File started");

// const axios = require("axios");

// const logger = require("../utils/logger");

// console.log("2. Imports completed");

const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

const fetchFromOpenWeather = async (city)=>{

    try{
        logger.info(`fetching data from openWeatherAPI for city:${city}`);

        const response = await axios.get(BASE_URL,{
            params:{
                q:city,
                appid: process.env.OPENWEATHER_API_KEY,
                units:"metric"
            }
        });

        const data = response.data;

        const mappedData = {
        city:        data.name.toLowerCase(),
        displayName: data.name,
        temperature: Math.round(data.main.temp),
        unit:        "Celsius",
        condition:   data.weather[0].description,
        humidity:    data.main.humidity,
        wind_speed:  Math.round(data.wind.speed * 3.6),
        source:      "openWeatherMap",
      expiresAt:   new Date(Date.now() + 30 * 60 * 1000),
    };
    logger.info(`OpenWeatherMap data fetched for: ${mappedData.displayName}`);
    return mappedData;
    
    }
    catch(err){
        if (err.response) {
            const status  = err.response.status;
            const message = err.response.data.message;
        
            if (status === 404) {
                logger.warn(`City not found in OpenWeatherMap: ${city}`);
                return null; // city not found → return null → controller sends 404
                }
        
            if (status === 401) {
                logger.error("OpenWeatherMap API key is invalid");
                throw new Error("Weather service API key is invalid");
                }
        
            logger.error(`OpenWeatherMap error: ${message}`);
            throw new Error(`Weather service error: ${message}`);
            }
        
            // network error → no response received
            logger.error(`OpenWeatherMap network error: ${err.message}`);
            throw new Error("Weather service is currently unavailable");
    }
    };
    console.log("3. About to export fetchFromOpenWeather");


module.exports= {fetchFromOpenWeather};

console.log("4. Export complete");
    
