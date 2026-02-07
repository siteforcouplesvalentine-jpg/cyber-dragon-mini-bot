const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeInMemoryStore,
    jidDecode
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const { smsg } = require('./lib/myfunc'); 
const fs = require('fs');

const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });
store.readFromFile('./dragon_store.json');
setInterval(() => { store.writeToFile('./dragon_store.json'); }, 10000);

async function startDragonBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session_id');
    const { version } = await fetchLatestBaileysVersion();

    const conn = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        fireInitQueries: false,
        shouldSyncHistoryMessage: false,
        markOnlineOnConnect: true
    });

    // 🚀 PAIRING CODE (HACKER PROOF LOGIN)
    if (!conn.authState.creds.registered) {
        const phoneNumber = "917012074195"; // <== Ninte number (91 kootti) ivide kodukku!
        console.log("🐲 Initiating Secure Pairing...");
        await delay(7000);
        const code = await conn.requestPairingCode(phoneNumber);
        console.log(`\n\n🛡️ SECURE PAIRING CODE: ${code}\n\n`);
    }

    store.bind(conn.ev);
    conn.ev.on("creds.update", saveCreds);

    // 🛡️ HACKER PROTECTION & SECURITY
    conn.ev.on("call", async (json) => {
        const callerId = json[0].from;
        console.log(`🚫 ANTI-CALL: Rejecting call from ${callerId}`);
        await conn.rejectCall(json[0].id, callerId); // Hacker-ukal call vazhi hang aakkunnathu thadayunnu.
    });

    conn.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;
            
            // AUTO STATUS VIEW
            if (mek.key && mek.key.remoteJid === 'status@broadcast') {
                await conn.readMessages([mek.key]);
                return;
            }

            const m = smsg(conn, mek, store);
            const body = m.text || '';
            const prefix = /^[°•π÷×¶∆£¢€¥®™✓_=|~!?#%^&.+/,.;:-]/.test(body) ? body.match(/^[°•π÷×¶∆£¢€¥®™✓_=|~!?#%^&.+/,.;:-]/)[0] : '';
            const command = body.startsWith(prefix) ? body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase() : '';

            // 🆘 EMERGENCY & HELP MENU
            if (command === 'emergency') {
                const text = `🚨 *CYBER DRAGON SHIELD* 🚨\n\n🚑 Ambulance: 108\n👮 Police: 112\n🔥 Fire: 101\n🛡️ Protection: ACTIVE`;
                await conn.sendMessage(m.chat, { text }, { quoted: m });
            }

            // 📸 .VV (VIEW ONCE) - Automatically saved in store
            if (m.mtype === 'viewOnceMessageV2') {
                console.log("🐲 Secure Bypass: View Once captured.");
            }

            require("./dragon")(conn, m, chatUpdate, store); 
            
        } catch (err) {
            console.log("Security Log: ", err);
        }
    });

    conn.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            if (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                startDragonBot();
            }
        } else if (connection === "open") {
            console.log("🐲 CYBER DRAGON SECURED & ONLINE!");
        }
    });
}

startDragonBot();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Dragon is Alive!'));
app.listen(port, () => console.log(`Server running on port ${port}`));
