const mongoose = require ("mongoose");

const connectDB=async()=>{
    try {
        console.log(process.env.MONGO_URI);//
        await mongoose.connect(
            process.env.MONGO_URI
        );
        console.log("mongod connected");

    }
    catch(error)
    {
        console.log(error.message);
        process.exit(1);// this line ensures that if there is an error connecting to the database, the application will exit with a non-zero status code, indicating that it failed to start properly.
    }
}

module.exports = connectDB;
