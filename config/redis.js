
const Redis = require("ioredis");

let redisClient = null;

const connectRedis = () => {
  redisClient = new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
  });

  redisClient.on("connect", () => console.log("✅ Redis connected"));
  redisClient.on("error",   (err) => console.error("❌ Redis error:", err.message));
};

const getRedisClient = () => redisClient;

module.exports = { connectRedis, getRedisClient };
