#!/usr/bin/env node

/**
 * Module dependencies.
 */

import app from '../app.js'
import createDebugger from 'debug'
import http from 'http'
import { connectDB } from '../config/database.js'
import wss from '../lib/websocket.js'
import { cronUpdateGarden } from '../cron/updateGardenWeather.js'

const dbUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/homeGarden'
const maskedUrl = dbUrl.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')
console.log(`Attempting to connect to database: ${maskedUrl}`)

connectDB().then(() => {
  cronUpdateGarden()
}).catch(err => {
  console.error('Failed to connect to database.')
  console.error('1. Check if your DATABASE_URL is correct (no typos, no trailing spaces).')
  console.error('2. Ensure your MongoDB Atlas Cluster AllowList includes 0.0.0.0/0 (for Render).')
  console.error('3. Check if your cluster is paused.')
  console.error('Original Error:', err)
  process.exit(1)
})

if (process.env.NODE_ENV !== 'test') {
  process.on('SIGINT', () => {
    wss.close()
    process.exit()
  })
}

const debug = createDebugger('archioweb-api:server')
/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '3000')
app.set('port', port)

/**
 * Create HTTP server.
 */

const server = http.createServer(app)

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port)
server.on('error', onError)
server.on('listening', onListening)

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort (val) {
  const port = parseInt(val, 10)

  if (isNaN(port)) {
    // named pipe
    return val
  }

  if (port >= 0) {
    // port number
    return port
  }

  return false
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError (error) {
  if (error.syscall !== 'listen') {
    throw error
  }

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges')
      process.exit(1)
      break
    case 'EADDRINUSE':
      console.error(bind + ' is already in use')
      process.exit(1)
      break
    default:
      throw error
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening () {
  const addr = server.address()
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port
  debug('Listening on ' + bind)
}
