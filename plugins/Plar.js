import fetch from "node-fetch";
import yts from "yt-search";

const APIS = [
  {
    name: "vreden",
    url: (videoUrl) => `https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(videoUrl)}&quality=64`,
    extract: (data) => data?.result?.download?.url
  },
  {
    name: "zenkey",
    url: (videoUrl) => `https://api.zenkey.my.id/api/download/ytmp3?apikey=zenkey&url=${encodeURIComponent(videoUrl)}&quality=64`,
    extract: (data) => data?.result?.download?.url
  },
  {
    name: "yt1s",
    url: (videoUrl) => `https://yt1s.io/api/ajaxSearch?q=${encodeURIComponent(videoUrl)}`,
    extract: async (data) => {
      const k = data?.links?.mp3?.auto?.k;
      return k ? `https://yt1s.io/api/ajaxConvert?vid=${data.vid}&k=${k}&quality=64` : null;
    }
  }
];

const getAudioUrl = async (videoUrl) => {
  let lastError = null;
  for (const api of APIS) {
    try {
      const apiUrl = api.url(videoUrl);
      const response = await fetch(apiUrl, { timeout: 5000 });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const audioUrl = await api.extract(data);
      if (audioUrl) return audioUrl;
    } catch (error) {
      lastError = error;
      continue;
    }
  }
  throw lastError || new Error("Todas las APIs fallaron");
};

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text || !text.trim()) {
    throw `⭐ Envía el nombre de la canción\n\nEjemplo: ${usedPrefix + command} Bad Bunny - Monaco`;
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } });

    const searchResults = await yts({ query: text.trim(), hl: 'es', gl: 'ES' });
    const video = searchResults.videos[0];
    if (!video) throw new Error("No se encontró el video");
    if (video.seconds > 600) throw "❌ El audio es muy largo (máximo 10 minutos)";

    await conn.sendMessage(m.chat, {
      text: `01:27 ━━━━━⬤────── 05:48\n*⇄ㅤ      ◁        ❚❚        ▷        ↻*\n╴𝗘𝗹𝗶𝘁𝗲 𝗕𝗼𝘁 𝗚𝗹𝗼𝗯𝗮𝗹`,
      contextInfo: {
        externalAdReply: {
          title: video.title.slice(0, 60),
          body: "",
          mediaType: 1,
          renderLargerThumbnail: false,
          showAdAttribution: true,
          sourceUrl: video.url
        }
      }
    }, { quoted: m });

    const audioUrl = await getAudioUrl(video.url);

    await conn.sendMessage(m.chat, {
      audio: { url: audioUrl },
      mimetype: "audio/mpeg",
      fileName: `${video.title.slice(0, 30)}.mp3`.replace(/[^\w\s.-]/gi, ''),
      ptt: false,
      contextInfo: {
        externalAdReply: {
          title: video.title.slice(0, 60),
          body: "Elite Bot Global",
          mediaType: 1,
          showAdAttribution: true,
          renderLargerThumbnail: false,
          sourceUrl: video.url
        }
      }
    }, { quoted: m });

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

  } catch (error) {
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    const msg = typeof error === 'string' ? error :
      `❌ *Error:* ${error.message || 'Ocurrió un problema'}\n\n` +
      `🔸 *Soluciones:*\n• Verifica el nombre\n• Intenta otra canción\n• Prueba más tarde`;
    await conn.sendMessage(m.chat, { text: msg }, { quoted: m });
  }
};

handler.command = ['play', 'playaudio', 'ytmusic'];
handler.exp = 0;
export default handler;
