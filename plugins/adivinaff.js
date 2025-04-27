import fetch from 'node-fetch';

const handler = async (m, { conn, usedPrefix, command }) => {
  conn.tebakff = conn.tebakff || {};
  
  if (conn.tebakff[m.sender]) {
    clearTimeout(conn.tebakff[m.sender].timeout);
    delete conn.tebakff[m.sender];
  }

  try {
    const res = await fetch('https://api.vreden.my.id/api/tebakff');
    if (!res.ok) throw new Error('API no responde');
    const json = await res.json();
    const { jawaban, img } = json.result;

    conn.tebakff[m.sender] = {
      jawaban: jawaban.toLowerCase(),
      timeout: setTimeout(async () => {
        await conn.sendMessage(m.chat, {
          text: `⏰ ¡Tiempo agotado!\nLa respuesta era: *${jawaban}*`,
          footer: '*The Teddies 🐻🔥*',
          buttons: [
            { buttonId: `${usedPrefix}${command}`, buttonText: { displayText: "🔁 Intentar otro" }, type: 1 }
          ]
        }, { quoted: m });
        delete conn.tebakff[m.sender];
      }, 30000)
    };

    const buttonMessage = {
      image: { url: img },
      caption: `✨ *Adivina el personaje de Free Fire* ✨

Estás viendo a un personaje super conocido...
¿Pero, cuál es su nombre?

⏳ Tienes *30 segundos* para responder.
Escribe tu respuesta en el chat.`,
      footer: "*The Teddies 🐻🔥*",
      buttons: [
        { buttonId: `${usedPrefix}${command}`, buttonText: { displayText: "🔁 Intentar otro" }, type: 1 }
      ],
      headerType: 4,
      viewOnce: true
    };

    await conn.sendMessage(m.chat, buttonMessage, { quoted: m });

  } catch (e) {
    console.error('Error en tebakff:', e);
    await conn.sendMessage(m.chat, {
      text: "❌ Error al cargar el personaje. Intenta nuevamente más tarde.",
    }, { quoted: m });
  }
};

handler.before = async (m, { conn, usedPrefix, command }) => {
  conn.tebakff = conn.tebakff || {};

  // Si el mensaje viene de botón "Intentar otro", ejecutar comando directamente
  if (m.buttonId === `${usedPrefix}${command}`) {
    return handler(m, { conn, usedPrefix, command });
  }

  // Ignorar mensajes que empiezan por prefijo
  if (m.text.startsWith(usedPrefix)) return;

  if (conn.tebakff[m.sender]) {
    const { jawaban, timeout } = conn.tebakff[m.sender];

    if (m.text.toLowerCase().trim() === jawaban) {
      clearTimeout(timeout);
      delete conn.tebakff[m.sender];
      await conn.sendMessage(m.chat, {
        text: "✅ *¡Correcto!* ¡Muy bien crack!",
        footer: "*The Teddies 🐻🔥*",
        buttons: [
          { buttonId: `${usedPrefix}${command}`, buttonText: { displayText: "🔁 Intentar otro" }, type: 1 }
        ]
      }, { quoted: m });
    } else {
      await conn.sendMessage(m.chat, {
        text: "❌ Incorrecto, sigue intentando...",
        quoted: m
      });
    }
  }
};

handler.help = ["tebakff"];
handler.tags = ["juego"];
handler.command = /^(tebakff|adivinaff)$/i;
handler.exp = 20;

export default handler;
