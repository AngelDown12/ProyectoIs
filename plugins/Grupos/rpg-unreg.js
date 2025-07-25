
let handler = async (m, { conn, text }) => {

let user = global.db.data.users[m.sender]

user.registered = false
return conn.reply(m.chat, `*『✅』 Usted Ya No Está En Mi Base De Datos*\n*By: 𝘾𝙧𝙞𝙨𝙩𝙞𝙖𝙣 𝘽𝙤𝙩 𝙀𝙡𝙞𝙩𝙚*`, m)

}
handler.help = ['unreg']
handler.tags = ['rg']
handler.command = /^unreg(ister)?$/i
handler.register = true
export default handler
