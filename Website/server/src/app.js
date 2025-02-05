import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import logger from './config/logger.config.js';
import responseHandler from './middleware/responseHandler.middleware.js';
import requestLogger from './middleware/requestLogger.middleware.js';

const app = express();

dotenv.config({ path: './.env' });

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// ======================Middleware=================
app.use(requestLogger)
app.use(responseHandler)


app.use((req, res, next) => {
    logger.info(`Request Method: ${req.method} - Request URL: ${req.url}`.blue);
    next();
});

// ======================Routes=================
import authRoute from './routes/auth.routes.js'
import queryRoute from './routes/query.routes.js'
import userRoutes from  './routes/user.routes.js'
import lawyerRoutes from './routes/lawyer.routes.js'

app.use('/api/v1',authRoute)
app.use('/api/v1',queryRoute)
app.use('/api/v1',userRoutes)
app.use('/api/v1',lawyerRoutes)

export { app };
