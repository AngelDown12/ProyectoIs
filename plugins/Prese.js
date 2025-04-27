let handler = m => m;

handler.before = async function (m, { conn, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return;
  if (m.messageStubType !== 20) return; // 20 = Creación de grupo

  let subject = groupMetadata.subject || "el grupo";
  let botName = conn.user.name; // Obtiene el nombre de la cuenta del bot
  let imageUrl = 'https://qu.ax/nxskN.jpg'; // Aquí pones el enlace de la imagen

  let welcomeBot = `🥇 ¡𝗛𝗢𝗟𝗔 𝗚𝗥𝗨𝗣𝗢!🥇
  
  ¡Soy ${botName}, su nuevo asistente digital!
  
  ━━━━━━━━━━━━━━━━━━━
  ⚡ *Mis funciones :*
  ▸ Descargar música/videos
  ▸ Búsquedas en Google
  ▸ Juegos y diversión
  ▸ Generar imágenes con IA
  ▸ Herramientas para Free Fire
  ━━━━━━━━━━━━━━━━━━━
  📂 *Mis menús:*
  ▸ .menu → *Menú general*
  ▸ .menuimg → *Imágenes AI*
  ▸ .menuhot → *Contenido hot*
  ▸ .menuaudios→ *Efectos*
  ▸ .menujuegos → *Juegos grupal*
  ▸ .menufreefire → *Free Fire tools*
  ━━━━━━━━━━━━━━━━━━━
  ©EliteBotGlobal 2023`;

  // Botones adicionales
  const buttons = [
    {
      buttonId: `.menu`,
      buttonText: { displayText: 'Hola' },
      type: 1,
    }
  ];

  // Enviar la imagen junto con el texto y los botones
  await conn.sendMessage(m.chat, {
    image: { url: imageUrl },
    caption: welcomeBot,
    buttons,
    footer: "EliteBotGlobal | © 2023",
    viewOnce: true,
  }, { quoted: m });
};

export default handler;
