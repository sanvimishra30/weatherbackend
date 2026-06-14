const Weather = require("../models/weather");
const { getRedisClient } = require("../config/redis");

const CACHE_TTL = 60; // seconds


// ── Helper: builds the Redis key for a city ───────────────────────────────────
// Keeps key naming consistent across all functions
// "delhi" → "weather:delhi"
const cityKey  = (city) => `weather:${city}`;
const allKey   = "weather:all";


// ── GET ALL ───────────────────────────────────────────────────────────────────
const fetchAllWeather = async () => {
  const redis = getRedisClient();

  // 1. Check cache
  const cached = await redis.get(allKey);
  if (cached) {
    return { data: JSON.parse(cached), fromCache: true };
  }

  // 2. Cache miss — hit MongoDB
  const data = await Weather.find().sort({ city: 1 });

  // 3. Save to Redis
  await redis.set(allKey, JSON.stringify(data), "EX", CACHE_TTL);

  return { data, fromCache: false };
};


// ── GET BY CITY ───────────────────────────────────────────────────────────────
const fetchWeatherByCity = async (city) => {
  const redis = getRedisClient();// this gets the Redis client instance that we can use to interact with Redis
  const key   = cityKey(city);// this generates the Redis key for the given city, e.g., "delhi" → "weather:delhi"

  // 1. Check cache
  const cached = await redis.get(key);
  if (cached) {
    return { data: JSON.parse(cached), fromCache: true };
  }

  // 2. Cache miss — hit MongoDB
  const data = await Weather.findOne({ city });

  // 3. If city not found, return null (controller will send 404)
  if (!data) return null;

  // 4. Save to Redis
  await redis.set(key, JSON.stringify(data), "EX", CACHE_TTL);

  return { data, fromCache: false };
};


// ── CREATE ────────────────────────────────────────────────────────────────────
const createWeatherRecord = async (body) => {
  const redis = getRedisClient();

  // Save to MongoDB
  // If city already exists, MongoDB throws error code 11000
  // We let it throw — the controller catches it and sends 409
  const weather = await Weather.create(body);

  // Clear the "all" cache — list is now outdated
  await redis.del(allKey);

  return weather;
};


// ── UPDATE ────────────────────────────────────────────────────────────────────
const updateWeatherRecord = async (city, body) => {
  const redis = getRedisClient();

  const weather = await Weather.findOneAndUpdate(
    { city },
    body,
    { new: true, runValidators: true }// this option tells Mongoose to return the updated document and to run validation on the update
  );

  // If not found, return null (controller will send 404)
  if (!weather) return null;

  // Clear both caches — individual city and full list are now outdated
  await redis.del(cityKey(city), allKey);

  return weather;
};


// ── DELETE ────────────────────────────────────────────────────────────────────
const deleteWeatherRecord = async (city) => {
  const redis = getRedisClient();

  const weather = await Weather.findOneAndDelete({ city });

  // If not found, return null (controller will send 404)
  if (!weather) return null;

  // Clear both caches
  await redis.del(cityKey(city), allKey);

  return weather;
};


module.exports = {
  fetchAllWeather,
  fetchWeatherByCity,
  createWeatherRecord,
  updateWeatherRecord,
  deleteWeatherRecord,
};
