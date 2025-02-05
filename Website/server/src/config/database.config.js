import mongoose from 'mongoose';
import colors from 'colors';
import logger from '../config/logger.config.js';

export const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MongoDB connection URL not defined. Please set the MONGO_URL environment variable.');
        }

        const conn = await mongoose.connect(process.env.MONGO_URI);
        if (!conn) {
            throw new Error('MongoDB connection failed.');
        }

        logger.info(`MongoDB connected: ${conn.connection.host}`.cyan.underline);
        console.log(`MongoDB connected: ${conn.connection.host}`.cyan.underline);
    } catch (error) {
        logger.error('Error in connecting MongoDB:'.red.bold);
        logger.error(error);
        console.error('Error in connecting MongoDB:'.red.bold);
        console.error(error);
    }
};
