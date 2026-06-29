const morgan = require("morgan");
const logger = require("../utils/logger");

const stream = {
    write: (message) => logger.http(message.trim()),
};

const format = process.env.NODE_ENV === "development" ? "dev" : "combined";

const morganLogger = morgan(format, { stream });


module.exports = morganLogger;