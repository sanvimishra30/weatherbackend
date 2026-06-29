const Redis = require ("ioredis");
const logger = require("../utils/logger");

let redisClient =null; // let is used in place of const because we are going to assign a value to it later in the connectRedis function

const connectRedis = () =>{
    redisClient=new Redis({
        host: process.env.REDIS_HOST||"127.0.0.1",
        port:process.env.REDIS_PORT||6379,

    });

    redisClient.on("connect", () => logger.info("Redis connected"));   // ← NEW
    redisClient.on("ready",   () => logger.info("Redis ready"));       // ← NEW
    redisClient.on("error",   (err) => logger.error(`Redis error: ${err.message}`));
};

const getRedisClient = () => {
    console.log("getRedisClient called, value:", redisClient ? "HAS VALUE" : "NULL");
    return redisClient;
};// this function returns the redisClient instance, allowing other parts of the application to use it for caching and retrieving data from Redis

module.exports={getRedisClient,connectRedis};// why can'nt we export the redisClient directly? Because we want to ensure that the Redis client is properly initialized and connected before it is used elsewhere in the application. By providing a function to get the client, we can control when and how it is accessed. for example, if we exported the redisClient directly, other modules could try to use it before it has been initialized, leading to errors. By using a function, we can ensure that the client is only accessed after it has been set up correctly.
//connectRedis() is called in index.js to establish the connection to Redis when the application starts. getRedisClient() is called in the controller whenever we need to read or write to Redis.