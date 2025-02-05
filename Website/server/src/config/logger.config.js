import winston from 'winston';
import 'winston-daily-rotate-file';
import colors from 'colors';

const { combine, timestamp, colorize, printf, simple } = winston.format;

const logFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  colorize(),
  simple(),
  printf(({ timestamp, level, message }) => {
    return `${timestamp} ${level.yellow}: ${message.green}`;
  })
);

const dailyRotateFileTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/app_%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: 'info',
});

const logger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize(),
        simple()
      ),
      level: 'info',
    }),
    dailyRotateFileTransport,
  ],
});

logger.add(new winston.transports.File({
  filename: 'logs/errors.log',
  level: 'error',
}));

export default logger;
