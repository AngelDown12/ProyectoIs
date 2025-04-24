import pkg from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto } = pkg;

let handler = async (m, { conn }) => {
    const msgText = m.text?.toLowerCase();
    const response =
        m.message?.buttonsResponseMessage?.selectedButtonId ||
        m.message?.interactiveResponseMessage?.nativeFlowResponseButtonResponse?.id ||
        m.message?.interactiveResponseMessage?.buttonReplyMessage?.selectedId ||
        m.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
        msgText || '';

    if (msgText?.startsWith('.1vs1')) {
        const buttons = [
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "ACEPTO",
                    id: `acepto|${m.sender}`
                })
            },
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "NEGADO",
                    id: "negado"
                })
            }
        ];

        const mensaje = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {},
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: {
                            text: `🔥 Modo Insano Activado 🔥\n\n¿Quién se rifa un PVP conmigo?\n───────────────\n¡Vamos a darnos en la madre sin miedo! 👿`
                        },
                        footer: { text: "Cual es el valiente" },
                        nativeFlowMessage: { buttons }
                    })
                }
            }
        }, {});

        await conn.relayMessage(m.chat, mensaje.message, {});
        return;
    }

    if (response.startsWith('acepto')) {
        const [, retadorId] = response.split('|');
        const nombre = await conn.getName(m.sender);
        const nombreRetador = await conn.getName(retadorId);

        const buttons = [
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "Yomismo",
                    id: `yomismo|${retadorId}|${m.sender}`
                })
            },
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "Notengo",
                    id: "notengo"
                })
            }
        ];

        const mensaje = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {
                        mentionedJid: [m.sender, retadorId]
                    },
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: {
                            text: `UY ESTO ESTARÁ BUENO, ${nombre} aceptó el reto de ${nombreRetador}, ahora quien pondrá la sala`
                        },
                        footer: { text: "Confirmen" },
                        nativeFlowMessage: { buttons }
                    })
                }
            }
        }, {});

        await conn.relayMessage(m.chat, mensaje.message, {});
        return;
    }

    if (response === 'negado') {
        const nombre = await conn.getName(m.sender);
        await conn.sendMessage(m.chat, {
            text: `┏━━━━━━━━━━━━━━━━┓\nUY PANA SE NOTA EL MIEDO DE NO JUGARLE A PVP A ${nombre.toUpperCase()}`,
            mentions: [m.sender]
        });
        return;
    }

    if (response.startsWith('yomismo')) {
        const [, r1, r2] = response.split('|');
        const nombre1 = await conn.getName(r1);
        const nombre2 = await conn.getName(r2);

        await conn.sendMessage(m.chat, {
            text: `┏━━━━━━━━━━━━━━━━┓\nUy esto se pondrá bueno, estos dos panas ${nombre1} y ${nombre2} se van a dar en la madre.\n\n*Crea la sala y manda datos*`,
            mentions: [r1, r2]
        });
        return;
    }

    if (response === 'notengo') {
        await conn.sendMessage(m.chat, {
            text: `┏━━━━━━━━━━━━━━━━┓\nUy pana para que entras a este grupo si están pobres. Ponte a lavar platos mejor.`
        });
        return;
    }
};

handler.customPrefix = /^(acepto|negado|yomismo|notengo|\.1vs1.*)$/i;
handler.command = new RegExp;
handler.group = true;

export default handler;
