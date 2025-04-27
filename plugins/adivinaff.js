import fetch from 'node-fetch';
import pkg from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto } = pkg;

const games = new Map();

const handler = async (m, { conn, usedPrefix }) => {
    // Depuración: Ver si el mensaje contiene .adivinaff
    console.log("Mensaje recibido:", m.text);

    const msgText = m.text?.toLowerCase();
    const groupId = m.chat;

    // Si el texto es .adivinaff, proceder a iniciar el juego
    if (msgText?.startsWith(`${usedPrefix}adivinaff`)) {
        console.log("Comando .adivinaff activado");

        // Limpiar juego anterior si existe
        if (games.has(m.sender)) {
            clearTimeout(games.get(m.sender).timeout);
            games.delete(m.sender);
        }

        // Obtener nuevo personaje
        const res = await fetch('https://api.vreden.my.id/api/tebakff');
        const { result } = await res.json();
        const { jawaban, img } = result;

        // Guardar juego
        games.set(m.sender, {
            answer: jawaban.toLowerCase(),
            timeout: setTimeout(() => {
                conn.sendMessage(m.chat, { 
                    text: `⏰ ¡TIEMPO AGOTADO!\nRespuesta: *${jawaban}*`
                }, { quoted: m });
                games.delete(m.sender);
            }, 30000)
        });

        // Botones para intentar de nuevo
        const buttons = [
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "🔄 Intentar otro",
                    id: "repetir_adivinaff" // ID personalizado
                })
            }
        ];

        // Crear el mensaje
        const mensaje = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {},
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: {
                            text: `🎮 *ADIVINA EL PERSONAJE DE FREE FIRE* 🎮\n\nTienes *30 segundos* para adivinar.`
                        },
                        footer: { text: "Escribe el nombre del personaje" },
                        nativeFlowMessage: { buttons }
                    })
                }
            }
        }, {});

        // Enviar mensaje
        await conn.relayMessage(m.chat, mensaje.message, {});
        return;
    }

    // Ver si se presiona el botón "Intentar otro"
    const response =
        m.message?.buttonsResponseMessage?.selectedButtonId ||
        m.message?.interactiveResponseMessage?.nativeFlowResponseButtonResponse?.id ||
        m.message?.interactiveResponseMessage?.buttonReplyMessage?.selectedId ||
        m.message?.listResponseMessage?.singleSelectReply?.selectedRowId || '';

    if (response === 'repetir_adivinaff') {
        console.log("Botón 'Intentar otro' presionado");

        // Manda texto como si el usuario escribiera .adivinaff
        await conn.sendMessage(m.chat, { text: `${usedPrefix}adivinaff` });
        return;
    }

    // Verificar respuesta del juego
    if (games.has(m.sender)) {
        const game = games.get(m.sender);
        if (msgText?.trim() === game.answer) {
            clearTimeout(game.timeout);
            games.delete(m.sender);
            await m.reply("✅ ¡CORRECTO! +20 XP");
        }
    }
};

handler.customPrefix = /^\.adivinaff$/i;
handler.command = new RegExp;
handler.group = true;

export default handler;
