const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = process.env.TELEGRAM_TOKEN;
const lovableUrl = process.env.LOVABLE_URL;

const bot = new TelegramBot(token, { polling: true });

// Armazena sites gerados
const sitesGerados = {};

bot.on('message', async (msg) => {
  const userMessage = msg.text;
  const chatId = msg.chat.id;

  console.log(`📨 Mensagem: "${userMessage}"`);

  try {
    // Detecta se é pedido de site
    if (userMessage.toLowerCase().includes('crie') || 
        userMessage.toLowerCase().includes('fazer') ||
        userMessage.toLowerCase().includes('gere') ||
        userMessage.toLowerCase().includes('site')) {
      
      bot.sendMessage(chatId, '⏳ Gerando seu site... Aguarde 20-30 segundos...');
      bot.sendChatAction(chatId, 'typing');

      // Envia para Lovable com prompt específico
      const promptSite = `Você é um gerador de websites profissionais. 
      
O usuário pediu: "${userMessage}"

Gere um HTML + CSS + JavaScript COMPLETO e FUNCIONAL que atenda exatamente o que foi pedido.

REGRAS IMPORTANTES:
1. Retorne APENAS o código HTML (sem explicações)
2. Inclua CSS dentro de <style>
3. Inclua JavaScript dentro de <script>
4. HTML deve ser semanticamente correto
5. Design moderno e responsivo
6. Cores profissionais
7. Pronto para produção

COMECE DIRETAMENTE COM <!DOCTYPE html>`;

      try {
        const response = await axios.post(
          lovableUrl,
          { message: promptSite },
          { 
            headers: { 'Content-Type': 'application/json' },
            timeout: 45000
          }
        );

        const htmlCode = response.data.response;

        if (htmlCode && htmlCode.length > 100 && htmlCode.includes('<!DOCTYPE')) {
          
          bot.sendMessage(chatId, `✅ Site gerado com sucesso!\n\n📋 Como usar:\n\n1️⃣ Copie o código abaixo\n2️⃣ Abra: https://codepen.io/pen/\n3️⃣ Cole em "HTML"\n4️⃣ Veja funcionando!\n\nOu salve como "index.html" e abra no navegador.`);
          
          // Envia o código em partes (Telegram tem limite)
          const codigoParte1 = htmlCode.substring(0, 4000);
          const codigoParte2 = htmlCode.substring(4000, 8000);
          const codigoParte3 = htmlCode.substring(8000);

          bot.sendMessage(chatId, `\`\`\`html\n${codigoParte1}\n\`\`\``);
          
          if (codigoParte2.length > 0) {
            await new Promise(resolve => setTimeout(resolve, 500));
            bot.sendMessage(chatId, `\`\`\`html\n${codigoParte2}\n\`\`\``);
          }
          
          if (codigoParte3.length > 0) {
            await new Promise(resolve => setTimeout(resolve, 500));
            bot.sendMessage(chatId, `\`\`\`html\n${codigoParte3}\n\`\`\``);
          }

          bot.sendMessage(chatId, `\n🔗 Links Úteis:\n👉 CodePen: https://codepen.io/\n👉 Netlify Drop: https://app.netlify.com/drop`);

        } else {
          bot.sendMessage(chatId, '⚠️ Não consegui gerar um site válido. Tente ser mais específico!\n\nExemplo: "Crie um site de pizza com menu e galeria de fotos"');
        }

      } catch (lovableError) {
        console.error('Erro ao chamar Lovable:', lovableError.message);
        bot.sendMessage(chatId, '❌ Erro ao conectar com Lovable. Tente novamente.');
      }

    } else {
      // Mensagem normal (não é site)
      bot.sendMessage(chatId, `👋 Olá!\n\nEu sou um gerador de websites grátis!\n\nDigite qualquer um dos comandos:\n\n✨ "Crie um site de pizzaria"\n✨ "Fazer site de portfólio"\n✨ "Site de consultório médico"\n✨ "Gere um blog de receitas"\n\nQualquer tipo de site! 🚀`);
    }

  } catch (error) {
    console.error('Erro geral:', error.message);
    bot.sendMessage(chatId, '❌ Erro ao processar. Tente novamente.');
  }
});

console.log('✅ Bot gerador de sites iniciado!');
