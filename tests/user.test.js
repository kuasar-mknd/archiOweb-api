import chai from 'chai'
import chaiHttp from 'chai-http'
import mongoose from 'mongoose'
import { after, before, describe, it } from 'mocha'
import app from '../app.js'
import User from '../models/userModel.js'

// Chai middleware for HTTP assertions
chai.use(chaiHttp)
const { expect } = chai

describe('User API Tests', function () {
  // Setup and teardown
  before(async function () {
    // Connect to a separate test database
    await mongoose.connect('mongodb://localhost:27017/homeGardenTest', {})
  })

  after(async function () {
    // Disconnect and cleanup the test database
    await User.deleteMany({})
    await mongoose.disconnect()
  })

  // Test the registration of a new user
  describe('POST /api/users/register', function () {
    it('should register a new user', function (done) {
      chai.request(app)
        .post('/api/users/register')
        .send({
          identifier: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          password: 'password'
        })
        .end((err, res) => {
          expect(err).to.be.equal(null)
          expect(res).to.have.status(201)
          expect(res.body).to.have.property(
            'message',
            'User created successfully'
          )
          done()
        })
    })
  })

  // Test the login functionality
  describe('POST /api/users/login', function () {
    it('should authenticate a user and return a token', function (done) {
      chai.request(app)
        .post('/api/users/login')
        .send({
          identifier: 'test@example.com',
          password: 'password'
        })
        .end((err, res) => {
          expect(err).to.be.equal(null)
          expect(res).to.have.status(200)
          expect(res.body).to.have.property('token')
          done()
        })
    })
  })

  // Add more tests for getUserById, updateUser, deleteUser as needed

  // Test fetching a user by ID
  // ...

  // Test updating a user's information
  // ...

  // Test deleting a user
  // ...
})
