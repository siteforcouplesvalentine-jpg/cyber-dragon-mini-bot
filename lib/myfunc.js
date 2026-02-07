const { proto, getContentType } = require('@whiskeysockets/baileys');

/**
 * Standard Message (smsg) formatter for Cyber Dragon
 */
exports.smsg = (conn, m, store) => {
    if (!m) return m;
    let M = proto.WebMessageInfo;
    if (m.key) {
        m.id = m.key.id;
        m.isBaileys = m.id.startsWith('BAE5') && m.id.length === 16;
        m.chat = m.key.remoteJid;
        m.fromMe = m.key.fromMe;
        m.isGroup = m.chat.endsWith('@g.us');
        m.sender = conn.decodeJid(m.fromMe ? conn.user.id : m.isGroup ? m.key.participant : m.chat);
    }
    if (m.message) {
        m.mtype = getContentType(m.message);
        m.msg = (m.mtype == 'viewOnceMessageV2') ? m.message.viewOnceMessageV2.message[getContentType(m.message.viewOnceMessageV2.message)] : m.message[m.mtype];
        m.body = m.message.conversation || m.msg.caption || m.msg.text || (m.mtype == 'listResponseMessage') && m.msg.singleSelectReply.selectedRowId || (m.mtype == 'buttonsResponseMessage') && m.msg.selectedButtonId || (m.mtype == 'viewOnceMessageV2') && m.msg.caption || m.text;
        m.text = m.body || "";
    }
    return m;
};

