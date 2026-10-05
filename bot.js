const mineflayer = require('mineflayer')

const SERVER = 'minechat.levyathan.ch'
const PORT = 25565
const PASSWORD = 'SAROJGMG1'

const BOT_NAMES = [
  'IAMABOY',
  'DonGga',
  'Prashant',
  'Luffy'
]

const RECONNECT_DELAY = 30000 // 30 seconds
const START_DELAY = 5000      // 5 seconds between bots

function startBot(username) {
  let reconnectTimer = null
  let isConnecting = false

  function connect() {
    if (isConnecting) return

    isConnecting = true

    console.log(`🔄 Starting ${username}...`)

    const bot = mineflayer.createBot({
      host: SERVER,
      port: PORT,
      username: username,
      version: '1.21.4'
    })

    bot.once('spawn', () => {
      isConnecting = false

      console.log(`✅ ${username} joined the server!`)

      // Wait for AuthMe/login system
      setTimeout(() => {
        if (!bot.entity) return

        console.log(`🔐 Logging in ${username}...`)
        bot.chat(`/login ${PASSWORD}`)

        // Wait for login to complete
        setTimeout(() => {
          if (!bot.entity) return

          console.log(`💤 Sending /afk for ${username}...`)
          bot.chat('/afk')

          console.log(`✅ ${username} is now AFK!`)
        }, 3000)

      }, 2000)
    })

    bot.on('kicked', reason => {
      console.log(`❌ ${username} was kicked:`)
      console.log(reason)
    })

    bot.on('error', error => {
      console.log(`⚠️ ${username} error: ${error.message}`)
    })

    bot.on('end', () => {
      isConnecting = false

      console.log(`🔌 ${username} disconnected.`)

      if (reconnectTimer) return

      console.log(
        `🔄 ${username} reconnecting in ${RECONNECT_DELAY / 1000} seconds...`
      )

      reconnectTimer = setTimeout(() => {
        reconnectTimer = null
        connect()
      }, RECONNECT_DELAY)
    })
  }

  connect()
}

// Start bots one by one
BOT_NAMES.forEach((username, index) => {
  setTimeout(() => {
    startBot(username)
  }, index * START_DELAY)
})

console.log('=================================')
console.log('      MineChat AFK Bot')
console.log('=================================')
console.log(`Server: ${SERVER}:${PORT}`)
console.log(`Bots: ${BOT_NAMES.length}`)
console.log(`Reconnect: ${RECONNECT_DELAY / 1000}s`)
console.log('=================================')
