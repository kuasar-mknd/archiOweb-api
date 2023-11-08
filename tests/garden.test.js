import chai from 'chai'
import chaiHttp from 'chai-http'
import { after, before, beforeEach, describe, it } from 'mocha'
import app from '../app.js'
import Garden from '../models/gardenModel.js'
import User from '../models/userModel.js' // Assurez-vous d'importer le modèle User
import { connectDB, disconnectDB } from '../config/database.js'

// Chai middleware
chai.use(chaiHttp)
const { expect } = chai

describe('Garden API Tests', function () {
  let token // Variable pour stocker le token d'authentification

  // Connect to the test database before running any tests
  // Setup and teardown
  before(async function () {
    await connectDB()
  })

  after(async function () {
    await disconnectDB()
  })
  // Clear the test database before each test
  beforeEach(async function () {
    await Garden.deleteMany({})
    await User.deleteMany({})

    // Create a new user and get a token for testing
    const newUser = {
      identifier: 'testuser@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'password'
    }

    // Register a new user
    let res = await chai
      .request(app)
      .post('/api/users/register')
      .send(newUser)

    // Log in to get a token
    res = await chai.request(app).post('/api/users/login').send({
      identifier: newUser.identifier,
      password: newUser.password
    })

    token = res.body.token // Save the token for protected route tests
  })

  // Test cases
  describe('GET /api/gardens', function () {
    it('should get all gardens', function (done) {
      chai.request(app)
        .get('/api/gardens')
        .set('Authorization', `Bearer ${token}`) // Use the auth token
        .end((err, res) => {
          expect(err).to.be.equal(null)
          expect(res).to.have.status(200)
          expect(res.body).to.be.an('array')
          done()
        })
    })
  })

  describe('POST /api/gardens', function () {
    it('should create a new garden', function (done) {
      const gardenData = {
        name: 'Mon jardin',
        location: {
          type: 'Point',
          coordinates: [-73.856077, 40.848447] // Exemple de coordonnées [longitude, latitude]
        }
      }
      chai.request(app)
        .post('/api/gardens')
        .set('Authorization', `Bearer ${token}`) // Use the auth token
        .send(gardenData)
        .end((err, res) => {
          expect(err).to.be.equal(null)
          expect(res).to.have.status(201)
          expect(res.body).to.have.property(
            'name',
            'Mon jardin'
          )
          done()
        })
    })
  })

  // Add more tests as needed for other operations
})
