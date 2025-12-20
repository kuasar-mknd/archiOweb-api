import { chai, expect } from './chai-setup.js'
import { after, before, describe, it } from 'mocha'
import app from '../app.js'
import User from '../models/userModel.js'
import Garden from '../models/gardenModel.js'
import { connectDB, disconnectDB } from '../config/database.js'
import jwt from 'jsonwebtoken'

describe('Sentinel Reproduction - Garden Leak', function () {
  let tokenA
  let userB
  let gardenB

  before(async function () {
    this.timeout(10000)
    await connectDB()

    // Cleanup
    await User.deleteMany({})
    await Garden.deleteMany({})

    // Create User A (Attacker)
    const userA = await User.create({
      identifier: 'attacker@example.com',
      password: 'password123',
      firstName: 'Attacker',
      lastName: 'User'
    })
    tokenA = jwt.sign({ userId: userA._id, identifier: userA.identifier }, process.env.JWT_SECRET)

    // Create User B (Victim)
    userB = await User.create({
      identifier: 'victim@example.com',
      password: 'password123',
      firstName: 'Victim',
      lastName: 'User'
    })

    // Create Garden for User B
    gardenB = await Garden.create({
      name: 'Secret Garden',
      location: { type: 'Point', coordinates: [0, 0] },
      user: userB._id
    })
  })

  after(async function () {
    await User.deleteMany({})
    await Garden.deleteMany({})
    await disconnectDB()
  })

  it('should prevent User A from listing User B\'s gardens', async function () {
    const res = await chai.request(app)
      .get('/api/gardens')
      .set('Authorization', `Bearer ${tokenA}`)

    expect(res).to.have.status(200)

    // Check if victim's garden is present
    const victimGarden = res.body.data.find(g => g._id === gardenB._id.toString())

    // If we find the garden, it's a leak!
    if (victimGarden) {
        console.log('⚠️ VULNERABILITY CONFIRMED: User A can see User B\'s garden in the list.')
    }

    expect(victimGarden).to.be.undefined
  })
})
