const mineflayer = require("mineflayer");

const HOST = "roosevelt-smithsonian.tun.ply.gg";
const PORT = 25565; // Change this if your Playit tunnel shows a different port.
const VERSION = "1.21.4";

const botNames = [
  "LoadBot01",
  "LoadBot02",
  "LoadBot03",
  "LoadBot04",
  "LoadBot05",
  "LoadBot06",
  "LoadBot07",
  "LoadBot08",
  "LoadBot09",
  "LoadBot10",
  "LoadBot11",
  "LoadBot12",
  "LoadBot13",
  "LoadBot14",
  "LoadBot15",
  "LoadBot16",
  "LoadBot17",
  "LoadBot18",
  "LoadBot19",
  "LoadBot20"
];

function startBot(username, index) {
  console.log(`[${index + 1}/20] Starting ${username}...`);

  const bot = mineflayer.createBot({
    host: HOST,
    port: PORT,
    username: username,
    version: VERSION,
    auth: "offline"
  });

  bot.once("spawn", () => {
    console.log(`✅ ${username} joined the server`);
  });

  bot.on("kicked", (reason) => {
    console.log(`❌ ${username} kicked: ${reason}`);
  });

  bot.on("error", (err) => {
    console.log(`⚠️ ${username}: ${err.message}`);
  });

  bot.on("end", () => {
    console.log(`🔄 ${username} disconnected. Reconnecting in 10 seconds...`);

    setTimeout(() => {
      startBot(username, index);
    }, 10000);
  });
}

// Start bots one by one so they don't all hit the server at exactly the same time.
botNames.forEach((name, index) => {
  setTimeout(() => {
    startBot(name, index);
  }, index * 3000);
});
