const express = require('express');
const { authorizedClient } = require('../../middleware/authClient');
const { chat, kiloChat, geminiChat, crawlSite } = require('../../controller/chat/chat');

const router = express.Router()


router.post('/client/chat',chat)
router.post('/client/gemini/chat',geminiChat)
router.post('/client/kilo/chat',kiloChat)
router.post('/client/scrap/site',crawlSite)

module.exports=router