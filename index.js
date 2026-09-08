const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = process.env.TELEGRAM_TOKEN;
const lovableUrl = process.env.LOVABLE_URL;

console.log(`Token: ${token ? 'OK' : 'FALTANDO'}`);
console.log(`URL Lovable: ${lovableUrl}`);

const bot = new TelegramBot(token, { polling: true });

bot.on('message', async (msg) => {
  const userMessage = msg.text;
  const chatId = msg.chat.id;

  console.log(`📨 Mensagem recebida: "${userMessage}"`);
  bot.sendChatAction(chatId, 'typing');

  try {
    console.log(`🔄 Enviando para Lovable: ${lovableUrl}`);
    
    const response = await axios.post(
      lovableUrl,
      { message: userMessage },
      { 
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      }
    );

    console.log(`✅ Resposta:`, response.data);
    
    const reply = response.data.response || 'Sem resposta';
    bot.sendMessage(chatId, reply);

  } catch (error) {
    console.error(`❌ ERRO:`, error.message);
    bot.sendMessage(chatId, '❌ Erro ao conectar Lovable.');
  }
});

console.log('✅ Bot iniciado!');
