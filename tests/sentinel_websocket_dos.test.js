import WebSocket from 'ws'
import { expect } from 'chai'
import { startWebSocketServer } from '../lib/websocket.js'

describe('Sentinel: WebSocket DoS Protection', function () {
  let wss
  let serverPort = 3004

  before(function () {
    // Start WebSocket server on a different port for testing
    // We pass port 3004
    wss = startWebSocketServer(serverPort)
  })

  after(function (done) {
    if (wss) {
      wss.close(done)
    } else {
      done()
    }
  })

  it('should close connection when payload exceeds maxPayload', function (done) {
    this.timeout(2000)

    const ws = new WebSocket(`ws://localhost:${serverPort}`)

    ws.on('open', function () {
      // Create a large payload (e.g., 60KB if limit is 50KB)
      const largePayload = 'a'.repeat(60 * 1024)
      try {
        ws.send(JSON.stringify({ type: 'test', payload: largePayload }))
      } catch (e) {
        // ws send might fail
      }
    })

    ws.on('close', function (code, reason) {
      // 1009 is Message Too Big
      if (code === 1009) {
          done()
      } else {
          done(new Error(`Closed with unexpected code: ${code}`))
      }
    })

    // If it doesn't close, the test times out, effectively failing
  })
})
