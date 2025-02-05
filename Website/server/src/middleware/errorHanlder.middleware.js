import logger from '../config/logger.config.js';

const errorHandler = (err, req, res, next) => {
    logger.error('Unhandled error:'.red.bold);
    logger.error(err);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        message,
    });

};

export default errorHandler;
