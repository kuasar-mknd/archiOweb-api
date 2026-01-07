import { expect } from 'chai'
import { after, before, describe, it } from 'mocha'
import WebSocket from 'ws'
import { startWebSocketServer } from '../lib/websocket.js'
import { connectDB, disconnectDB } from '../config/database.js'

describe('Sentinel - WebSocket DoS Protection', function () {
  let wss
  const wsPort = 3003

  // Setup DB and WS Server
  before(async function () {
    this.timeout(10000)
    await connectDB()
    if (wss) wss.close()
    wss = startWebSocketServer(wsPort)
  })

  after(async function () {
    if (wss) wss.close()
    await disconnectDB()
  })

  it('should REJECT messages larger than 50KB with code 1009', function (done) {
    const ws = new WebSocket(`ws://localhost:${wsPort}`)
    const largePayload = 'A'.repeat(51 * 1024) // 51KB

    ws.on('open', function () {
      ws.send(JSON.stringify({ type: 'test', data: largePayload }))
    })

    ws.on('close', function (code, reason) {
        try {
            expect(code).to.equal(1009) // Message Too Big
            done()
        } catch (e) {
            done(e)
        }
    })

    // If it doesn't close within 2 seconds, it means it accepted the payload (VULNERABLE)
    setTimeout(() => {
       // Check if connection is still open
       if (ws.readyState === WebSocket.OPEN) {
           ws.close()
           done(new Error('VULNERABILITY: Server accepted payload > 50KB'))
       }
    }, 2000)

    ws.on('error', (err) => {
        // Handle connection errors
        console.log('WS Client Error:', err)
    })
  })
})
