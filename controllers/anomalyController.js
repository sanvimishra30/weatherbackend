const { detectAnomaly } = require("../services/anomalyservice");
const logger            = require("../utils/logger");


const getAnomaly = async (req, res) => {
    try {
    const city = req.params.city.toLowerCase();

    logger.info(`Anomaly detection requested for: ${city}`);

    const result = await detectAnomaly(city);

    
    if (!result) {
        return res.status(404).json({
        success: false,
        message: `No weather data found for "${req.params.city}". Fetch weather for this city first.`,
        });
    }

    // return the full anomaly report
    res.status(200).json({
        success: true,
        message: `Anomaly analysis complete for "${req.params.city}"`,
        data:    result,
    });

    } catch (error) {
    logger.error(`Anomaly controller error: ${error.message}`);
    res.status(500).json({
        success: false,
        message: error.message || "Anomaly detection failed",
    });
    }
};


module.exports = { getAnomaly };
