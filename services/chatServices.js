const { v4: uuidv4 }   = require("uuid");
const { getRedisClient } = require("../config/redis");
const { sendToGemini }   = require("./geminiService");
const Weather            = require("../models/weather");
const logger             = require("../utils/logger");

const SESSION_TTL = 60 * 60;

const sessionKey = (sessionId) =>`chat:${sessionId}`;

const generateSessionId = () => uuidv4();

const loadHistory = async(sessionId)=>{
    try{
        const redis = getRedisClient();
        if(!redis) return [];

        const stored = await redis.get(sessionKey(sessionId));
        return stored ? JSON.parse(stored):[];
    }
    catch(err){
        logger.error(`load history error :${err.message}`);
        return [];
    }
};

const saveHistory = async(sessionId,history) =>{
    try{
        const redis = getRedisClient();
        if(!redis) return ;

        await redis.set(
            sessionKey(sessionId),
            JSON.stringify(history),
            "EX",
            SESSION_TTL
        );
        logger.info(`Saving history:\n${JSON.stringify(history, null, 2)}`);
    }
    catch(err){
        logger.error(`save history error :${err.message}`);
    }
};

const detectCityAndFetchWeather = async(message) =>{
    try{
        const lowerMessage = message.toLowerCase();

        const allWeather = await Weather.find({},{city:1,_id:0});

        for (const record of allWeather){
            if(lowerMessage.includes(record.city)){
                const weather = await Weather.findOne({city:record.city});
                logger.info(`city detected in the chat: ${record.city}`);
                return weather;
            }
        }
        return null;
    }
    catch(err){
        logger.error(`city detection error : ${err.message}`);
        return null;
    }
};

const processChat = async(sessionId,userMessage) =>{

    const currentSessionId = sessionId || generateSessionId();

    const history = await loadHistory(currentSessionId);

    const weatherContext = await detectCityAndFetchWeather(userMessage);

    logger.info(`History sent to Gemini: ${JSON.stringify(history, null, 2)}`);

    const reply = await sendToGemini(history,userMessage, weatherContext);

    const updatedHistory = [
    ...history,
    {
        role:  "user",
        parts: [{ text: userMessage }],
    },
    {
        role:  "model",
        parts: [{ text: reply }],
    },
    ];

    await saveHistory(currentSessionId,updatedHistory);

    return{
        sessionId:currentSessionId,
        reply,
        weatherUsed:weatherContext? weatherContext.displayname:null,
    };

};

const clearConversation = async(sessionId)=>{
    try{
    const redis = getRedisClient();
    if(!redis) return null;

    await redis.del(sessionKey(sessionId));
    logger.info(`chat history  deleted for:  ${sessionId}`);
    }
    catch(err){
        logger.error(`clear conversation error :  ${err.message}`);

    }


};

module.exports={processChat,clearConversation};

