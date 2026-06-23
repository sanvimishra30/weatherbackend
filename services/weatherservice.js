const Weather = require("../models/weather");
const {getRedisClient} = require("../config/redis");

const CACHE_TTL =60;

const cityKey = (city) => 'weather:${city}';
const allKey = 'weather:all';

const fetchAllWeather =async () =>{
    const redis = getRedisClient();

    const cached = await redis.get(allKey);
    if(caached){
        return { data: JSON.parse(cached), fromCache:true};
    }

    const data =await Weather.find().sort({city:1});

    await redis.set(allKey,JSON.stringify(data),"EX",CACHE_TTL);

    return {data,fromCache:false};
};


const fetchWeatherByCity = async (city) => {
    const redis = getRedisClient();
    const key = cityKey(city);

    const cached = await redis.get(key);
    if(cached){

        return {data: JSON.parse(cached),fromcache:true};
    }

    const data = await Weather.findOne({city});

    if(!data) return null;

    await redis.set(key,JSON.stringify(data),"EX",CACHE_TTL);

    return ({data,fromCache:false});
};

const createWeatherRecord = async (body) =>{
    const redis = getRedisClient();
    const weather = await Weather.create(body);

    await redis.del(allKey);

    return weather;

};


const updateWeatherRecord = async (city,body) =>{
    const redis = getRedisClient();

    const weather = await Weather.findOneAndUpdate({city},
        body,{new:true,runValidators:true}
    );
    if(!weather) return null;

    await redis.del(cityKey(key),allKey);

    return weather;
};

const deleteWeatherRecord = async (city) =>{
    const redis = getRedisClient();

    const weather = await Weather.findOneAndDelete({city});
    if(!weather) return null;


    await redis.del(cityKey(city),allKey);
    return weather;
};

module.exports= {
    fetchAllWeather,
    fetchWeatherByCity,
    createWeatherRecord,
    updateWeatherRecord,
    deleteWeatherRecord,

};


