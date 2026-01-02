import { WebSocket } from 'ws'
import { expect } from 'chai'
import { startWebSocketServer } from '../lib/websocket.js'

describe('Sentinel: WebSocket Max Payload Protection', function () {
  let wss
  let serverPort = 3002
  let wsClient

  before(function () {
    // Start a separate WebSocket server for this test
    wss = startWebSocketServer(serverPort)
  })

  after(function (done) {
    if (wsClient) {
      wsClient.terminate()
    }
    wss.close(done)
  })

  it('should terminate connection when payload exceeds limit (DoS protection)', function (done) {
    this.timeout(5000)
    wsClient = new WebSocket(`ws://localhost:${serverPort}`)

    wsClient.on('open', function () {
      // Create a payload larger than 50KB (e.g., 60KB)
      const largePayload = 'a'.repeat(60 * 1024)

      // Sending a large payload should trigger the server to close the connection
      wsClient.send(largePayload)
    })

    wsClient.on('error', (err) => {
        // Some clients might emit error on close
        // verify it's related to connection closure if possible, or just ignore
    })

    wsClient.on('close', function (code, reason) {
      // code 1009 is 'Message Too Big'
      expect(code).to.equal(1009)
      done()
    })
  })

  it('should accept payloads within the limit', function (done) {
    const validWsClient = new WebSocket(`ws://localhost:${serverPort}`)

    validWsClient.on('open', function () {
      const smallPayload = JSON.stringify({ type: 'ping' })
      validWsClient.send(smallPayload)
      // If we don't get disconnected immediately, it's a pass for this specific test logic
      // Ideally we'd wait for a response, but the server might error on 'ping' type unknown
      // For this test, just ensuring it doesn't close with 1009 is enough.

      setTimeout(() => {
        validWsClient.close()
        done()
      }, 500)
    })

    validWsClient.on('close', (code) => {
      if (code === 1009) {
        done(new Error('Connection closed with Message Too Big for valid payload'))
      }
    })
  })
})
