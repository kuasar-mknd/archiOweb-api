import { expect } from 'chai'
import { after, before, beforeEach, describe, it } from 'mocha'
import WebSocket from 'ws'
import { startWebSocketServer } from '../lib/websocket.js'
import Garden from '../models/gardenModel.js'
import User from '../models/userModel.js'
import { connectDB, disconnectDB } from '../config/database.js'
import jwt from 'jsonwebtoken'

describe('Sentinel - WebSocket Data Leak', function () {
  let wss
  const wsPort = 3002
  let tokenUserA
  let userAId
  let gardenAId

  // Setup DB and WS Server
  before(async function () {
    this.timeout(30000)
    await connectDB()
    if (wss) wss.close()
    wss = startWebSocketServer(wsPort)
  })

  after(async function () {
    if (wss) wss.close()
    await disconnectDB()
  })

  beforeEach(async function () {
    this.timeout(10000)
    await Garden.deleteMany({})
    await User.deleteMany({})

    // Create User A
    const userA = await User.create({
      identifier: 'usera@example.com',
      password: 'password',
      firstName: 'User',
      lastName: 'A'
    })

    userAId = userA._id
    tokenUserA = jwt.sign({ userId: userA._id, identifier: userA.identifier }, process.env.JWT_SECRET || 'testsecret')

    // Create Garden for User A at [lng, lat] = [2.3522, 48.8566]
    const gardenA = await Garden.create({
      name: "User A's Secret Garden",
      location: {
        type: 'Point',
        coordinates: [2.3522, 48.8566]
      },
      user: userAId
    })
    gardenAId = gardenA._id
  })

  it('CRITICAL: getNearbyGardens should NOT return private gardens to unauthenticated users', function (done) {
    const ws = new WebSocket(`ws://localhost:${wsPort}`)

    ws.on('open', function () {
      const request = {
        type: 'getNearbyGardens',
        latitude: 2.3522,
        longitude: 48.8566
      }
      ws.send(JSON.stringify(request))
    })

    ws.on('message', function (data) {
      const response = JSON.parse(data)
      try {
        if (Array.isArray(response)) {
            const leakedGarden = response.find(g => g._id === gardenAId.toString())
            expect(leakedGarden, 'Security Vulnerability: Private garden leaked to unauthenticated user via WebSocket').to.be.undefined
        } else {
             // Likely error message: { error: 'No token...' }
             expect(response).to.have.property('error')
        }
        ws.close()
        done()
      } catch (err) {
        ws.close()
        done(err)
      }
    })
  })

  it('should not return other users gardens even if authenticated as different user', function (done) {
    // Create User B
    const userBId = new User({ identifier: 'userb@example.com' })._id
    const tokenUserB = jwt.sign({ userId: userBId, identifier: 'userb@example.com' }, process.env.JWT_SECRET || 'testsecret')

    const ws = new WebSocket(`ws://localhost:${wsPort}`)

    ws.on('open', function () {
      const request = {
        type: 'getNearbyGardens',
        token: tokenUserB,
        latitude: 2.3522,
        longitude: 48.8566
      }
      ws.send(JSON.stringify(request))
    })

    ws.on('message', function (data) {
      const response = JSON.parse(data)
      try {
        if (Array.isArray(response)) {
            const leakedGarden = response.find(g => g._id === gardenAId.toString())
            expect(leakedGarden, 'Security Vulnerability: Private garden leaked to another user via WebSocket').to.be.undefined
        }
        ws.close()
        done()
      } catch (err) {
        ws.close()
        done(err)
      }
    })
  })

  it('should return OWN gardens when authenticated', function (done) {
    const ws = new WebSocket(`ws://localhost:${wsPort}`)

    ws.on('open', function () {
      const request = {
        type: 'getNearbyGardens',
        token: tokenUserA,
        latitude: 2.3522,
        longitude: 48.8566
      }
      ws.send(JSON.stringify(request))
    })

    ws.on('message', function (data) {
      const response = JSON.parse(data)
      try {
        expect(Array.isArray(response), 'Response should be an array').to.be.true
        const myGarden = response.find(g => g._id === gardenAId.toString())
        expect(myGarden, 'User should see their own garden').to.not.be.undefined
        ws.close()
        done()
      } catch (err) {
        ws.close()
        done(err)
      }
    })
  })
})
