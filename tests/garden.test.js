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
  let createdGardenId // Pour stocker l'ID du jardin créé

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

    // Create a new garden
    const gardenData = {
      name: 'Mon jardin',
      location: {
        type: 'Point',
        coordinates: [-73.856077, 40.848447] // Exemple de coordonnées [longitude, latitude]
      }
    }
    res = await chai
      .request(app)
      .post('/api/gardens')
      .set('Authorization', `Bearer ${token}`) // Use the auth token
      .send(gardenData)

    createdGardenId = res.body._id // Save the ID of the created garden
  })

  // Test cases
  describe('GET /api/gardens', function () {
    it('should get all gardens', async function () {
      const res = await chai.request(app)
        .get('/api/gardens')
        .set('Authorization', `Bearer ${token}`)
      expect(res).to.have.status(200)
      expect(res.body).to.be.an('array')
    })

    it('should get gardens near a specific location', async function () {
      const res = await chai.request(app)
        .get('/api/gardens?lat=40.7128&lng=-74.0060')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.be.an('array')
    })

    it('should return an error for invalid lat/lng', async function () {
      const res = await chai.request(app)
        .get('/api/gardens?lat=invalid&lng=invalid')
        .set('Authorization', `Bearer ${token}`)
      expect(res).to.have.status(400)
      expect(res.body).to.have.property('message', 'Invalid latitude or longitude')
    })

    it('should return 500 for server error', async function () {
      // Déconnecter la base de données
      await disconnectDB()

      const res = await chai.request(app)
        .get('/api/gardens')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(500)

      // Reconnecter la base de données
      await connectDB()
    })
  })

  describe('POST /api/gardens', function () {
    it('should create a new garden', async function () {
      const gardenData = {
        name: 'Mon jardin',
        location: {
          type: 'Point',
          coordinates: [-73.856077, 40.848447] // Exemple de coordonnées [longitude, latitude]
        }
      }
      const res = await chai.request(app)
        .post('/api/gardens')
        .set('Authorization', `Bearer ${token}`) // Use the auth token
        .send(gardenData)
      expect(res).to.have.status(201)
      expect(res.body).to.have.property(
        'name',
        'Mon jardin'
      )
    })

    it('should return an error for missing garden properties', async function () {
      const gardenData = {
        location: {
          type: 'Point',
          coordinates: [-73.856077, 40.848447] // Exemple de coordonnées [longitude, latitude]
        }
      }
      const res = await chai.request(app)
        .post('/api/gardens')
        .set('Authorization', `Bearer ${token}`) // Use the auth token
        .send(gardenData)
      expect(res).to.have.status(488)
    })

    it('should return 401 for unauthenticated user', async function () {
      const gardenData = {
        name: 'Mon jardin',
        location: {
          type: 'Point',
          coordinates: [-73.856077, 40.848447]
        }
      }
      const res = await chai.request(app)
        .post('/api/gardens')
        .send(gardenData)
      expect(res).to.have.status(401)
    })

    it('should return 500 server error', async function () {
      // Déconnecter la base de données
      await disconnectDB()

      const gardenData = {
        name: 'Mon jardin',
        location: {
          type: 'Point',
          coordinates: [-73.856077, 40.848447]
        }
      }
      const res = await chai.request(app)
        .post('/api/gardens')
        .set('Authorization', `Bearer ${token}`) // Use the auth token
        .send(gardenData)
      expect(res).to.have.status(500)
      // Reconnecter la base de données
      await connectDB()
    })
  })

  // Récupération d'un Jardin Spécifique par ID
  describe('GET /api/gardens/:id', function () {
    it('should get a specific garden by ID', async function () {
      const res = await chai.request(app)
        .get('/api/gardens/' + createdGardenId)
        .set('Authorization', `Bearer ${token}`)
      expect(res).to.have.status(200)
      expect(res.body).to.have.property('_id', createdGardenId)
    })

    it('should return an error for invalid garden ID', async function () {
      const res = await chai.request(app)
        .get('/api/gardens/invalid-id')
        .set('Authorization', `Bearer ${token}`)
      expect(res).to.have.status(404)
    })

    it('should return error 500 for server error', async function () {
      // Déconnecter la base de données
      await disconnectDB()

      const res = await chai.request(app)
        .get('/api/gardens/' + createdGardenId)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(500)

      // Reconnecter la base de données
      await connectDB()
    })
  })

  // Mise à Jour d'un Jardin
  describe('PUT /api/gardens/:id', function () {
    it('should update a garden', async function () {
      const updatedGardenData = {
        name: 'Jardin Mis à Jour',
        location: {
          type: 'Point',
          coordinates: [-73.856077, 40.848447] // Coordonnées mises à jour
        }
      }
      const res = await chai.request(app)
        .put('/api/gardens/' + createdGardenId)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedGardenData)
      expect(res).to.have.status(200)
      expect(res.body).to.have.property('name', 'Jardin Mis à Jour')
    })

    it('should return an error for invalid garden ID', async function () {
      const updatedGardenData = {
        name: 'Jardin Mis à Jour 2',
        location: {
          type: 'Point',
          coordinates: [-73.856077, 40.848447] // Coordonnées mises à jour
        }
      }
      const res = await chai.request(app)
        .put('/api/gardens/invalid-id')
        .set('Authorization', `Bearer ${token}`)
        .send(updatedGardenData)
      expect(res).to.have.status(404)
      expect(res.body).to.have.property('message', 'Invalid garden ID')
    })

    it('should return an error for unauthenticate user', async function () {
      const updatedGardenData = {
        name: 'Jardin Mis à Jour 2',
        location: {
          type: 'Point',
          coordinates: [-73.856077, 40.848447] // Coordonnées mises à jour
        }
      }
      const res = await chai.request(app)
        .put('/api/gardens/' + createdGardenId)
        .send(updatedGardenData)
      expect(res).to.have.status(401)
    })

    it('should return an error for unauthorize user', async function () {
      // Créer un nouvel utilisateur et login
      const newUser = {
        identifier: 'usertest2@exemple.com',
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

      const updatedGardenData = {
        name: 'Jardin Mis à Jour 2',
        location: {
          type: 'Point',
          coordinates: [-73.856077, 40.848447] // Coordonnées mises à jour
        }
      }
      res = await chai.request(app)
        .put('/api/gardens/' + createdGardenId)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedGardenData)
      expect(res).to.have.status(403)
    })

    it('should return 500 server error', async function () {
      // Déconnecter la base de données
      await disconnectDB()

      const updatedGardenData = {
        name: 'Jardin Mis à Jour 2',
        location: {
          type: 'Point',
          coordinates: [-73.856077, 40.848447] // Coordonnées mises à jour
        }
      }
      const res = await chai.request(app)
        .put('/api/gardens/' + createdGardenId)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedGardenData)

      expect(res).to.have.status(500)

      // Reconnecter la base de données
      await connectDB()
    })
  })

  // Suppression d'un Jardin
  describe('DELETE /api/gardens/:id', function () {
    it('should delete a garden', async function () {
      const res = await chai.request(app)
        .delete('/api/gardens/' + createdGardenId)
        .set('Authorization', `Bearer ${token}`)
      expect(res).to.have.status(204)
    })

    it('should return an error for invalid garden ID', async function () {
      const res = await chai.request(app)
        .delete('/api/gardens/invalid-id')
        .set('Authorization', `Bearer ${token}`)
      expect(res).to.have.status(404)
      expect(res.body).to.have.property('message', 'Invalid garden ID')
    })

    it('should return an error for unauthenticate user', async function () {
      const res = await chai.request(app)
        .delete('/api/gardens/' + createdGardenId)
      expect(res).to.have.status(401)
    })

    it('should return 403 for unauthorize user', async function () {
      // Créer un nouvel utilisateur et login
      const newUser = {
        identifier: 'usertest2@exemple.com',
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

      res = await chai.request(app)
        .delete('/api/gardens/' + createdGardenId)
        .set('Authorization', `Bearer ${token}`)
      expect(res).to.have.status(403)
    })

    it('should return 500 server error', async function () {
      // Déconnecter la base de données
      await disconnectDB()

      const res = await chai.request(app)
        .delete('/api/gardens/' + createdGardenId)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(500)

      // Reconnecter la base de données
      await connectDB()
    })
  })

  describe('GET /api/gardens/:id/plants', function () {
    it('should list plants in a specific garden', async function () {
      const res = await chai.request(app)
        .get('/api/gardens/' + createdGardenId + '/plants')
        .set('Authorization', `Bearer ${token}`)
      expect(res).to.have.status(200)
      expect(res.body).to.be.an('array')
    })

    it('should return 404 for a non-existent garden', async function () {
      const res = await chai.request(app)
        .get('/api/gardens/nonexistent-id/plants')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(404)
      expect(res.body).to.have.property('message', 'Invalid garden ID')
    })

    it('should return 403 for unauthorized access', async function () {
    // Créer un nouvel utilisateur et login
      const newUser = {
        identifier: 'usertest2@exemple.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password'
      }
      // Register a new user
      await chai
        .request(app)
        .post('/api/users/register')
        .send(newUser)

      // Log in to get a token
      let res = await chai.request(app).post('/api/users/login').send({
        identifier: newUser.identifier,
        password: newUser.password
      })

      token = res.body.token
      res = await chai.request(app)
        .get('/api/gardens/' + createdGardenId + '/plants')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(403)
      expect(res.body).to.have.property('message', 'Not authorized to get the plants from this garden')
    })

    it('should return 500 server error', async function () {
      // Déconnecter la base de données
      await disconnectDB()

      const res = await chai.request(app)
        .get('/api/gardens/' + createdGardenId + '/plants')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(500)

      // Reconnecter la base de données
      await connectDB()
    })
  })
})
