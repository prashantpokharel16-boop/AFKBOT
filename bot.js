
const mineflayer = require('mineflayer')
const { SocksClient } = require('socks')

// Server configuration
const SERVER = 'YOUR_SERVER_ADDRESS'
const PORT = 25565
const VERSION = '1.21.4'

// Use only accounts you own and are authorized to connect.
const PASSWORD = process.env.MC_BOT_PASSWORD

const BOT_NAMES = [
  'YOUR_TEST_ACCOUNT'
]

// Optional SOCKS5 proxy.
// Leave enabled: false to connect directly.
// Use a proxy you own or are authorized to use.
const PROXY = {
  enabled: false,
  host: '127.0.0.1',
  port: 1080,
  username: '',
  password: ''
}

const START_DELAY = 5000
const RECONNECT_DELAY = 30000

function startBot(username) {
  let connecting = false
  let reconnectTimer = null
  let stopped = false

  function connect() {
    if (connecting || stopped) return
    connecting = true

    console.log(`Connecting ${username}...`)

    const options = {
      username,
      host: SERVER,
      port: PORT,
      version: VERSION
    }

    if (PROXY.enabled) {
      delete options.host

      options.connect = client => {
        SocksClient.createConnection({
          proxy: {
            host: PROXY.host,
            port: PROXY.port,
            type: 5,
            ...(PROXY.username
              ? {
                  userId: PROXY.username,
                  password: PROXY.password
                }
              : {})
          },
          command: 'connect',
          destination: {
            host: SERVER,
            port: PORT
          }
        }).then(({ socket }) => {
          client.setSocket(socket)
          client.emit('connect')
        }).catch(error => {
          console.error(
            `Proxy connection failed for ${username}:`,
            error.message
          )
          client.emit('error', error)
        })
      }
    }

    let bot

    try {
      bot = mineflayer.createBot(options)
    } catch (error) {
      connecting = false
      console.error(`${username}: ${error.message}`)
      scheduleReconnect()
      return
    }

    let spawnHandled = false

    bot.once('spawn', () => {
      connecting = false
      spawnHandled = true
      console.log(`${username} spawned`)

      // Only register accounts on a server where you have
      // permission to create accounts. Existing accounts may
      // require /login instead.
      setTimeout(() => {
        if (!bot.entity) return

        if (!PASSWORD) {
          console.log('Set MC_BOT_PASSWORD before using auth commands.')
          return
        }

        // Choose the appropriate command for the account's
        // actual registration state; don't blindly register
        // every time the bot reconnects.
        bot.chat(`/login ${PASSWORD}`)

        setTimeout(() => {
          if (!bot.entity) return
          bot.chat('/afk')
          console.log(`${username}: AFK command sent`)
        }, 3000)
      }, 2000)
    })

    bot.on('kicked', reason => {
      console.log(`${username} kicked:`, reason)
    })

    bot.on('error', error => {
      console.error(`${username} error:`, error.message)
    })

    bot.on('end', () => {
      connecting = false
      console.log(`${username} disconnected`)
      scheduleReconnect()
    })

    function scheduleReconnect() {
      if (stopped || reconnectTimer) return

      reconnectTimer = setTimeout(() => {
        reconnectTimer = null
        connect()
      }, RECONNECT_DELAY)
    }
  }

  connect()
}

console.log('Minecraft AFK bot starting')
console.log(`Server: ${SERVER}:${PORT}`)
console.log(`Accounts: ${BOT_NAMES.length}`)
console.log(`Proxy enabled: ${PROXY.enabled}`)

BOT_NAMES.forEach((username, index) => {
  setTimeout(() => startBot(username), index * START_DELAY)
})
