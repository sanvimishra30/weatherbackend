const weatherHistory = require("../models/WeatherHistory");
const Weather                = require("../models/weather");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const logger                 = require("../utils/logger");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-12.5-flash" });

const fetchHistory = async (city) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const history = await weatherHistory.find({
    city,
    recordedAt: { $gte: sevenDaysAgo },
    }).sort({ recordedAt: 1 });
    return history;
};

const formatHistoryForPrompt = (history) => {
    return history.map((record) => {
    const date = new Date(record.recordedAt).toLocaleString();
    return `${date} - Temp: ${record.temperature}°C, Humidity: ${record.humidity || "N/A"}%, Wind: ${record.wind_speed || "N/A"} km/h, Condition: ${record.condition}`;
    }).join("\n");
};

const detectAnomaly = async (city) => {
    const currentWeather = await Weather.findOne({ city });
    if (!currentWeather) return null;

    const history = await fetchHistory(city);

    if (history.length < 3) {
        return {
        city:             currentWeather.displayName,
        anomalyDetected:  false,
        severity:         "none",
        readingsAnalysed: history.length,
        report: {
        summary:        "Not enough historical data",
        details:        `Only ${history.length} reading(s) available. Need at least 3 readings over time to detect anomalies. Keep using the API and check back later.`,
        recommendation: "Continue fetching weather data for this city to build up history.",
        },
    };
}
const formattedHistory = formatHistoryForPrompt(history);

const prompt = `You are a weather anomaly detection expert. Analyse the following weather data for ${currentWeather.displayName} and detect any anomalies or unusual patterns.

WEATHER HISTORY (last 7 days):
${formattedHistory}

CURRENT WEATHER:
Temperature: ${currentWeather.temperature}°C
Humidity: ${currentWeather.humidity || "N/A"}%
Wind Speed: ${currentWeather.wind_speed || "N/A"} km/h
Condition: ${currentWeather.condition}

INSTRUCTIONS:
1. Compare current weather against the historical pattern
2. Look for: sudden temperature spikes or drops, unusual humidity changes, extreme wind speeds, unusual conditions
3. Consider what is normal variation vs what is genuinely anomalous
4. Provide severity: "none", "low", "medium", or "high"

Respond ONLY with a valid JSON object in this exact format (no markdown, no backticks):
{
    "anomalyDetected": true or false,
    "severity": "none" or "low" or "medium" or "high",
    "report": {
    "summary": "one sentence summary",
    "details": "detailed explanation of what you found",
    "anomalies": ["list", "of", "specific", "anomalies", "found"],
    "possibleCauses": ["list", "of", "possible", "causes"],
    "recommendation": "what action to take"
    }
}`;

try {
    logger.info(`Sending anomaly analysis request to Gemini for: ${city}`);

    const result   = await model.generateContent(prompt);
    const response = result.response.text();

    logger.info(`Gemini anomaly response received for: ${city}`);

    const cleanResponse = response
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    const parsedReport = JSON.parse(cleanResponse);

    return {
            city:             currentWeather.displayName,
            currentWeather: {
            temperature: currentWeather.temperature,
            humidity:    currentWeather.humidity,
            wind_speed:  currentWeather.wind_speed,
            condition:   currentWeather.condition,
            },
            readingsAnalysed: history.length,
            periodAnalysed:   "Last 7 days",
            anomalyDetected:  parsedReport.anomalyDetected,
            severity:         parsedReport.severity,
            report:           parsedReport.report,
        };
        
        } catch (error) {
        logger.error(`Gemini anomaly detection error: ${error.message}`);
        throw new Error("Anomaly detection service is currently unavailable");
        }
    };

    module.exports = { detectAnomaly };