import { chai, expect } from './chai-setup.js'
import { after, before, beforeEach, describe, it } from 'mocha'
import app from '../app.js'
import Garden from '../models/gardenModel.js'
import User from '../models/userModel.js'
import Plant from '../models/plantModel.js'
import { connectDB, disconnectDB } from '../config/database.js'

describe('Sentinel: Plant IDOR Vulnerability Test', function () {
  let userAToken
  let userBToken
  let plantAId

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
    await Plant.deleteMany({})

    // --- User A Setup ---
    const userA = {
      identifier: 'usera@example.com',
      firstName: 'User',
      lastName: 'A',
      password: 'Password123!'
    }
    await chai.request(app).post('/api/users/register').send(userA)
    const loginA = await chai.request(app).post('/api/users/login').send({
      identifier: userA.identifier,
      password: userA.password
    })
    userAToken = loginA.body.data.token

    // User A creates Garden
    const gardenAData = {
      name: 'Garden A',
      location: { type: 'Point', coordinates: [0, 0] }
    }
    const gardenARes = await chai.request(app)
      .post('/api/gardens')
      .set('Authorization', `Bearer ${userAToken}`)
      .send(gardenAData)
    const gardenAId = gardenARes.body.data._id

    // User A creates Plant
    const plantAData = {
      commonName: 'Plant A',
      scientificName: 'Scientific A',
      family: 'Family A',
      exposure: 'Full Sun',
      garden: gardenAId
    }
    const plantARes = await chai.request(app)
      .post('/api/plants')
      .set('Authorization', `Bearer ${userAToken}`)
      .send(plantAData)
    plantAId = plantARes.body.data._id

    // --- User B Setup ---
    const userB = {
      identifier: 'userb@example.com',
      firstName: 'User',
      lastName: 'B',
      password: 'Password123!'
    }
    await chai.request(app).post('/api/users/register').send(userB)
    const loginB = await chai.request(app).post('/api/users/login').send({
      identifier: userB.identifier,
      password: userB.password
    })
    userBToken = loginB.body.data.token
  })

  it('should prevent User B from accessing User A\'s plant details', async function () {
    const res = await chai.request(app)
      .get(`/api/plants/${plantAId}`)
      .set('Authorization', `Bearer ${userBToken}`)

    // Currently this returns 200, but we want 403 or 404
    expect(res).to.have.status(403)
  })

  it('should allow User A to access their own plant details', async function () {
    const res = await chai.request(app)
      .get(`/api/plants/${plantAId}`)
      .set('Authorization', `Bearer ${userAToken}`)

    expect(res).to.have.status(200)
    expect(res.body.data._id).to.equal(plantAId)
  })
})
