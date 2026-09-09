const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = process.env.TELEGRAM_TOKEN;
const lovableUrl = process.env.LOVABLE_URL;

const bot = new TelegramBot(token, { polling: true });

bot.on('message', async (msg) => {
  const userMessage = msg.text;
  const chatId = msg.chat.id;

  console.log(`📨 Mensagem: "${userMessage}"`);
  bot.sendChatAction(chatId, 'typing');

  try {
    // Envia DIRETO para Lovable
    const response = await axios.post(
      lovableUrl,
      { message: userMessage },
      { 
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
      }
    );

    const reply = response.data.response;
    
    if (reply) {
      bot.sendMessage(chatId, reply);
    } else {
      bot.sendMessage(chatId, 'Sem resposta');
    }

  } catch (error) {
    console.error('Erro:', error.message);
    bot.sendMessage(chatId, '❌ Erro ao conectar');
  }
});

console.log('✅ Bot iniciado!');
