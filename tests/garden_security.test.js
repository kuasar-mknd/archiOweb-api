import { chai, expect } from './chai-setup.js'
import chaiHttp from 'chai-http'
import { after, before, beforeEach, describe, it } from 'mocha'
import app from '../app.js'
import Garden from '../models/gardenModel.js'
import User from '../models/userModel.js'
import { connectDB, disconnectDB } from '../config/database.js'



describe('Sentinel Security Tests - Access Control Enforcement', function () {
  let ownerToken
  let attackerToken
  let gardenId

  before(async function () {
    this.timeout(30000)
    await connectDB()
  })

  after(async function () {
    await disconnectDB()
  })

  beforeEach(async function () {
    this.timeout(10000)
    await Garden.deleteMany({})
    await User.deleteMany({})

    // 1. Create Owner
    const owner = {
      identifier: 'owner@example.com',
      firstName: 'Alice',
      lastName: 'Owner',
      password: 'Password123!'
    }
    await chai.request(app).post('/api/users/register').send(owner)
    const ownerLogin = await chai.request(app).post('/api/users/login').send({ identifier: owner.identifier, password: owner.password })
    ownerToken = ownerLogin.body.data.token

    // 2. Create Attacker
    const attacker = {
      identifier: 'attacker@example.com',
      firstName: 'Bob',
      lastName: 'Attacker',
      password: 'Password123!'
    }
    await chai.request(app).post('/api/users/register').send(attacker)
    const attackerLogin = await chai.request(app).post('/api/users/login').send({ identifier: attacker.identifier, password: attacker.password })
    attackerToken = attackerLogin.body.data.token

    // 3. Owner creates a garden
    const gardenData = {
      name: "Alice's Secret Garden",
      location: { type: 'Point', coordinates: [2.3522, 48.8566] }
    }
    const gardenRes = await chai.request(app)
      .post('/api/gardens')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send(gardenData)
    gardenId = gardenRes.body.data._id
  })

  it('SECURE: Unauthenticated user cannot access garden details', async function () {
    const res = await chai.request(app).get(`/api/gardens/${gardenId}`)
    expect(res).to.have.status(401)
  })

  it('SECURE: Attacker cannot access Owner garden details', async function () {
    const res = await chai.request(app)
      .get(`/api/gardens/${gardenId}`)
      .set('Authorization', `Bearer ${attackerToken}`)

    expect(res).to.have.status(403)
  })

  it('SECURE: Owner can access their garden details', async function () {
    const res = await chai.request(app)
      .get(`/api/gardens/${gardenId}`)
      .set('Authorization', `Bearer ${ownerToken}`)

    expect(res).to.have.status(200)
    expect(res.body.data).to.have.property('name', "Alice's Secret Garden")
  })
})
