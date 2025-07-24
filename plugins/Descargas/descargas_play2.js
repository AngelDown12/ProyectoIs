import fetch from 'node-fetch';
import yts from 'yt-search';
import { youtubedl, youtubedlv2 } from '@bochilteam/scraper';
import ytdl from 'ytdl-core';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(m.chat, `*[❗] Por favor, ingresa el nombre del video que deseas descargar.*\n\n*Ejemplo:*\n${usedPrefix + command} Bad Bunny - Monaco`, m);
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } });

    const search = await yts(text);
    if (!search.videos || search.videos.length === 0) {
      return m.reply('*[❗] No se encontraron resultados para tu búsqueda.*');
    }

    const video = search.videos[0];
    const { title, thumbnail, timestamp, views, ago, url, author } = video;

    const infoMessage = `「✦」Descargando *<${title}>*\n\n> ✦ Canal » *${author.name}*\n> ✰ Vistas » *${views}*\n> ⴵ Duración » *${timestamp}*\n> ✐ Publicación » *${ago}*\n> 🜸 Link » ${url}`;

    try {
      // Intento 1: Usar ytdl-core
      try {
        const info = await ytdl.getInfo(url);
        const format = ytdl.chooseFormat(info.formats, { quality: '18' });
        await conn.sendMessage(m.chat, {
          video: { url: format.url },
          fileName: `${title}.mp4`,
          mimetype: 'video/mp4',
          caption: infoMessage,
          contextInfo: {
            externalAdReply: {
              title: title,
              body: "𝘾𝙧𝙞𝙨𝙩𝙞𝙖𝙣 𝙀𝙡𝙞𝙩𝙚 - YouTube Video",
              thumbnailUrl: thumbnail,
              mediaType: 1,
              renderLargerThumbnail: true,
              showAdAttribution: true,
              sourceUrl: url
            }
          }
        }, { quoted: m });
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
        return;
      } catch (e) {
        console.log('Error con ytdl-core:', e);
      }

      // Intento 2: Usar @bochilteam/scraper
      try {
        const yt = await youtubedl(url).catch(async _ => await youtubedlv2(url));
        const dl_url = await yt.video['360p'].download();
        const size = await yt.video['360p'].fileSizeH;
        await conn.sendMessage(m.chat, {
          video: { url: dl_url },
          fileName: `${title}.mp4`,
          mimetype: 'video/mp4',
          caption: `${infoMessage}\n> ⚖️ Tamaño » *${size}*`,
          contextInfo: {
            externalAdReply: {
              title: title,
              body: "Elite Bot - YouTube Video",
              thumbnailUrl: thumbnail,
              mediaType: 1,
              renderLargerThumbnail: true,
              showAdAttribution: true,
              sourceUrl: url
            }
          }
        }, { quoted: m });
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
        return;
      } catch (e) {
        console.log('Error con @bochilteam/scraper:', e);
      }

      // Intento 3: Usar API externa como respaldo
      try {
        const response = await fetch(`https://api.vreden.my.id/api/ytmp4?url=${url}`);
        const json = await response.json();
        if (json.result && json.result.download && json.result.download.url) {
          await conn.sendMessage(m.chat, {
            video: { url: json.result.download.url },
            fileName: `${title}.mp4`,
            mimetype: 'video/mp4',
            caption: infoMessage,
            contextInfo: {
              externalAdReply: {
                title: title,
                body: "𝘾𝙧𝙞𝙨𝙩𝙞𝙖𝙣 𝙀𝙡𝙞𝙩𝙚 - YouTube Video",
                thumbnailUrl: thumbnail,
                mediaType: 1,
                renderLargerThumbnail: true,
                showAdAttribution: true,
                sourceUrl: url
              }
            }
          }, { quoted: m });
          await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
          return;
        }
      } catch (e) {
        console.log('Error con API externa:', e);
      }

      throw new Error('No se pudo descargar el video con ninguno de los métodos disponibles');
    } catch (error) {
      console.error(error);
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply('*[❗] Error al descargar el video. Por favor, intenta nuevamente más tarde.*');
    }
  } catch (error) {
    console.error(error);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    return m.reply('*[❗] Ocurrió un error inesperado. Por favor, intenta nuevamente.*');
  }
};

handler.help = ['play2 <búsqueda>'];
handler.tags = ['downloader'];
handler.command = /^play2$/i;
export default handler;
