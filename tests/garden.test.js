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

    it('should return an error for missing garden name', function (done) {
      const gardenData = {
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
          expect(res).to.have.status(400)
          expect(err).to.be.equal(null)
          done()
        })
    })
  })

  // Récupération d'un Jardin Spécifique par ID
  describe('GET /api/gardens/:id', function () {
    it('should get a specific garden by ID', function (done) {
      chai.request(app)
        .get('/api/gardens/' + createdGardenId)
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(err).to.be.equal(null)
          expect(res).to.have.status(200)
          expect(res.body).to.have.property('_id', createdGardenId)
          done()
        })
    })
  })

  // Mise à Jour d'un Jardin
  describe('PUT /api/gardens/:id', function () {
    it('should update a garden', function (done) {
      const updatedGardenData = {
        name: 'Jardin Mis à Jour',
        location: {
          type: 'Point',
          coordinates: [-73.856077, 40.848447] // Coordonnées mises à jour
        }
      }
      chai.request(app)
        .put('/api/gardens/' + createdGardenId)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedGardenData)
        .end((err, res) => {
          expect(err).to.be.equal(null)
          expect(res).to.have.status(200)
          expect(res.body).to.have.property('name', 'Jardin Mis à Jour')
          done()
        })
    })
    it('should return an error for invalid garden ID', function (done) {
      const updatedGardenData = { /* vos données mises à jour */ }
      chai.request(app)
        .put('/api/gardens/invalid-id')
        .set('Authorization', `Bearer ${token}`)
        .send(updatedGardenData)
        .end((err, res) => {
          expect(res).to.have.status(400)
          expect(res.body).to.have.property('message', 'Invalid garden ID')
          expect(err).to.be.equal(null)
          done()
        })
    })
  })

  // Suppression d'un Jardin
  describe('DELETE /api/gardens/:id', function () {
    it('should delete a garden', function (done) {
      chai.request(app)
        .delete('/api/gardens/' + createdGardenId)
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(err).to.be.equal(null)
          expect(res).to.have.status(204)
          done()
        })
    })
  })

  describe('GET /api/gardens with query parameters', function () {
    it('should get gardens near a specific location', function (done) {
      chai.request(app)
        .get('/api/gardens?lat=40.7128&lng=-74.0060')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(err).to.be.equal(null)
          expect(res).to.have.status(200)
          expect(res.body).to.be.an('array')
          done()
        })
    })

    it('should return an error for invalid lat/lng', function (done) {
      chai.request(app)
        .get('/api/gardens?lat=invalid&lng=invalid')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(res).to.have.status(400)
          expect(res.body).to.have.property('message', 'Invalid latitude or longitude')
          expect(err).to.be.equal(null)
          done()
        })
    })

    // Plus de tests pour la pagination et autres scénarios
  })
})
