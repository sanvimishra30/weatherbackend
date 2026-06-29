const mongoose = require ("mongoose");
const logger   = require("../utils/logger");

const connectDB=async()=>{
    try {
        await mongoose.connect(
            process.env.MONGO_URI
        );
        
        logger.info("MongoDB connected");

    }
    catch(error)
    {
        logger.error(`MongoDB connection failed: ${error.message}`);
        process.exit(1);// this line ensures that if there is an error connecting to the database, the application will exit with a non-zero status code, indicating that it failed to start properly.
    }
}

module.exports = connectDB;
