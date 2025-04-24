const handler = async (m, {isOwner, isAdmin, conn, text, participants, args}) => {
  let chat = global.db.data.chats[m.chat],
      emoji = chat.emojiTag || '┃';
  
  if (!(isAdmin || isOwner)) {
    global.dfail('admin', m, conn);
    throw false;
  }

  const pesan = args.join` `,
        groupMetadata = await conn.groupMetadata(m.chat),
        groupName = groupMetadata.subject;
  
  const countryFlags = {
    '33': '🇫🇷', '63': '🇵🇭', '599': '🇧🇶', '52': '🇲🇽', '57': '🇨🇴', 
    '54': '🇦🇷', '34': '🇪🇸', '55': '🇧🇷', '1': '🇺🇸', '44': '🇬🇧', 
    '91': '🇮🇳', '502': '🇬🇹', '56': '🇨🇱', '51': '🇵🇪', '58': '🇻🇪', 
    '505': '🇳🇮', '593': '🇪🇨', '504': '🇭🇳', '591': '🇧🇴', '53': '🇨🇺', 
    '503': '🇸🇻', '507': '🇵🇦', '595': '🇵🇾'
  };
  
  const getCountryFlag = (id) => {
    const phoneNumber = id.split('@')[0];
    let phonePrefix = phoneNumber.slice(0, 3);
    if (phoneNumber.startsWith('1')) return '🇺🇸';
    if (!countryFlags[phonePrefix]) phonePrefix = phoneNumber.slice(0, 2);
    return countryFlags[phonePrefix] || '🏳️‍🌈';
  };

  let teks = `*╭━* 𝘼𝘾𝙏𝙄𝙑𝙀𝙉𝙎𝙀𝙉 乂\n\n*${groupName}*\n👤 𝙄𝙉𝙏𝙀𝙂𝙍𝘼𝙉𝙏𝙀𝙎: *${participants.length}*\n${pesan}\n`;

  // Mostrar solo los primeros 15 participantes
  const maxVisible = 15;
  const visibleParticipants = participants.slice(0, maxVisible);

  for (const mem of visibleParticipants) {
    teks += `${emoji} ${getCountryFlag(mem.id)} @${mem.id.split('@')[0]}\n`;
  }

  // Si hay más participantes, agregar "ver más"
  if (participants.length > maxVisible) {
    teks += `\nY ${participants.length - maxVisible} más... para ver todos, consulte el grupo.\n`;
  }

  teks += `\n*╰━* 𝙀𝙇𝙄𝙏𝙀 𝘽𝙊𝙏 𝙂𝙇𝙊𝘽𝘼𝙇\n▌│█║▌║▌║║▌║▌║▌║█`;

  await conn.sendMessage(m.chat, { text: teks, mentions: participants.map((a) => a.id) });
};

handler.help = ['todos'];
handler.tags = ['group'];
handler.command = /^(tagal|invocar|marcar|todos|invocación)$/i;
handler.admin = true;
handler.group = true;

export default handler;
