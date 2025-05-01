import fs from 'fs'
import fetch from 'node-fetch'

let handler = m => m

handler.before = async function (m, { conn, participants, groupMetadata, isBotAdmin }) {
  if (!m.messageStubType || !m.isGroup) return

  const FOTO_PREDETERMINADA = './src/sinfoto2.jpg'
  const STICKERS_DESPEDIDA = [
    'https://files.catbox.moe/g3hyc2.webp',
    'https://files.catbox.moe/0boonh.webp',
    'https://files.catbox.moe/o58tbw.webp'
  ]
  const AUDIO_BIENVENIDA = 'https://files.catbox.moe/8cm2hc.opus'
  const AUDIO_DESPEDIDA = 'https://files.catbox.moe/f8mqtf.opus'

  let userId = m.messageStubParameters?.[0]
  if (!userId) return

  let pp
  try {
    pp = await conn.profilePictureUrl(userId, 'image')
  } catch (e) {
    console.error('Error al obtener imagen de perfil:', e)
    pp = null
  }

  let img
  if (pp) {
    try {
      img = await (await fetch(pp)).buffer()
    } catch (e) {
      console.error('Error al descargar imagen:', e)
      img = null
    }
  }
  if (!img) {
    try {
      img = fs.readFileSync(FOTO_PREDETERMINADA)
    } catch (e) {
      console.error('Error al leer imagen predeterminada:', e)
      img = null
    }
  }

  let usuario = `@${m.sender.split`@`[0]}`
  let chat = global.db.data.chats[m.chat]
  let users = participants.map(u => conn.decodeJid(u.id))

  let subject = groupMetadata.subject
  let descs = groupMetadata.desc || "Sin descripción"
  let userName = `${userId.split`@`[0]}`
  let mentionUser = `@${userName}`

  // Evento de bienvenida
  if (chat.welcome && m.messageStubType == 27 && this.user.jid != global.conn.user.jid) {
    let defaultWelcome = `*╔══════════════*
*╟* 𝗕𝗜𝗘𝗡𝗩𝗘𝗡𝗜𝗗𝗢/𝗔
*╠══════════════*
*╟*🛡️ *${subject}*
*╟*👤 *${mentionUser}*
*╟* 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗖𝗜𝗢́𝗡 

${descs}

*╟* ¡🇼‌🇪‌🇱‌🇨‌🇴‌🇲‌🇪!
*╚══════════════*`

    let textWel = chat.sWelcome ? chat.sWelcome
      .replace(/@user/g, mentionUser)
      .replace(/@group/g, subject)
      .replace(/@desc/g, descs)
      : defaultWelcome

    await this.sendMessage(m.chat, {
      image: img,
      caption: textWel,
      contextInfo: {
        mentionedJid: [m.sender, userId]
      }
    }, { quoted: m })

    // Enviar audio de bienvenida después de 2 segundos
    setTimeout(async () => {
      try {
        let audio = await (await fetch(AUDIO_BIENVENIDA)).buffer()
        await conn.sendMessage(m.chat, { audio, mimetype: 'audio/ogg; codecs=opus', ptt: true })
      } catch (e) {
        console.error('Error enviando audio de bienvenida:', e)
      }
    }, 2000)
  }

  // Evento de despedida
  else if (chat.welcome && (m.messageStubType == 28 || m.messageStubType == 32) && this.user.jid != global.conn.user.jid) {
    let defaultBye = `*╔══════════════*
*╟* *SE FUE UNA BASURA*
*╟*👤 ${mentionUser} 
*╚══════════════*`

    let textBye = chat.sBye ? chat.sBye
      .replace(/@user/g, mentionUser)
      .replace(/@group/g, subject)
      : defaultBye

    await this.sendMessage(m.chat, {
      image: img,
      caption: textBye,
      contextInfo: {
        mentionedJid: [m.sender, userId]
      }
    }, { quoted: m })

    // Enviar audio o sticker aleatorio después de 2 segundos
    setTimeout(async () => {
      try {
        const isSticker = Math.random() < 0.5
        if (isSticker) {
          let stickerUrl = STICKERS_DESPEDIDA[Math.floor(Math.random() * STICKERS_DESPEDIDA.length)]
          let sticker = await (await fetch(stickerUrl)).buffer()
          await conn.sendMessage(m.chat, { sticker })
        } else {
          let audio = await (await fetch(AUDIO_DESPEDIDA)).buffer()
          await conn.sendMessage(m.chat, { audio, mimetype: 'audio/ogg; codecs=opus', ptt: true })
        }
      } catch (e) {
        console.error('Error enviando sticker o audio de despedida:', e)
      }
    }, 2000)
  }
}

export default handler
