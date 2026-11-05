// Vercel Node.js function. Private code and secrets stay outside src/.
const { createChatHandler } = require('../server/chat-handler.cjs');
module.exports = createChatHandler();
