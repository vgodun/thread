import * as mongoose from "mongoose";

let isConnected=false;

export const connectToDB = async () => {
    mongoose.set('strictQuery', true);
    
    if (!process.env.MONGODB_URL) {
        throw new Error('MONGODB_URL not found in environment variables');
    }

    if (isConnected) {
        console.log('Already connected to MongoDB');
        return;
    }
    
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        isConnected = true;
        console.log('Successfully connected to MongoDB');
    } catch (error: any) {
        console.error('MongoDB connection error:', error.message);
        throw new Error(`Failed to connect to MongoDB: ${error.message}`);
    }
}