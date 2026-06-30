const {processChat,clearConversation} = require("../services/chatServices");
const logger = require("../utils/logger");


const chat = async (req,res) =>{
    try{
        const{message} = req.body;
        const {sessionId} = req.params;

        if(!message || message.trim() ===""){
            return res.status(400).json({
        success: false,
        message: "Message is required",
        });
        }

        const trimmedMessage = message.trim();

        logger.info(`Chat message received. Session: ${sessionId || "new"}`);

        const result = await processChat(sessionId,trimmedMessage);

        res.status(200).json({
        success: true,
        message: "Response generated",
        data: {
        sessionId:   result.sessionId,
        reply:       result.reply,
        weatherUsed: result.weatherUsed,
        
        },
    });
    }
    catch(err){
        logger.error(`Chat controller error: ${err.message}`);
            res.status(500).json({
            success: false,
            message: err.message || "Chat service failed",
            });
    }
};

const clearChat = async(req,res)=>{
    try{
        const {sessionId} = req.params;

        if (!sessionId) {
        return res.status(400).json({
        success: false,
        message: "Session ID is required",
        });
    }
    await clearConversation(sessionId);
    res.status(200).json({
        success: true,
        message: "Conversation cleared successfully",
    });
    }
    catch(err){
        logger.error(`Clear chat error: ${err.message}`);
            res.status(500).json({
            success: false,
            message: "Failed to clear conversation",
            });
    }
};

module.exports={chat,clearChat};