const {createLogger,format,transports} = require("winston");
const path = require("path");

const level = () =>{
    const env = process.env.NODE_ENV || "development";
    return env === "development"? "debug":"warn";
};

const colors = {
    error: "red",
    warn:  "yellow",
    info:  "green",
    http:  "magenta",
    debug: "white",
};

const { addColors } = require("winston");
addColors(colors);

const devFormat = format.combine(
    format.timestamp({ format: "HH:mm:ss" }),
    format.colorize({ all: true }),
    format.printf(
    (info) => `${info.timestamp} [${info.level}] : ${info.message}`

    )
);

const prodFormat = format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
);

const logTransports = [

    new transports.Console({
    format: process.env.NODE_ENV === "development" ? devFormat : prodFormat,
    }),


    new transports.File({
    filename: path.join("logs", "error.log"),
    level:    "error",
    format:   prodFormat,
    }),


    ...(process.env.NODE_ENV === "production"
    ? [new transports.File({
        filename: path.join("logs", "combined.log"),
        format:   prodFormat,
        })]
    : []
    ),
];

const logger = createLogger({
    level:       level(),
    transports:  logTransports,
    exitOnError: false,
});

module.exports= logger;

