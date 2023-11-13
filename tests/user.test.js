import chai from 'chai'
import chaiHttp from 'chai-http'
import { after, before, beforeEach, describe, it } from 'mocha'
import app from '../app.js'
import { connectDB, disconnectDB } from '../config/database.js'

// Chai middleware for HTTP assertions
chai.use(chaiHttp)
const { expect } = chai

describe('User API Tests', function () {
  let token
  // Setup and teardown
  before(async function () {
    await connectDB()
  })

  after(async function () {
    await disconnectDB()
  })

  beforeEach(async function () {
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
    it('should not register a user with existing email', async function () {
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
          expect(res).to.have.status(400)
          expect(res.body).to.have.property(
            'message',
            'User already exists'
          )
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
    it('should not login user with incorrect credentials', async function () {
      chai.request(app)
        .post('/api/users/login')
        .send({
          identifier: 'test@example.com',
          password: 'pasdsword'
        })
        .end((err, res) => {
          expect(err).to.be.equal(null)
          expect(res).to.have.status(401)
          expect(res.body).to.have.property(
            'message',
            'Auth failed'
          )
        })
    })
  })

  describe('PUT /api/users', async function () {
    it('should update a user with valid data', async function () {
      const updateData = {
        identifier: 'testusernew@example.com'
      }
      const res = await chai.request(app)
        .put('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)

      expect(res).to.have.status(200)
      // Autres vérifications
    })

    // Tests pour la validation des autorisations et les données invalides
  })

  describe('DELETE /api/users/:id', function () {
    it('should delete a user', async function () {
      const res = await chai.request(app)
        .delete('/api/users/')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(204)
    })

    // Tests pour la validation des autorisations et les scénarios de non-existence
  })

  describe('GET /api/users/gardens', function () {
    it('should list gardens for a user', async function () {
      const res = await chai.request(app)
        .get('/api/users/gardens')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.be.an('array')
    })

    it('should return 404 for non-existent user', async function () {
      // Utilisez un ID utilisateur inexistant
      // ...
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
