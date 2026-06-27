require("dotenv").config();
const express = require ("express");
const cors =require("cors");
const helmet = require("helmet");
const connectDB = require("./config/db");
const {connectRedis} = require("./config/redis");
const weatherRoutes = require("./routes/weatherRoutes");
const authRoutes    = require("./routes/authRoutes");
const {generalLimiter}= require("./middleware/rateLimiter");




const app = express();
connectDB();
connectRedis();

app.use(helmet());

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods:  ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type","Authorization"],
}));

app.use(express.json());

app.use(generalLimiter);

app.get("/",(req,res)=>{
    res.status(200).json({success:true,message:"Weather API is running"});
});


app.use("/api/auth",    authRoutes);
app.use("/api/weather", weatherRoutes);


app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route '${req.originalUrl}' not found`,
  });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ success: false, message: "Something went wrong" });//
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>{
    console.log(` Server running on http://localhost:${PORT}` );
});



