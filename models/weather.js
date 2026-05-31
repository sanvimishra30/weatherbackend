const mongoose = require('mongoose');

const weatherSchema = new mongoose.Schema(
  {
    city: {
      type: String,
      required: [true, 'City name is required'],
      unique: true,
      trim: true,// removes whitespace from both ends of the string
      lowercase: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    temperature: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      default: 'Celsius',
    },
    condition: {
      type: String,
      required: true,
    },
    humidity: {
      type: Number,
      min: 0,
      max: 100,
    },
    wind_speed: {
      type: Number,
    },
  },
  {
    timestamps: true,   // adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model('Weather', weatherSchema);