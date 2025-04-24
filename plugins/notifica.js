import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys';
import * as fs from 'fs';

const handler = async (m, { conn, text, participants, isOwner, isAdmin }) => {
  try {
    const users = participants.map((u) => conn.decodeJid(u.id));
    const watermark = '\nㅤㅤㅤㅤㅤㅤㅤㅤㅤᴱˡᶦᵗᵉᴮᵒᵗᴳˡᵒᵇᵃˡ';

    const q = m.quoted ? m.quoted : m || m.text || m.sender;
    const c = m.quoted ? await m.getQuotedObj() : m.msg || m.text || m.sender;

    const msg = {
      templateMessage: {
        hydratedTemplate: {
          hydratedContentText: (text || q.text || '') + watermark,
          mentions: users,
          hydratedButtons: [
            {
              quickReplyButton: {
                displayText: 'MENCIÓN 👤',
                id: '.notifica'
              }
            },
            {
              quickReplyButton: {
                displayText: 'RECORDATORIO 📝',
                id: '.notifica'
              }
            }
          ]
        }
      }
    };

    await conn.relayMessage(m.chat, msg, { messageId: m.key.id });
  } catch {
    const users = participants.map((u) => conn.decodeJid(u.id));
    const quoted = m.quoted ? m.quoted : m;
    const mime = (quoted.msg || quoted).mimetype || '';
    const isMedia = /image|video|sticker|audio/.test(mime);
    const watermark = '\n©𝖤𝗅𝗂𝗍𝖾𝖡𝗈𝗍𝖦𝗅𝗈𝖻𝖺𝗅';

    if (isMedia) {
      const mediax = await quoted.download?.();
      const options = { mentions: users, quoted: m };

      if (quoted.mtype === 'imageMessage') {
        conn.sendMessage(m.chat, { image: mediax, caption: (text || '') + watermark, ...options });
      } else if (quoted.mtype === 'videoMessage') {
        conn.sendMessage(m.chat, { video: mediax, caption: (text || '') + watermark, mimetype: 'video/mp4', ...options });
      } else if (quoted.mtype === 'audioMessage') {
        conn.sendMessage(m.chat, { audio: mediax, caption: watermark, mimetype: 'audio/mpeg', fileName: `Hidetag.mp3`, ...options });
      } else if (quoted.mtype === 'stickerMessage') {
        conn.sendMessage(m.chat, { sticker: mediax, ...options });
      }
    } else {
      const more = String.fromCharCode(8206);
      const masss = more.repeat(850) + watermark;

      const msg = {
        templateMessage: {
          hydratedTemplate: {
            hydratedContentText: masss,
            mentions: users,
            hydratedButtons: [
              {
                quickReplyButton: {
                  displayText: 'MENCIÓN 👤',
                  id: '.notifica'
                }
              },
              {
                quickReplyButton: {
                  displayText: 'RECORDATORIO 📝',
                  id: '.notifica'
                }
              }
            ],
            hydratedFooterText: 'EliteBotGlobal'
          }
        }
      };

      await conn.relayMessage(m.chat, msg, {});
    }
  }
};

handler.help = ['hidetag'];
handler.tags = ['group'];
handler.command = /^(notifica)$/i;
handler.group = true;
handler.admin = true;

export default handler;
