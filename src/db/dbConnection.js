const mongoose = require('mongoose');

exports.connectDB = async () => {
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}${process.env.DB_NAME}`);
        console.log('MongoDB Connected!!!');
    }catch (error) {
        console.log("MongoDB connection error:", error);
        process.exit(1);
    }
};