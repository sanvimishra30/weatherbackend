const {fetchAllWeather,
    fetchWeatherByCity,
    createWeatherRecord,
    updateWeatherRecord,
    deleteWeatherRecord
}= require("../services/weatherservice");

const {checkValidation} = require("../middleware/weatherValidation");

const getAllWeather = async (req, res) => {
    try{
        const{Data,fromCache} = await fetchAllWeather();
        
        res.status(200).json({
            success:true,
            message:"all weather record fetched",
            fromCache,
            count:Data.length,
            data,
        });

        } catch(error){
            res.status(500).json({
                success:false,
                message:"failed to fetch data",
            });
        }

};


const getWeatherByCity = async (req,res) =>{
    try{
        const city = req.param.city.toLowerCase();
        const result = await fetchWeatherByCity(city);

        if(!result){
            return res.status(404).json({
                success:false,
                message:"no weather data found for ${req.params.city}",

            });

        }
        res.status(200).json({
        success: true,
        message: `Weather for "${req.params.city}"`,
        fromCache: result.fromCache,
        data: result.data,
    });

        
    }
        catch(error){
            res.status(500).json({
                success:false,
                message:"failed to fetch data",
            });

        }
    
};

const createWeather = async(req,res)=>{
    
        const failed = checkValidation(req,res);
        if(failed) return ;

    try{
        const weather = await createWeatherRecord(req,res);
        res.status(201).json({
            success:true,
            message:"Weather record created",
            data:weather,
        });
    }
    catch(error){
        if(error.code === 11000){
            return res.status(409).json({
                success:false,
                message:`A weather record for "${req.body.city}" already exists`,

            });
        }
            res.status(500).json({
                susscess:false,
                mesage:"failed to create weather record",
            });
        
    }
};

const updateWeather = async(req,res)=>{
    const failed = await checkValidation(req,res);

    if(failed) return ;

    try{
        const city = req.param.city.toLowerCase();
        const weather = await updateWeatherRecord(city,req.body);

        if(!weather){
            return res.status(404).json({
        success: false,
        message: `No weather data found for "${req.params.city}"`,
        });

        }
        res.status(200).json({
        success: true,
        message: `Weather record for "${req.params.city}" updated`,
        data: weather,
        });

    }
    catch(error){
        if(error.name === "ValidationError"){
            const messages= Object.values(error.values).map((e)=>e.message);
            return res.status(400).json({
                    success: false,
                    message: messages.join(", "),
            });
        }
        res.status(500).json({
            success: false,
            message: "Failed to update weather record",
        });

    }

};


const deleteWeather = async(req,res)=>{
    try{
        const city    = req.params.city.toLowerCase();
        const weather = await deleteWeatherRecord(city);

        if(!weather){
            return res.status(404).json({
        success: false,
        message: `No weather data found for "${req.params.city}"`,
        });

        }

        res.status(200).json({
        success: true,
        message: `Weather record for "${req.params.city}" deleted`,
    });

    }
    catch(error){
        res.status(500).json({
            success: false,
            message: "Failed to delete weather record"
        });

    }
};


module.exports={
    getAllWeather,
    getWeatherByCity,
    createWeather,
    updateWeather,
    deleteWeather,
}
;