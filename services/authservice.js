const jwt  = require("jsonwebtoken");
const User = require("../models/User");


const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};