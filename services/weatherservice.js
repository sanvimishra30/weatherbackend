const Weather      = require("../models/weather");
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