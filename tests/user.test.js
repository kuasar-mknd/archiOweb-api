import { chai, expect } from './chai-setup.js'
import { after, before, beforeEach, describe, it } from 'mocha'
import app from '../app.js'
import User from '../models/userModel.js'
import sinon from 'sinon'
import { connectDB, disconnectDB } from '../config/database.js'



describe('User API Tests', function () {
  let token
  // Setup and teardown
  before(async function () {
    this.timeout(30000)
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

    token = res.body.data.token
  })

  afterEach(function () {
    sinon.restore()
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

      expect(res).to.have.status(422)
    })

    it('should return error 500 for server errors', async function () {
      // Simuler une erreur de base de données
      sinon.stub(User, 'findOne').throws(new Error('Database error'))

      const res = await chai.request(app)
        .post('/api/users/register')
        .send({
          identifier: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          password: 'password'
        })

      expect(res).to.have.status(500)
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
      expect(res.body.data).to.have.property('token')
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
      // Simuler une erreur de base de données
      sinon.stub(User, 'findOne').throws(new Error('Database error'))

      const res = await chai.request(app)
        .post('/api/users/login')
        .send({
          identifier: 'test@example.com',
          password: 'pasdsword'
        })
      expect(res).to.have.status(500)
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
      // Simuler une erreur
      sinon.stub(User, 'findByIdAndUpdate').throws(new Error('Database error'))

      const updateData = {
        identifier: 'testusernew@example.com'
      }
      const res = await chai.request(app)
        .put('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)

      expect(res).to.have.status(500)
    })

    it('should return 404 for non-existent user', async function () {
      const updateData = {
        identifier: 'testusernew@example.com'
      }
      // delete user
      await chai.request(app)
        .delete('/api/users/')
        .set('Authorization', `Bearer ${token}`)
      const res = await chai.request(app)
        .put('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)

      expect(res).to.have.status(404)
    })
  })

  describe('DELETE /api/users', function () {
    it('should delete a user', async function () {
      const gardenData = {
        name: 'Mon jardin',
        location: {
          type: 'Point',
          coordinates: [-73.856077, 40.848447] // Exemple de coordonnées [longitude, latitude]
        }
      }
      let res = await chai.request(app)
        .post('/api/gardens')
        .set('Authorization', `Bearer ${token}`) // Use the auth token
        .send(gardenData)
      expect(res).to.have.status(201)

      const createdGardenId = res.body.data._id

      const plantData = {
        commonName: 'Nom commun',
        scientificName: 'Nom scientifique',
        family: 'Famille de la plante',
        exposure: 'Full Sun',
        garden: createdGardenId
      }
      res = await chai.request(app)
        .post('/api/plants')
        .set('Authorization', `Bearer ${token}`)
        .send(plantData)
      expect(res).to.have.status(201)

      res = await chai.request(app)
        .delete('/api/users/')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(204)
    })

    it('should return error 500 for server errors', async function () {
      // Simuler une erreur
      sinon.stub(User, 'findById').throws(new Error('Database error'))

      const res = await chai.request(app)
        .delete('/api/users/')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(500)
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
      expect(res.body.data).to.have.property('name', 'Test Garden')

      // Delete the user
      const res2 = await chai.request(app)
        .delete('/api/users/')
        .set('Authorization', `Bearer ${token}`)

      expect(res2).to.have.status(204)

      // Check that the garden was deleted
      const res3 = await chai.request(app)
        .get(`/api/gardens/${res.body.data._id}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res3).to.have.status(404)
    })

    it('should return 404 for non-existent user', async function () {
      await chai.request(app)
        .delete('/api/users/')
        .set('Authorization', `Bearer ${token}`)

      const res = await chai.request(app)
        .delete('/api/users/')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(404)
    })
  })

  describe('GET /api/users/gardens', function () {
    it('should list gardens for a user', async function () {
      const res = await chai.request(app)
        .get('/api/users/gardens')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body.data).to.be.an('array')
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
      // Simuler une erreur
      sinon.stub(User, 'findById').throws(new Error('Database error'))

      const res = await chai.request(app)
        .get('/api/users/gardens')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(500)
    })
  })

  describe('GET /api/users/:id', function () {
    it('should get a user by ID', async function () {
      const user = await User.findOne({ identifier: 'testuser@example.com' })
      const res = await chai.request(app)
        .get(`/api/users/${user._id}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body.data).to.have.property('identifier', 'testuser@example.com')
      expect(res.body.data).to.not.have.property('password')
    })

    it('should return 404 for non-existent user', async function () {
      const res = await chai.request(app)
        .get('/api/users/60f7e6e0b4e2a7001f7b8e1d') // Invalid ID
        .set('Authorization', `Bearer ${token}`)
      expect(res).to.have.status(404)
    })
  })
})
