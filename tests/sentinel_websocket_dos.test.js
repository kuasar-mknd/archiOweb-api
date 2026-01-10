import { expect } from './chai-setup.js'
import { WebSocket } from 'ws'
import { startWebSocketServer } from '../lib/websocket.js'

describe('WebSocket Security - DoS Protection', () => {
  let wss
  let port = 4001 // Use a distinct port
  let wsClient

  before(async () => {
    wss = startWebSocketServer(port)
  })

  after(() => {
    if (wsClient && wsClient.readyState === WebSocket.OPEN) {
      wsClient.close()
    }
    if (wss) wss.close()
  })

  it('should close connection with code 1009 when payload > 50KB', (done) => {
    wsClient = new WebSocket(`ws://localhost:${port}`)
    let checkTimeout

    wsClient.on('open', () => {
      // 100KB payload (larger than 50KB limit)
      const hugePayload = JSON.stringify({
        type: 'test',
        data: 'a'.repeat(100 * 1024)
      })

      wsClient.send(hugePayload)

      // We wait to see if connection is closed
      checkTimeout = setTimeout(() => {
        try {
          // If connection is still open, the fix failed
          expect(wsClient.readyState).to.not.equal(WebSocket.OPEN)
          done(new Error('Connection remained open despite payload > limit'))
        } catch (e) {
          done(e)
        }
      }, 500)
    })

    wsClient.on('error', (err) => {
      // Client might emit error if connection is reset abruptly
    })

    wsClient.on('close', (code) => {
      clearTimeout(checkTimeout)
      try {
        expect(code).to.equal(1009) // 1009 = Message Too Big
        done()
      } catch (e) {
        done(e)
      }
    })
  })
})
