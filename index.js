const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = process.env.TELEGRAM_TOKEN;
const lovableUrl = process.env.LOVABLE_URL;

const bot = new TelegramBot(token, { polling: true });

bot.on('message', async (msg) => {
  const userMessage = msg.text;
  const chatId = msg.chat.id;

  try {
    if (userMessage.toLowerCase().includes('crie') || 
        userMessage.toLowerCase().includes('site')) {
      
      bot.sendMessage(chatId, '⏳ Gerando site...');

      // Envia descrição COMPLETA para Lovable
      const prompt = `Gere um HTML COMPLETO para: ${userMessage}

Retorne APENAS código HTML com <!DOCTYPE>, <html>, <head>, <body>, <style>, <script>.
Sem explicações. Código pronto para funcionar.`;

      const response = await axios.post(lovableUrl, 
        { message: prompt },
        { headers: { 'Content-Type': 'application/json' }, timeout: 30000 }
      );

      const reply = response.data.response;

      if (reply && reply.includes('<!DOCTYPE')) {
        bot.sendMessage(chatId, '✅ Pronto!\n\nAbra: https://codepen.io/pen/\nCole em "HTML"');
        bot.sendMessage(chatId, `\`\`\`html\n${reply.substring(0, 4000)}\n\`\`\``);
      } else {
        bot.sendMessage(chatId, '❌ Tente novamente');
      }

    } else {
      bot.sendMessage(chatId, '✨ Diga: Crie um site de pizza');
    }

  } catch (error) {
    bot.sendMessage(chatId, '❌ Erro');
  }
});

console.log('✅ Bot iniciado!');
