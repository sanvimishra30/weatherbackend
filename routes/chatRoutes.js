const express    = require("express");
const router     = express.Router();
const { chat, clearChat } = require("../controllers/chatController");

router.post('/',chat);

router.post("/:sessionId", chat);

router.delete("/:sessionId", clearChat);

module.exports = router;