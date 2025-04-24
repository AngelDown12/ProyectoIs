const handler = async (m, { isOwner, isAdmin, conn, text, participants, args }) => {
  let chat = global.db.data.chats[m.chat];
  let emoji = chat.emojiTag || '┃';

  if (!(isAdmin || isOwner)) {
    global.dfail('admin', m, conn);
    throw false;
  }

  const mensajePersonalizado = args.join` `;
  const groupMetadata = await conn.groupMetadata(m.chat);
  const groupName = groupMetadata.subject;

  const countryFlags = {
    '33': '🇫🇷', '63': '🇵🇭', '599': '🇧🇶', '52': '🇲🇽', '57': '🇨🇴',
    '54': '🇦🇷', '34': '🇪🇸', '55': '🇧🇷', '1': '🇺🇸', '44': '🇬🇧',
    '91': '🇮🇳', '502': '🇬🇹', '56': '🇨🇱', '51': '🇵🇪', '58': '🇻🇪',
    '505': '🇳🇮', '593': '🇪🇨', '504': '🇭🇳', '591': '🇧🇴', '53': '🇨🇺',
    '503': '🇸🇻', '507': '🇵🇦', '595': '🇵🇾'
  };

  const getCountryFlag = (id) => {
    const phoneNumber = id.split('@')[0];
    let prefix = phoneNumber.slice(0, 3);
    if (phoneNumber.startsWith('1')) return '🇺🇸';
    if (!countryFlags[prefix]) prefix = phoneNumber.slice(0, 2);
    return countryFlags[prefix] || '🏳️‍🌈';
  };

  let texto = `*╭━* 𝘼𝘾𝙏𝙄𝙑𝙀𝙉𝙎𝙀𝙉 乂\n\n*${groupName}*\n👤 INTEGRANTES: *${participants.length}*\n${mensajePersonalizado}\n`;

  // Solo mostramos los primeros 5 miembros
  const maxMentions = 5;
  let mentionsList = participants.slice(0, maxMentions).map(p => `${emoji} ${getCountryFlag(p.id)} @${p.id.split('@')[0]}`).join('  ');

  // Agregar "ver más" al final si hay más de 5 participantes
  if (participants.length > maxMentions) {
    mentionsList += `\n\n*Ver más...*`;
  }

  texto += mentionsList;

  texto += `\n\n*╰━* 𝙀𝙇𝙄𝙏𝙀 𝘽𝙊𝙏 𝙂𝙇𝙊𝘽𝘼𝙇\n▌│█║▌║▌║║▌║▌║▌║█`;

  // Enviar el mensaje
  await conn.sendMessage(m.chat, {
    text: texto,
    mentions: participants.map(p => p.id) // Etiquetar a todos
  });
};

handler.help = ['todos'];
handler.tags = ['group'];
handler.command = /^(tagal|invocar|marcar|todos|invocación)$/i;
handler.admin = true;
handler.group = true;

export default handler;
