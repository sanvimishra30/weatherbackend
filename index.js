require("dotenv").config();
const express = require ("express");
const cors =require("cors");
const helmet = require("helmet");
const compression = require("compression");
const timeout = require("connect-timeout");
const connectDB = require("./config/db");
const {connectRedis} = require("./config/redis");
const weatherRoutes = require("./routes/weatherRoutes");
const authRoutes    = require("./routes/authRoutes");
const chatRoutes         = require("./routes/chatRoutes");
const {generalLimiter}= require("./middleware/rateLimiter");
const logger = require ("./utils/logger");
const morganLogger = require("./middleware/morganLogger");




const app = express();
connectDB();
connectRedis();

app.use(compression({threshold:1024}));

app.use(timeout("10s"));

app.use((req,res,next)=>{

  if (!req.timedout) return next();
})

app.use(helmet());

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods:  ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type","Authorization"],
}));

app.use(express.json({limit:"10kb"}));
app.use(morganLogger);

app.use(generalLimiter);

app.get("/",(req,res)=>{
    res.status(200).json({success:true,message:"Weather API is running"});
});


app.use("/api/auth",    authRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/chat",    chatRoutes);


app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route '${req.originalUrl}' not found`,
  });
});

app.use((err, req, res, next) => {
  logger.error(`Unhandled error:${err.stack}`);
  res.status(500).json({ success: false, message: "Something went wrong" });//
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>{
    logger.info(` Server running on http://localhost:${PORT}` );
});


const shutdown = async (signal) => {

  logger.info(`${signal} received — shutting down gracefully`);

  server.close(async()=>{
    logger.info("HTTP srver closed");


    const mongoose = require ("mongoose");
    await mongoose.connection.close();
    logger.info("MongoDB connection closed");

    const {getRedisClientredisClient} = require("./config/redis");
    const redis= getRedisClient();

    if(redis){
      await redis.quit();
      logger.info("Redis connection closed");
    }

    logger.info("Shutdown complete");
    process.exit(0);
  });

  setTimeout(()=>{
    logger.error("Forced shutdown after 15s timeout");
    process.exit(1);
  },15000);
}


process.on("SIGTERM",()=>shutdown("SIGTERM"));
process.on("SIGINT",()=>shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  logger.error(`Unhandled Rejection: ${reason}`);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});


