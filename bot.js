const mineflayer = require("mineflayer");

const HOST = "roosevelt-smithsonian.tun.ply.gg";
const PORT = 25565;

const bots = [];
let shouldReconnect = true;

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

// Put the Minecraft server password here only if
// the server requires /login or /register.
const PASSWORD = "";

function createBot(username) {
  console.log(`Starting ${username}...`);

  const bot = mineflayer.createBot({
    host: HOST,
    port: PORT,
    username: username,
    version: "1.21.4",
    viewDistance: 2,
    hideErrors: false
  });

  let afkInterval = null;

  bot.once("spawn", () => {
    console.log(`✅ ${username} joined!`);

    // Login/register only when a password is configured.
    if (PASSWORD) {
      setTimeout(() => {
        bot.chat(`/register ${PASSWORD} ${PASSWORD}`);
      }, 3000);

      setTimeout(() => {
        bot.chat(`/login ${PASSWORD}`);
      }, 6000);
    }

    // Start anti-AFK after joining.
    setTimeout(() => {
      startAfkLoop(bot, username);
    }, PASSWORD ? 9000 : 3000);
  });

  bot.on("kicked", (reason) => {
    console.log(`❌ ${username} kicked:`, JSON.stringify(reason));
  });

  bot.on("error", (err) => {
    console.log(`⚠️ ${username} error:`, err.message);
  });

  bot.on("end", () => {
    console.log(`🔄 ${username} disconnected.`);

    if (afkInterval) {
      clearInterval(afkInterval);
      afkInterval = null;
    }

    const index = bots.indexOf(bot);
    if (index !== -1) {
      bots.splice(index, 1);
    }

    if (shouldReconnect) {
      setTimeout(() => {
        createBot(username);
      }, 10000);
    }
  });

  function startAfkLoop(bot, username) {
    afkInterval = setInterval(() => {
      if (!bot.entity) return;

      const action = Math.floor(Math.random() * 3);

      try {
        switch (action) {
          case 0:
            bot.setControlState("jump", true);

            setTimeout(() => {
              if (bot.entity) {
                bot.setControlState("jump", false);
              }
            }, 300);
            break;

          case 1:
            bot.look(
              bot.entity.yaw + (Math.random() - 0.5),
              bot.entity.pitch + (Math.random() - 0.5) * 0.3,
              true
            );
            break;

          case 2:
            bot.setControlState("sneak", true);

            setTimeout(() => {
              if (bot.entity) {
                bot.setControlState("sneak", false);
              }
            }, 500);
            break;
        }
      } catch (err) {
        console.log(`AFK action failed for ${username}:`, err.message);
      }
    }, 20000 + Math.random() * 20000);
  }

  bots.push(bot);
}

// Start 20 bots, 3 seconds apart.
function startAllBots() {
  shouldReconnect = true;

  botNames.forEach((name, index) => {
    setTimeout(() => {
      createBot(name);
    }, index * 3000);
  });
}

startAllBots();

process.on("SIGINT", () => {
  console.log("Stopping all bots...");
  shouldReconnect = false;

  for (const bot of bots) {
    try {
      bot.quit();
    } catch {}
  }

  process.exit(0);
});
