const mongoose = require("mongoose");

const weatherSchema = new mongoose.Schema({
  city:{//this field  here is used as a unique identifier for each weather record in the database. It is required, must be a string, and will be stored in lowercase to ensure consistency.
    type:String ,
    required:[true,"city is required"],
    unique:true,
    trim:true,
    lowercase:true,
  },
  displayName:{// this field is used to store a more user-friendly name for the city, which can be displayed in the UI. It is required, must be a string, and will be trimmed to remove any leading or trailing whitespace.
    type:String,
    required:true,
    trim :true,
  },
  temperature:{
    type: Number,
    required:true,
  },
  unit:{// this field is optional, and if not provided, it will default to "celsius"
    type:String,
    default:"celsius",
  },
  condition:{// this field is used to store a brief description of the current weather condition in the city (e.g., "sunny", "cloudy", "rainy"). It is required and must be a string.
    type:String,
    required:true,
  },
  humidity:{
    type:Number,
    min:0,
    max:100,
  },
  wind_speed:{
    type:Number,
    min:0,

  },
  source: {
      type:    String,
      enum:    ["manual", "openweathermap"],
      default: "manual",
    },
  expiresAt: {
  type: Date,
  default: null,
  },
  

},
{
  optimisticConcurrency: true,
},
{
timestamps:true,
},

);


module.exports=mongoose.model('Weather',weatherSchema);//here we are creating a Mongoose model named "Weather" based on the defined weatherSchema. This model will be used to interact with the "weathers" collection in the MongoDB database, allowing us to perform CRUD operations on weather records.