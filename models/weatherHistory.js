const mongoose = require("mongoose");

const weatherHistorySchema = new mongoose.Schema(
{
    city:{
        type:String,
        required:true,
        trim:true,
        lowercase:true,
        index:true
    },
    displayName:{
        type:String,
        required:true
    },
    temperature:{
        type:Number,
        required:true
    },
    humidity:{
        type:Number,
        default:null
    },
    wind_speed:{
        type:Number,
        default:null
    },
    condition:{
        type:String,
        required:true
    },
    recordedAt:{
        type:Date,
        default:Date.now,
        index:true
    },
    source:{
        type:String,
        enum:["manual","openWeatherMap"],
        default:"manual"
    }
},
{
    versionKey:false,
}
);


weatherHistorySchema.index({city:1,recordedAt:-1});

module.exports=mongoose.model('WeatherHistory',weatherHistorySchema);