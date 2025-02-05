import logger from '../config/logger.config.js';

const requestLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info(`${req.method} ${req.originalUrl} - ${duration}ms`.blue);
    });
    next();
};

export default requestLogger;
