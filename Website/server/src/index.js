import mongoose from 'mongoose';
import { app } from './app.js';
import { connectDB } from  './config/database.config.js';
import logger from './config/logger.config.js';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`.green);
        });
    } catch (error) {
        logger.error('Error starting the server'.red);
        console.error(error);
    }
};

startServer();
