import { chai, expect } from './chai-setup.js'
import { after, before, describe, it } from 'mocha'
import app from '../app.js'
import User from '../models/userModel.js'
import { connectDB, disconnectDB } from '../config/database.js'

describe('Sentinel Security - Rate Limiting', function () {
  before(async function () {
    this.timeout(10000)
    process.env.TEST_RATE_LIMIT = 'true' // Enable rate limiting for this test suite
    await connectDB()
    await User.deleteMany({})
    // Create a user for login testing
    await User.create({
      identifier: 'ratelimit@example.com',
      password: 'Password123!',
      firstName: 'Rate',
      lastName: 'Limit'
    })
  })

  after(async function () {
    await User.deleteMany({})
    await disconnectDB()
    delete process.env.TEST_RATE_LIMIT // Cleanup
  })

  it('should rate limit login attempts', async function () {
    const loginDetails = {
      identifier: 'ratelimit@example.com',
      password: 'WrongPassword123!' // Use wrong password to be fast
    }

    // Login limiter allows 5 attempts
    for (let i = 0; i < 5; i++) {
      const res = await chai.request(app)
        .post('/api/users/login')
        .send(loginDetails)

      expect(res.status).to.not.equal(429)
    }

    // The 6th attempt should fail
    const res = await chai.request(app)
      .post('/api/users/login')
      .send(loginDetails)

    expect(res.status).to.equal(429) // Too Many Requests
    expect(res.body).to.have.property('message').that.includes('Too many login attempts')
  })

  it('should rate limit registration attempts', async function () {
      const baseUser = {
        password: 'Password123!',
        firstName: 'Rate',
        lastName: 'Limit'
      }

      // Register limiter allows 5 attempts
      for (let i = 0; i < 5; i++) {
        const res = await chai.request(app)
          .post('/api/users/register')
          .send({ ...baseUser, identifier: `spam${i}@example.com` })

        // Should succeed (201) or fail validation (422) but NOT 429
        expect(res.status).to.not.equal(429)
      }

      // The 6th attempt should fail
      const res = await chai.request(app)
        .post('/api/users/register')
        .send({ ...baseUser, identifier: 'spam_blocked@example.com' })

      expect(res.status).to.equal(429) // Too Many Requests
      expect(res.body).to.have.property('message').that.includes('Too many accounts created')
    })
})
