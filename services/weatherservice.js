const Weather      = require("../models/weather");
const WeatherHistory = require("../models/WeatherHistory");
const { getRedisClient } = require("../config/redis");
//const { fetchFromOpenWeather }  = require("./openWeatherService");
const logger       = require("../utils/logger");
const openWeatherService = require("./openWeatherService");

console.log("openWeatherService:", openWeatherService);

const { fetchFromOpenWeather } = openWeatherService;

console.log("Type:", typeof fetchFromOpenWeather);

const CACHE_TTL = 60;

const cityKey = (city) => `weather:${city}`;
const allKey  = "weather:all";


const saveWeatherHistory = async (weatherData) => {
    try {
    await WeatherHistory.create({
        city:        weatherData.city,
        displayName: weatherData.displayName,
        temperature: weatherData.temperature,
        humidity:    weatherData.humidity,
        wind_speed:  weatherData.wind_speed,
        condition:   weatherData.condition,
        source:      weatherData.source || "manual",
        recordedAt:  new Date(),
    });
    logger.info(`Weather history saved for: ${weatherData.city}`);
        } catch (err) {
    logger.error(`Error saving weather history for ${weatherData.city}: ${err.message}`);
        }
    };


const fetchAllWeather = async () => {
    try {
    const redis = getRedisClient();
    console.log("REDIS OBJECT:", redis ? "EXISTS" : "NULL");
    if (redis) {
        const cached = await redis.get(allKey);
        console.log("CACHED VALUE:", cached);
        if (cached) {
            return { data: JSON.parse(cached), fromCache: true };
            }
        }
    } catch (err) {
    console.error("Redis get error:", err.message);
    }

    const data = await Weather.find().sort({ city: 1 });
    console.log("FETCHED FROM DB:", data.length, "records");

    try {
    const redis = getRedisClient();
    if (redis) {
    await redis.set(allKey, JSON.stringify(data), "EX", CACHE_TTL);
    console.log("SAVED TO REDIS:", allKey);
    }
    } catch (err) {
    console.error("Redis set error:", err.message);
    }

    return { data, fromCache: false };
};


const fetchWeatherByCity = async (city) => {
    const key = cityKey(city);

    try {
    const redis = getRedisClient();
    if (redis) {
        const cached = await redis.get(key);
            if (cached) {
        return { data: JSON.parse(cached), fromCache: true };
    }
    }
    } catch (err) {
    console.error("Redis get error:", err.message);
    }

    const existingRecord = await Weather.findOne({ city });
    if (existingRecord) {
        const  Date = new Date();

        const isExpired = existingRecord.expiresAt && existingRecord.expiresAt < Date;

        if (!isExpired){
            logger.info(`MongoDB HIT (not expired): ${city}`);
            
            await saveWeatherHistory(existingRecord);
            try {
    const redis = getRedisClient();
    if (redis) {
    await redis.set(key, JSON.stringify(data), "EX", CACHE_TTL);
    }
    } catch (err) {
    logger.error("Redis set error:", err.message);
    }

    return { data: existingRecord, fromCache: false };

        }
        logger.info(`MongoDB record expired for: ${city} — fetching fresh data`);
    }

    const freshData = await fetchFromOpenWeather(city);

    if(!freshData) return null;

    const updatedRecord = await Weather.findOneAndUpdate(
        { city },
        freshData,
        {
            new:    true,
            upsert: true,
            runValidators: true,
        });

        await saveWeatherHistory(updatedRecord);

        try {
            const redis = getRedisClient();
            if (redis) {
                await redis.set(key, JSON.stringify(updatedRecord), "EX", CACHE_TTL);
                await redis.del(allKey);
                }
            }
            
            catch (err) {
            logger.error(`Redis set error: ${err.message}`);
            }
        
        return { data: updatedRecord, fromCache: false };


};


const createWeatherRecord = async (body) => {
    const weather = await Weather.create(body);
    await saveWeatherHistory(weather);

    try {
    const redis = getRedisClient();
    if (redis) {
    await redis.del(allKey);
    }
    } catch (err) {
    console.error("Redis del error:", err.message);
    }

    return weather;
};


const updateWeatherRecord = async (city, body) => {
    const weather = await Weather.findOneAndUpdate(
    { city },
    body,
    { new: true, runValidators: true }
    );

    if (!weather) return null;
    await saveWeatherHistory(weather);

    try {
    const redis = getRedisClient();
    if (redis) {
    await redis.del(cityKey(city), allKey);
    }
    } catch (err) {
    console.error("Redis del error:", err.message);
    }

    return weather;
};


const deleteWeatherRecord = async (city) => {
    const weather = await Weather.findOneAndDelete({ city });

    if (!weather) return null;

    try {
    const redis = getRedisClient();
    if (redis) {
    await redis.del(cityKey(city), allKey);
    }
    } catch (err) {
    console.error("Redis del error:", err.message);
    }

    return weather;
};


module.exports = {
    fetchAllWeather,
    fetchWeatherByCity,
    createWeatherRecord,
    updateWeatherRecord,
    deleteWeatherRecord,
};