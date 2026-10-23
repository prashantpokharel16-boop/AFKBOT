
const mineflayer = require('mineflayer')
const { SocksClient } = require('socks')

const SERVER = 'YOUR_SERVER_ADDRESS'
const PORT = 25565
const VERSION = '1.21.4'
const PASSWORD = 'sarojgmg'

const BOT_NAMES = [
  'YOUR_TEST_ACCOUNT'
]

// Optional SOCKS5 proxy for authorized connections.
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

  function scheduleReconnect() {
    if (stopped || reconnectTimer) return

    reconnectTimer = setTimeout(() => {
      reconnectTimer = null
      connect()
    }, RECONNECT_DELAY)
  }

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
            `${username} proxy error: ${error.message}`
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

    bot.once('spawn', () => {
      connecting = false
      console.log(`${username} joined the server`)

      // Registration should be performed only for new
      // accounts when the server requires it.
      setTimeout(() => {
        if (!bot.entity) return

        bot.chat(`/register ${PASSWORD} ${PASSWORD}`)

        setTimeout(() => {
          if (!bot.entity) return

          bot.chat(`/login ${PASSWORD}`)

          setTimeout(() => {
            if (!bot.entity) return

            bot.chat('/afk')
            console.log(`${username}: AFK command sent`)
          }, 3000)
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
  }

  connect()
}

console.log('==============================')
console.log('      Minecraft AFK Bot')
console.log('==============================')
console.log(`Server: ${SERVER}:${PORT}`)
console.log(`Accounts: ${BOT_NAMES.length}`)
console.log(`Proxy enabled: ${PROXY.enabled}`)
console.log(`Reconnect delay: ${RECONNECT_DELAY / 1000}s`)

BOT_NAMES.forEach((username, index) => {
  setTimeout(() => startBot(username), index * START_DELAY)
})
