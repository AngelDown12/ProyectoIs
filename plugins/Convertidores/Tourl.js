import fetch from "node-fetch";
import crypto from "crypto";
import { FormData, Blob } from "formdata-node";
import { fileTypeFromBuffer } from "file-type";

let handler = async (m, { conn }) => {
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || '';
  if (!mime) return conn.reply(m.chat, `*[❗] Por favor, responde a un archivo válido (imagen, video, etc.).*`, m);
  
  await conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } });
  
  try {
    let media = await q.download();
    let isTele = /image\/(png|jpe?g|gif)|video\/mp4/.test(mime);
    let link = await catbox(media);
    
    let txt = `*乂 C A T B O X - U P L O A D E R 乂*\n\n`;
    txt += `*» Enlace* : ${link}\n`;
    txt += `*» Tamaño* : ${formatBytes(media.length)}\n`;
    txt += `*» Expiración* : ${isTele ? 'No expira' : 'Desconocido'}\n\n`;
    txt += `> *${wm}*`;
    
    await conn.sendMessage(m.chat, {
      text: txt,
      contextInfo: {
        externalAdReply: {
          title: "𝘾𝙧𝙞𝙨𝙩𝙞𝙖𝙣 𝙀𝙡𝙞𝙩𝙚 - Catbox Uploader",
          body: "¡Subida exitosa!",
          thumbnailUrl: gataMenu,
          mediaType: 1,
          renderLargerThumbnail: true,
          showAdAttribution: true,
          sourceUrl: accountsgb
        }
      }
    }, { quoted: m });
    
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (error) {
    console.error("Error:", error);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    await conn.sendMessage(m.chat, {
      text: `*[❌] Error al procesar tu solicitud:*\n${error.message || "Error desconocido"}`
    });
  }
};

handler.help = ['tourl'];
handler.tags = ['herramientas'];
handler.command = ['catbox', 'tourl'];
export default handler;

function formatBytes(bytes) {
  if (bytes === 0) {
    return '0 B';
  }
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
}

async function catbox(content) {
  const { ext, mime } = (await fileTypeFromBuffer(content)) || {};
  const blob = new Blob([content.toArrayBuffer()], { type: mime });
  const formData = new FormData();
  const randomBytes = crypto.randomBytes(5).toString("hex");
  formData.append("reqtype", "fileupload");
  formData.append("fileToUpload", blob, randomBytes + "." + ext);

  const response = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: formData,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36",
    },
  });

  return await response.text();
}
