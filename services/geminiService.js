const { GoogleGenerativeAI } = require("@google/generative-ai");
const logger = require("../utils/logger");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({model:"gemini-2.5-flash"});

const sendToGemini = async(history,userMessage,weatherContext=null) =>{
    try{
        let systemContext = `You are a helpful weather assistant for a weather API application.
        You help users understand weather conditions, give advice based on weather,
        and answer weather related questions. Be concise and helpful.`;

        if (weatherContext) {
    systemContext += `\n\nCurrent weather data from our database:
City: ${weatherContext.displayName}
Temperature: ${weatherContext.temperature}°${weatherContext.unit === "Celsius" ? "C" : "F"}
Condition: ${weatherContext.condition}
Humidity: ${weatherContext.humidity || "N/A"}%
Wind Speed: ${weatherContext.wind_speed || "N/A"} km/h
Use this real data to answer the user's question accurately.`;
        }

        const chat = model.startChat({
history: [
        {
        role:  "user",
        parts: [{ text: systemContext }],
        },
        {
        role:  "model",
        parts: [{ text: "I understand. I am a weather assistant with access to real weather data. How can I help you?" }],
        },
        ...history,


],
});

    const response = await chat.sendMessage(userMessage);
    const text     = response.response.text();

    return text;
    }
    catch (error) {
        logger.error(`Gemini API error: ${error.message}`);
        throw new Error("AI service is currently unavailable");
        }
    
};

module.exports = {sendToGemini};