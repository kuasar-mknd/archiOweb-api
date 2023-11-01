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
  before(async function () {
    process.env.DATABASE_URL = 'mongodb://localhost:27017/homeGardenTest'
    await connectDB()
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

  // Disconnect from the database after all tests have finished running
  after(async function () {
    await disconnectDB()
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

  /**
  describe('POST /api/gardens', function () {
    it('should create a new garden', function (done) {
      const gardenData = {
        name: 'My Lovely Garden',
        location: 'Backyard'
        // Add other fields as necessary
      };

      res = chai.request(app)
        .post('/api/gardens')
        .set('Authorization', `Bearer ${token}`) // Use the auth token
        .send(gardenData)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(201);
          expect(res.body).to.include.keys('name', 'location');
          // Add other assertions as necessary
          done();
        });
        console.log(res.body);
    });
  });
  */

  // Add more tests as needed for other operations
})
