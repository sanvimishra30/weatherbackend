const mongoose = require ("mongoose");
const logger   = require("../utils/logger");

const connectDB=async()=>{
    try {
        await mongoose.connect(
            process.env.MONGO_URI,
            {
                maxPoolSize:10,
                minPoolSize:2,
                serverSelectionTimeoutMS:5000,
                socketTimeoutMS:45000,
            }
        );
        
        logger.info("MongoDB connected");


        mongoose.connection.on("disconnected", () => {
            logger.warn("MongoDB disconnected");
            });
        
            mongoose.connection.on("reconnected", () => {
                logger.info("MongoDB reconnected");
            });
        
            mongoose.connection.on("error", (err) => {
                logger.error(`MongoDB error: ${err.message}`);
            });

    }


    catch(error)
    {
        logger.error(`MongoDB connection failed: ${error.message}`);
        process.exit(1);// this line ensures that if there is an error connecting to the database, the application will exit with a non-zero status code, indicating that it failed to start properly.
    }
}

module.exports = connectDB;
