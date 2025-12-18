import { chai, expect } from './chai-setup.js'
import chaiHttp from 'chai-http'
import { after, before, beforeEach, describe, it } from 'mocha'
import app from '../app.js'
import Garden from '../models/gardenModel.js'
import User from '../models/userModel.js'
import Plant from '../models/plantModel.js'
import { connectDB, disconnectDB } from '../config/database.js'



describe('Sentinel Security Tests - Data Leakage', function () {
  let ownerToken
  let attackerToken
  let ownerGardenId
  let ownerPlantId
  let attackerGardenId
  let attackerPlantId

  before(async function () {
    this.timeout(30000)
    await connectDB()
  })

  after(async function () {
    await disconnectDB()
  })

  beforeEach(async function () {
    this.timeout(10000)
    await Plant.deleteMany({})
    await Garden.deleteMany({})
    await User.deleteMany({})

    // 1. Create Owner
    const owner = {
      identifier: 'owner@example.com',
      firstName: 'Alice',
      lastName: 'Owner',
      password: 'password123'
    }
    await chai.request(app).post('/api/users/register').send(owner)
    const ownerLogin = await chai.request(app).post('/api/users/login').send({ identifier: owner.identifier, password: owner.password })
    ownerToken = ownerLogin.body.data.token

    // 2. Create Attacker
    const attacker = {
      identifier: 'attacker@example.com',
      firstName: 'Bob',
      lastName: 'Attacker',
      password: 'password123'
    }
    await chai.request(app).post('/api/users/register').send(attacker)
    const attackerLogin = await chai.request(app).post('/api/users/login').send({ identifier: attacker.identifier, password: attacker.password })
    attackerToken = attackerLogin.body.data.token

    // 3. Owner creates a garden and plant
    const ownerGardenData = {
      name: "Alice's Secret Garden",
      location: { type: 'Point', coordinates: [2.3522, 48.8566] }
    }
    const ownerGardenRes = await chai.request(app)
      .post('/api/gardens')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send(ownerGardenData)
    ownerGardenId = ownerGardenRes.body.data._id

    const ownerPlantData = {
      commonName: 'Top Secret Rose',
      scientificName: 'Rosa secreta',
      family: 'Rosaceae',
      exposure: 'Full Sun',
      garden: ownerGardenId
    }
    const ownerPlantRes = await chai.request(app)
      .post('/api/plants')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send(ownerPlantData)
    ownerPlantId = ownerPlantRes.body.data._id

    // 4. Attacker creates a garden and plant
    const attackerGardenData = {
      name: "Bob's Public Garden",
      location: { type: 'Point', coordinates: [2.3, 48.8] }
    }
    const attackerGardenRes = await chai.request(app)
      .post('/api/gardens')
      .set('Authorization', `Bearer ${attackerToken}`)
      .send(attackerGardenData)
    attackerGardenId = attackerGardenRes.body.data._id

    const attackerPlantData = {
      commonName: 'Common Weed',
      scientificName: 'Taraxacum',
      family: 'Asteraceae',
      exposure: 'Full Sun',
      garden: attackerGardenId
    }
    const attackerPlantRes = await chai.request(app)
      .post('/api/plants')
      .set('Authorization', `Bearer ${attackerToken}`)
      .send(attackerPlantData)
    attackerPlantId = attackerPlantRes.body.data._id
  })

  it('SECURE: Attacker CANNOT see Owner plants via getAllPlants', async function () {
    const res = await chai.request(app)
      .get('/api/plants')
      .set('Authorization', `Bearer ${attackerToken}`)

    expect(res).to.have.status(200)
    const plants = res.body.data

    // Verify attacker sees their own plant
    const myPlant = plants.find(p => p._id === attackerPlantId)
    expect(myPlant).to.not.be.undefined
    expect(myPlant.commonName).to.equal('Common Weed')

    // Verify attacker DOES NOT see owner's plant
    const leakedPlant = plants.find(p => p._id === ownerPlantId)
    expect(leakedPlant).to.be.undefined
  })
})
