import { chai, expect } from './chai-setup.js'
import { before, after, describe, it } from 'mocha'
import app from '../app.js'
import { connectDB, disconnectDB } from '../config/database.js'

describe('Security: Rate Limiting', function () {
  before(async function () {
    this.timeout(30000)
    process.env.TEST_RATE_LIMIT = 'true'
    await connectDB()
  })

  after(async function () {
    delete process.env.TEST_RATE_LIMIT
    await disconnectDB()
  })

  it('should block excessive login attempts', async function () {
    this.timeout(10000)

    const loginData = {
      identifier: 'attacker@example.com',
      password: 'wrongpassword'
    }

    // Make 5 requests (allowed limit is 5)
    for (let i = 0; i < 5; i++) {
      const res = await chai.request(app)
        .post('/api/users/login')
        .send(loginData)

      // We expect 401 because auth fails, but NOT 429 yet
      expect(res.status).to.not.equal(429)
    }

    // The 6th request should fail with 429
    const res = await chai.request(app)
      .post('/api/users/login')
      .send(loginData)

    expect(res).to.have.status(429)
    expect(res.body.success).to.be.false
    expect(res.body.message).to.include('Too many login attempts')
  })
})
