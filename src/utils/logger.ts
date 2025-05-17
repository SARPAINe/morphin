import { createLogger, format, transports } from "winston";

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "error.log", level: "error" }),
    new transports.File({ filename: "combined.log" }),
  ],
});

export const logInfo = (message: string, meta: Record<string, any> = {}) => {
  logger.info(message, meta);
};

export const logError = (message: string, meta: Record<string, any> = {}) => {
  logger.error(message, meta);
};

export const logWarning = (message: string, meta: Record<string, any> = {}) => {
  logger.warn(message, meta);
};

export default logger;
