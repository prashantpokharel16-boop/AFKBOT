
require('dotenv').config()
const mineflayer = require('mineflayer')

const config = {
  host: process.env.MC_HOST || '127.0.0.1',
  port: Number(process.env.MC_PORT || 25565),
  version: process.env.MC_VERSION || '1.21.4',
  username: process.env.MC_USERNAME || 'AFKTestBot'
}

let stopping = false
let retryTimer

function connect() {
  if (stopping) return

  console.log(
    `[${new Date().toISOString()}] Connecting ${config.username} to ${config.host}:${config.port}`
  )

  const bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: config.username,
    version: config.version,
    auth: 'offline'
  })

  bot.once('spawn', () => {
    console.log(`[${config.username}] Spawned successfully`)
  })

  bot.on('kicked', reason => {
    console.log(`[${config.username}] Kicked:`, reason)
  })

  bot.on('error', error => {
    console.error(`[${config.username}] Error:`, error.message)
  })

  bot.once('end', reason => {
    console.log(`[${config.username}] Disconnected:`, reason || 'connection ended')

    if (!stopping) {
      retryTimer = setTimeout(connect, 15000)
    }
  })
}

function shutdown() {
  stopping = true
  clearTimeout(retryTimer)
  console.log('Stopping bot manager...')
  process.exit(0)
}

process.once('SIGINT', shutdown)
process.once('SIGTERM', shutdown)

connect()
