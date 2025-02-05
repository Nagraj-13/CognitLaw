import logger from '../config/logger.config.js';

const responseHandler = (req, res, next) => {

    res.success = (data, message = 'Request was successful', statusCode = 200) => {
        res.status(statusCode).json({
            success: true,
            message,
            data,
        });
        logger.info(`Success response sent with status ${statusCode}: ${message}`.green);
    };
    res.error = (message, statusCode = 400) => {
        res.status(statusCode).json({
            success: false,
            message,
        });
        logger.error(`Error response sent with status ${statusCode}: ${message}`.red);
    };

    next();
};

export default responseHandler;
