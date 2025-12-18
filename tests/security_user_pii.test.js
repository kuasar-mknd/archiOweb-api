import { chai, expect } from './chai-setup.js'
import { after, before, beforeEach, describe, it } from 'mocha'
import app from '../app.js'
import User from '../models/userModel.js'
import { connectDB, disconnectDB } from '../config/database.js'

describe('Security: User PII Protection', function () {
  let userAToken
  let userBToken
  let userAId

  before(async function () {
    this.timeout(30000)
    await connectDB()
  })

  after(async function () {
    await disconnectDB()
  })

  beforeEach(async function () {
    await User.deleteMany({})

    // Register User A
    const resA = await chai.request(app).post('/api/users/register').send({
      identifier: 'userA@example.com',
      firstName: 'Alice',
      lastName: 'Smith',
      birthDate: '1990-01-01',
      password: 'password123'
    })
    userAId = resA.body.data._id

    // Login User A
    const loginA = await chai.request(app).post('/api/users/login').send({
      identifier: 'userA@example.com',
      password: 'password123'
    })
    userAToken = loginA.body.data.token

    // Register User B
    await chai.request(app).post('/api/users/register').send({
      identifier: 'userB@example.com',
      firstName: 'Bob',
      lastName: 'Jones',
      password: 'password123'
    })

    // Login User B
    const loginB = await chai.request(app).post('/api/users/login').send({
      identifier: 'userB@example.com',
      password: 'password123'
    })
    userBToken = loginB.body.data.token
  })

  it('should return full profile including PII when User A views their own profile', async function () {
    const res = await chai.request(app)
      .get(`/api/users/${userAId}`)
      .set('Authorization', `Bearer ${userAToken}`)

    expect(res).to.have.status(200)
    expect(res.body.data).to.have.property('identifier', 'userA@example.com')
    expect(res.body.data).to.have.property('birthDate')
    expect(res.body.data).to.have.property('firstName', 'Alice')
  })

  it('should return sanitized profile (NO PII) when User B views User A profile', async function () {
    const res = await chai.request(app)
      .get(`/api/users/${userAId}`)
      .set('Authorization', `Bearer ${userBToken}`)

    expect(res).to.have.status(200)
    expect(res.body.data).to.have.property('firstName', 'Alice')
    expect(res.body.data).to.not.have.property('identifier') // Should NOT see email
    expect(res.body.data).to.not.have.property('birthDate') // Should NOT see birthDate
  })

  it('should deny access to unauthenticated users', async function () {
    const res = await chai.request(app)
      .get(`/api/users/${userAId}`)

    // Currently returns 200, we want 401
    expect(res).to.have.status(401)
  })
})
