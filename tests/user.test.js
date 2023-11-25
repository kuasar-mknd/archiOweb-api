import chai from 'chai'
import chaiHttp from 'chai-http'
import { after, before, beforeEach, describe, it } from 'mocha'
import app from '../app.js'
import { connectDB, disconnectDB } from '../config/database.js'
import User from '../models/userModel.js'

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
    await User.deleteMany({})
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

    token = res.body.token
  })

  describe('POST /api/users/register', function () {
    it('should register a new user', async function () {
      const res = await chai.request(app)
        .post('/api/users/register')
        .send({
          identifier: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          password: 'password'
        })
      expect(res).to.have.status(201)
      expect(res.body).to.have.property(
        'message',
        'User created successfully'
      )
    })

    it('should not register a user with existing email', async function () {
      const res = await chai.request(app)
        .post('/api/users/register')
        .send({
          identifier: 'testuser@example.com',
          firstName: 'Test',
          lastName: 'User',
          password: 'password'
        })
      expect(res).to.have.status(400)
      expect(res.body).to.have.property(
        'message',
        'User already exists'
      )
    })

    it('should not register a user with invalid data', async function () {
      const res = await chai.request(app)
        .post('/api/users/register')
        .send({
          identifier: 'test',
          password: 'pass',
          firstName: 'Test',
          lastName: 'User'
        })

      expect(res).to.have.status(400)
    })

    it('should return error 500 for server errors', async function () {
      // Déconnecter la base de données
      await disconnectDB()
      const res = await chai.request(app)
        .post('/api/users/register')
        .send({
          identifier: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          password: 'password'
        })

      expect(res).to.have.status(500)

      // Reconnecter la base de données
      await connectDB()
    })
  })

  describe('POST /api/users/login', function () {
    it('should authenticate a user and return a token', async function () {
      const res = await chai.request(app)
        .post('/api/users/login')
        .send({
          identifier: 'testuser@example.com',
          password: 'password'
        })
      expect(res).to.have.status(200)
      expect(res.body).to.have.property('token')
    })

    it('should not login user with incorrect credentials', async function () {
      const res = await chai.request(app)
        .post('/api/users/login')
        .send({
          identifier: 'test@example.com',
          password: 'pasdsword'
        })
      expect(res).to.have.status(401)
      expect(res.body).to.have.property(
        'message',
        'Auth failed'
      )
    })

    it('should return error 500 for server errors', async function () {
      // Déconnecter la base de données
      await disconnectDB()

      const res = await chai.request(app)
        .post('/api/users/login')
        .send({
          identifier: 'test@example.com',
          password: 'pasdsword'
        })
      expect(res).to.have.status(500)

      // Reconnecter la base de données
      await connectDB()
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

    it('should return error 500 for server errors', async function () {
      // Déconnecter la base de données
      await disconnectDB()

      const updateData = {
        identifier: 'testusernew@example.com'
      }
      const res = await chai.request(app)
        .put('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)

      expect(res).to.have.status(500)

      // Reconnecter la base de données
      await connectDB()
    })
  })

  describe('DELETE /api/users', function () {
    it('should delete a user', async function () {
      const res = await chai.request(app)
        .delete('/api/users/')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(204)
    })

    it('should return error 500 for server errors', async function () {
      // Déconnecter la base de données
      await disconnectDB()

      const res = await chai.request(app)
        .delete('/api/users/')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(500)

      // Reconnecter la base de données
      await connectDB()
    })

    it('should delete a user and associated gardens', async function () {
      // Create a garden
      const res = await chai.request(app)
        .post('/api/gardens')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Garden',
          location: {
            type: 'Point',
            coordinates: [-73.856077, 40.848447] // Exemple de coordonnées [longitude, latitude]
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.have.property('name', 'Test Garden')

      // Delete the user
      const res2 = await chai.request(app)
        .delete('/api/users/')
        .set('Authorization', `Bearer ${token}`)

      expect(res2).to.have.status(204)

      // Check that the garden was deleted
      const res3 = await chai.request(app)
        .get(`/api/gardens/${res.body._id}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res3).to.have.status(404)
    })
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
      let res = await chai.request(app)
        .delete('/api/users/')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(204)
      res = await chai.request(app)
        .get('/api/users/gardens')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(404)
    })

    it('should return error 500 for server errors', async function () {
      // Déconnecter la base de données
      await disconnectDB()

      const res = await chai.request(app)
        .get('/api/users/gardens')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(500)

      // Reconnecter la base de données
      await connectDB()
    })
  })
})
