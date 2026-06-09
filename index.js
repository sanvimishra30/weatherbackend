const express = require("express");
const cors = require("cors");
const weatherRoutes = require("./routes/weatherRoutes");
require("dotenv").config();
const connectDB = require("./connection");
const { connect } = require("mongoose");

const app = express();
console.log("Before DB connection");

connectDB();

console.log("After DB connection");

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