require("dotenv").config();// this line loads environment variables from a .env file into process.env, allowing you to access them in your code using process.env.VARIABLE_NAME

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { connectRedis } = require("./config/redis");
const weatherRoutes = require("./routes/weatherRoutes");

const app = express();

connectDB();
connectRedis();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
}));


app.use(express.json());

app.get("/", (req, res) => {
    res.send("Weather Backend Running");
});
app.use("/", weatherRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});