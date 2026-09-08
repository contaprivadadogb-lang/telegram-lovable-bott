const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const crypto = require('crypto');

const token = process.env.TELEGRAM_TOKEN;
const lovableUrl = process.env.LOVABLE_URL;

const bot = new TelegramBot(token, { polling: true });

// Lista de sites criados
const criadosSites = {};

bot.on('message', async (msg) => {
  const userMessage = msg.text;
  const chatId = msg.chat.id;

  console.log(`📨 Mensagem: "${userMessage}"`);
  bot.sendChatAction(chatId, 'typing');

  try {
    // Se pedir para criar site
    if (userMessage.toLowerCase().includes('crie') || userMessage.toLowerCase().includes('criar')) {
      
      bot.sendMessage(chatId, '⏳ Gerando site... Aguarde...');
      
      // Envia para Lovable
      const response = await axios.post(
        lovableUrl,
        { 
          message: `Gere um HTML + CSS + JavaScript completo e funcional para: ${userMessage}. 
          Retorne APENAS o código HTML completo, pronto para abrir no navegador. 
          Inclua todo CSS dentro de <style> e todo JS dentro de <script>.` 
        },
        { 
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
      );

      const htmlCode = response.data.response;
      
      if (htmlCode && htmlCode.length > 50) {
        const projectId = crypto.randomBytes(6).toString('hex');
        criadosSites[projectId] = htmlCode;
        
        const siteLink = `Seu site foi criado!\n\n📋 Para ver o site:\n1. Abra este código em um editor online: https://codepen.io/\n2. Cole o código HTML/CSS/JS\n\nOu use este template grátis:\nhttps://replit.com/@seu-usuario/website-${projectId}`;
        
        bot.sendMessage(chatId, siteLink);
        
      } else {
        bot.sendMessage(chatId, '❌ Erro ao gerar. Tente descrever melhor o que quer.');
      }
      
    } else {
      // Responde normalmente
      const response = await axios.post(
        lovableUrl,
        { message: userMessage },
        { 
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        }
      );

      const reply = response.data.response || 'Sem resposta';
      bot.sendMessage(chatId, reply);
    }

  } catch (error) {
    console.error(`❌ ERRO:`, error.message);
    bot.sendMessage(chatId, '❌ Erro. Tente novamente.');
  }
});

console.log('✅ Bot iniciado!');
