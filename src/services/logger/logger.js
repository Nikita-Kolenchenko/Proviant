import winston from "winston";

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message }) => {
    return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
  }),
);

const logger = winston.createLogger({
  format: logFormat,
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),

    new winston.transports.File({
      filename: "logs/admin-actions.log",
      level: "info",
    }),
  ],
});

export default logger;
