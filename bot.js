const mineflayer = require('mineflayer')

const SERVER = 'minechat.levyathan.ch'
const PORT = 25565
const PASSWORD = 'SAROJGMG1'

const BOT_NAMES = [
  'IAMABOY',
  'DonGga',
  'Prashant',
  'Luffy',
  'Terek',
  'Gotham',
  'Herobrine',
  
]

function startBot(username) {
  function connect() {
    console.log(`🔄 Starting ${username}...`)

    const bot = mineflayer.createBot({
      host: SERVER,
      port: PORT,
      username: username,
      version: '1.21.4'
    })

    bot.once('spawn', () => {
      console.log(`✅ ${username} joined!`)

      setTimeout(() => {
        bot.chat(`/login ${PASSWORD}`)

        setTimeout(() => {
          bot.chat('/afk')
          console.log(`💤 ${username} is AFK`)
        }, 2000)

      }, 2000)
    })

    bot.on('kicked', reason => {
      console.log(`❌ ${username} kicked:`, reason)
    })

    bot.on('error', error => {
      console.log(`⚠️ ${username}: ${error.message}`)
    })

    bot.on('end', () => {
      console.log(`🔄 ${username} reconnecting in 10 seconds...`)
      setTimeout(connect, 10000)
    })
  }

  connect()
}

BOT_NAMES.forEach((name, index) => {
  setTimeout(() => startBot(name), index * 5000)
})
