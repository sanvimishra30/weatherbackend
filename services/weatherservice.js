const Weather      = require("../models/weather");
const { getRedisClient } = require("../config/redis");

const CACHE_TTL = 60;

const cityKey = (city) => `weather:${city}`;  // ← backticks
const allKey  = "weather:all";


const fetchAllWeather = async () => {
    try {
    const redis = getRedisClient();
    if (redis) {
        const cached = await redis.get(allKey);
        if (cached) {
            return { data: JSON.parse(cached), fromCache: true };
            }
        }
    } catch (err) {
    console.error("Redis get error:", err.message);
    }

    const data = await Weather.find().sort({ city: 1 });

    try {
    const redis = getRedisClient();
    if (redis) {
    await redis.set(allKey, JSON.stringify(data), "EX", CACHE_TTL);
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

    const data = await Weather.findOne({ city });
    if (!data) return null;

    try {
    const redis = getRedisClient();
    if (redis) {
    await redis.set(key, JSON.stringify(data), "EX", CACHE_TTL);
    }
    } catch (err) {
    console.error("Redis set error:", err.message);
    }

    return { data, fromCache: false };
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