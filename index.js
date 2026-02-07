const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const pino = require("pino");
const express = require("express");
const app = express();

// 🌐 Render Web Server - Keep alive logic
app.get("/", (req, res) => res.send("🐲 Cyber Dragon Mini Bot: Online & Guarded!"));
app.listen(process.env.PORT || 3000);

const spamLimit = new Map();

async function startDragon() {
    // Session path set within /tmp for safe handling
    const { state, saveCreds } = await useMultiFileAuthState('session_mini');
    
    const conn = makeWASocket({
        auth: state,
        logger: pino({ level: "silent" }), // 📉 Minimal RAM usage
        printQRInTerminal: true,
        browser: ["Cyber Dragon Bot", "Safari", "1.0.0"]
    });

    conn.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const from = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";

        // 🛡️ Hacker Protection: Anti-Spam
        if (!spamLimit.has(from)) spamLimit.set(from, 0);
        spamLimit.set(from, spamLimit.get(from) + 1);
        if (spamLimit.get(from) > 15) return; 

        // 1. .vv (View Once Command)
        if (text === ".vv") {
            const quotedMsg = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
            const viewOnce = quotedMsg?.viewOnceMessageV2 || quotedMsg?.viewOnceMessage;
            
            if (viewOnce) {
                await conn.sendMessage(from, { forward: { key: msg.key, message: viewOnce }, force: true }, { quoted: msg });
            } else {
                await conn.sendMessage(from, { text: "Command failed: Please reply to a View Once message with .vv" });
            }
        }

        // 2. .emergency 🚨
        else if (text === ".emergency") {
            await conn.sendMessage(from, { text: "🚨 *CYBER DRAGON SHIELD:* Uptime is stable. Protected against spam bugs! 🐲🛡️" });
        }
    });

    setInterval(() => spamLimit.clear(), 60000); // Clear anti-spam tracker every minute

    conn.ev.on("creds.update", saveCreds);
    conn.ev.on("connection.update", (up) => {
        if (up.connection === "close") {
            const code = up.lastDisconnect.error?.output?.statusCode;
            if (code !== DisconnectReason.loggedOut) startDragon();
        } else if (up.connection === "open") {
            console.log("✅ Cyber Dragon Mini Bot Connected!");
        }
    });
}

startDragon();

