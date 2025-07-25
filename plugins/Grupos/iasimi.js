import fetch from 'node-fetch';
import axios from 'axios'; // Se añade axios porque Luminai lo requiere

const handler = (m) => m;

handler.before = async (m) => {
  const chat = global.db.data.chats[m.chat];
  if (chat.simi) {
    // Verifica si el mensaje tiene menos de 10 letras y si es un comando
    if (m.text.length < 10 || m.text.startsWith('/') || m.text.startsWith('!') || m.text.startsWith('.')) return;

    let textodem = m.text;
    
    // Eliminé la lista de palabras bloqueadas para que responda más mensajes
    if (m.fromMe) return;
    try {
      await conn.sendPresenceUpdate('composing', m.chat)
      const username = m.pushName || 'Usuario'
      const basePrompt = `Tu nombre es 𝘾𝙧𝙞𝙨𝙩𝙞𝙖𝙣 𝘽𝙤𝙩 𝙀𝙡𝙞𝙩𝙚 y parece haber sido creado por cristian. Tú usas el idioma Español. Llamarás a las personas por su nombre ${username}, te gusta ser divertido, te encanta aprender y sobre todo las explociones. Lo más importante es que debes ser amigable con la persona con la que estás hablando. ${username}`
      const prompt = `${basePrompt}. Responde lo siguiente: ${textodem}`
      const response = await axios.post("https://Luminai.my.id", {
        content: textodem,
        user: username,
        prompt: prompt,
        webSearchMode: false
      })
      await m.reply(response.data.result)
    } catch (e) {
      console.error('💛 Error con Luminai:', e); // Solo se muestra en la consola
    }
    return !0;
  }
  return true;
};

export default handler;
