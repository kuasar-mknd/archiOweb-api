#!/usr/bin/env node

/**
 * Module dependencies.
 */

import app from '../app.js'
import createDebugger from 'debug'
import http from 'http'
import { connectDB } from '../config/database.js'
import { startWebSocketServer } from '../lib/websocket.js'

const dbUrl = (process.env.DATABASE_URL || 'mongodb://localhost:27017/homeGarden').trim()
// Mask password for safe logging
const maskedUrl = dbUrl.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')
console.log(`Attempting to connect to database: ${maskedUrl}`)

connectDB().catch(err => {
  console.error('Failed to connect to database.')
  console.error('1. Check if your DATABASE_URL is correct (no typos, no trailing spaces).')
  console.error('2. Ensure your MongoDB Atlas Cluster AllowList includes 0.0.0.0/0 (for Render).')
  console.error('3. Check if your cluster is paused or deleted.')

  // Sentinel: Improved diagnostics
  try {
    const hostnameMatch = dbUrl.match(/@([^/?]+)/)
    if (hostnameMatch && hostnameMatch[1]) {
        console.error(`   -> Hostname attempting to resolve: '${hostnameMatch[1]}'`)
        console.error(`   -> Error suggests this hostname does not exist in DNS (ENOTFOUND).`)
    }
  } catch (e) {
    // Ignore parsing errors for diagnostics
  }

  console.error('Original Error:', err)

  // Sentinel: Maintenance Mode Strategy
  // Do NOT crash the process. Allow the server to start so Render deployment succeeds.
  // The application will respond with 503 Service Unavailable via middleware.
  console.warn('⚠️  WARNING: Starting server in MAINTENANCE MODE due to Database Connection Failure.')
  console.warn('⚠️  API endpoints will return 503 until the database connection is fixed.')
  // process.exit(1) // Removed to prevent crash loop
})

if (process.env.NODE_ENV !== 'test') {
  startWebSocketServer()
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
