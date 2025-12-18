import { chai, expect } from './chai-setup.js'
import chaiHttp from 'chai-http'
import { after, before, beforeEach, describe, it } from 'mocha'
import app from '../app.js'
import User from '../models/userModel.js'
import { connectDB, disconnectDB } from '../config/database.js'



describe('Security: Timing Attacks', function () {
  this.timeout(60000)

  before(async function () {
    await connectDB()
  })

  after(async function () {
    await disconnectDB()
  })

  beforeEach(async function () {
    await User.deleteMany({})
    const newUser = {
      identifier: 'existing@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'password123',
      birthDate: '1990-01-01'
    }
    // Register via API to ensure proper hashing etc.
    await chai.request(app).post('/api/users/register').send(newUser)
  })

  it('should have consistent response time for existing vs non-existing users', async function () {
    const iterations = 5

    // Warmup
    await chai.request(app).post('/api/users/login').send({ identifier: 'existing@example.com', password: 'wrongpassword' })
    await chai.request(app).post('/api/users/login').send({ identifier: 'nonexistent@example.com', password: 'randompassword' })

    // Measure existing user (wrong password)
    let existingTotalTime = 0
    for (let i = 0; i < iterations; i++) {
      const start = performance.now()
      await chai.request(app).post('/api/users/login').send({ identifier: 'existing@example.com', password: 'wrongpassword' })
      const end = performance.now()
      existingTotalTime += (end - start)
    }
    const existingAvg = existingTotalTime / iterations

    // Measure non-existing user
    let nonExistingTotalTime = 0
    for (let i = 0; i < iterations; i++) {
      const start = performance.now()
      await chai.request(app).post('/api/users/login').send({ identifier: 'nonexistent@example.com', password: 'randompassword' })
      const end = performance.now()
      nonExistingTotalTime += (end - start)
    }
    const nonExistingAvg = nonExistingTotalTime / iterations

    console.log(`Average time for existing user: ${existingAvg.toFixed(2)}ms`)
    console.log(`Average time for non-existing user: ${nonExistingAvg.toFixed(2)}ms`)

    const difference = Math.abs(existingAvg - nonExistingAvg)
    console.log(`Difference: ${difference.toFixed(2)}ms`)

    // Assert that the difference is small (< 30ms) to ensure timing attack mitigation
    // Unmitigated difference is typically ~80ms with bcrypt cost 10
    expect(difference).to.be.lessThan(30)
  })
})
