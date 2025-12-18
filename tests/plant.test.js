import chai from 'chai'
import chaiHttp from 'chai-http'
import { after, before, beforeEach, describe, it } from 'mocha'
import app from '../app.js'
import Garden from '../models/gardenModel.js'
import User from '../models/userModel.js' 
import Plant from '../models/plantModel.js'
import sinon from 'sinon'
import { connectDB, disconnectDB } from '../config/database.js'

// Chai middleware
chai.use(chaiHttp)
const { expect } = chai

describe('Plants API Tests', function () {
  let token // Variable pour stocker le token d'authentification
  let createdGardenId
  let plantId // Pour stocker l'ID du jardin créé

  // Connect to the test database before running any tests
  // Setup and teardown
  before(async function () {
    this.timeout(30000) // Increase timeout for initial DB connection
    await connectDB()
  })

  after(async function () {
    await disconnectDB()
  })
  // Clear the test database before each test
  beforeEach(async function () {
    this.timeout(10000)
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

    token = res.body.data.token // Save the token for protected route tests

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

    createdGardenId = res.body.data._id // Save the ID of the created garden

    // Create a new plant
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
    plantId = res.body.data._id
  })

  afterEach(function () {
    sinon.restore()
  })

  describe('POST /api/plants', function () {
    it('should create a new plant with valid data', async function () {
      const plantData = {
        commonName: 'Nom commun',
        scientificName: 'Nom scientifique',
        family: 'Famille de la plante',
        exposure: 'Full Sun',
        garden: createdGardenId
      }
      const res = await chai.request(app)
        .post('/api/plants')
        .set('Authorization', `Bearer ${token}`)
        .send(plantData)

      expect(res).to.have.status(201)
      expect(res.body.data).to.include.keys('_id', 'commonName', 'scientificName') // et d'autres champs
    })

    it('should return error for unauthenticated user', async function () {
      const plantData = {
        commonName: 'Nom commun',
        scientificName: 'Nom scientifique',
        family: 'Famille de la plante',
        exposure: 'Full Sun',
        garden: createdGardenId
      }
      const res = await chai.request(app)
        .post('/api/plants')
        .send(plantData)

      expect(res).to.have.status(401)
    })

    it('should return error 422 when error in data is detected', async function () {
      const plantData = {
        commonName: 'Nom commun',
        scientificName: 'Nom scientifique',
        family: 'Famille de la plante',
        exposure: 'Full Sun',
        garden: 'nonexistent-id'
      }
      const res = await chai.request(app)
        .post('/api/plants')
        .set('Authorization', `Bearer ${token}`)
        .send(plantData)

      expect(res).to.have.status(422)
    })

    it('should return error 403 when user is not authorized to add plants to the garden', async function () {
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

      token = res.body.data.token
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

      expect(res).to.have.status(403)
    })

    it('should return error 500 when server error occurs', async function () {
      // Stubbing Garden.findById used in createPlant
      sinon.stub(Garden, 'findById').throws(new Error('Database error'))

      const plantData = {
        commonName: 'Nom commun',
        scientificName: 'Nom scientifique',
        family: 'Famille de la plante',
        exposure: 'Full Sun',
        garden: createdGardenId
      }
      const res = await chai.request(app)
        .post('/api/plants')
        .set('Authorization', `Bearer ${token}`)
        .send(plantData)

      expect(res).to.have.status(500)
    })

    it('should return error 404 when garden does not exist', async function () {
      const plantData = {
        commonName: 'Nom commun',
        scientificName: 'Nom scientifique',
        family: 'Famille de la plante',
        exposure: 'Full Sun',
        garden: createdGardenId
      }
      // Delete the garden
      await Garden.findByIdAndDelete(createdGardenId)
      const res = await chai.request(app)
        .post('/api/plants')
        .set('Authorization', `Bearer ${token}`)
        .send(plantData)

      expect(res).to.have.status(404)
    })
  })

  describe('GET /api/plants', function () {
    it('should get all plants', async function () {
      const res = await chai.request(app)
        .get('/api/plants')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body.data).to.be.an('array')
    })

    it('should handle server error', async function () {
      // Stubbing Plant.find
      sinon.stub(Plant, 'find').throws(new Error('Database error'))

      const res = await chai.request(app)
        .get('/api/plants')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(500)
    })
  })

  describe('GET /api/plants/:id', function () {
    it('should get a specific plant by ID', async function () {
      const res = await chai.request(app)
        .get('/api/plants/' + plantId)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body.data._id).to.equal(plantId)
    })

    it('should return 404 for non-existent plant ID', async function () {
      const res = await chai.request(app)
        .get('/api/plants/000000000000000000000000')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(404)
    })

    it('should return 401 for unauthenticated user', async function () {
      const res = await chai.request(app)
        .get('/api/plants/nonexistent-id')

      expect(res).to.have.status(401)
    })

    it('should return 500 for server error', async function () {
      // Stubbing Plant.findById
      sinon.stub(Plant, 'findById').throws(new Error('Database error'))

      const res = await chai.request(app)
        .get('/api/plants/' + plantId)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(500)
    })
  })

  describe('PUT /api/plants/:id', function () {
    it('should update a plant with valid data', async function () {
      const updatedData = {
        commonName: 'Nom commun mis à jour',
        scientificName: 'Nom scientifique mis à jour',
        family: 'Famille Modifiée',
        exposure: 'Partial Shade',
        garden: createdGardenId
      }
      const res = await chai.request(app)
        .put('/api/plants/' + plantId)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedData)

      expect(res).to.have.status(200)
    })

    it('should return 404 for non-existent plant ID', async function () {
      const updatedData = {
        commonName: 'Nom commun mis à jour',
        scientificName: 'Nom scientifique mis à jour',
        family: 'Famille Modifiée',
        exposure: 'Partial Shade',
        garden: createdGardenId
      }
      const res = await chai.request(app)
        .put('/api/plants/000000000000000000000000')
        .set('Authorization', `Bearer ${token}`)
        .send(updatedData)

      expect(res).to.have.status(404)
    })

    it('should return 401 for unauthenticated user', async function () {
      const updatedData = {
        commonName: 'Nom commun mis à jour',
        scientificName: 'Nom scientifique mis à jour',
        family: 'Famille Modifiée',
        exposure: 'Partial Shade',
        garden: createdGardenId
      }
      const res = await chai.request(app)
        .put('/api/plants/' + plantId)
        .send(updatedData)

      expect(res).to.have.status(401)
    })

    it('should return 403 for user not authorized to update the plant', async function () {
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

      token = res.body.data.token
      const updatedData = {
        commonName: 'Nom commun mis à jour',
        scientificName: 'Nom scientifique mis à jour',
        family: 'Famille Modifiée',
        exposure: 'Partial Shade',
        garden: createdGardenId
      }
      res = await chai.request(app)
        .put('/api/plants/' + plantId)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedData)
      expect(res).to.have.status(403)
    })

    it('should return 500 for server error', async function () {
      // Stubbing Plant.findById used in updatePlant
      sinon.stub(Plant, 'findById').throws(new Error('Database error'))

      const updatedData = {
        commonName: 'Nom commun mis à jour',
        scientificName: 'Nom scientifique mis à jour',
        family: 'Famille Modifiée',
        exposure: 'Partial Shade',
        garden: createdGardenId
      }
      const res = await chai.request(app)
        .put('/api/plants/' + plantId)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedData)

      expect(res).to.have.status(500)
    })

    it('should return 404 when garden does not exist', async function () {
      const updatedData = {
        commonName: 'Nom commun mis à jour',
        scientificName: 'Nom scientifique mis à jour',
        family: 'Famille Modifiée',
        exposure: 'Partial Shade',
        garden: createdGardenId
      }
      // delete the garden
      await Garden.findByIdAndDelete(createdGardenId)
      const res = await chai.request(app)
        .put('/api/plants/' + plantId)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedData)

      expect(res).to.have.status(404)
    })
  })

  describe('DELETE /api/plants/:id', function () {
    it('should delete a plant', async function () {
      const res = await chai.request(app)
        .delete('/api/plants/' + plantId)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(204)
    })

    it('should return 404 for non-existent plant ID', async function () {
      const res = await chai.request(app)
        .delete('/api/plants/000000000000000000000000')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(404)
    })

    it('should return 401 for unauthenticated user', async function () {
      const res = await chai.request(app)
        .delete('/api/plants/' + plantId)

      expect(res).to.have.status(401)
    })

    it('should return 403 for user not authorized to delete the plant', async function () {
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

      token = res.body.data.token
      res = await chai.request(app)
        .delete('/api/plants/' + plantId)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(403)
    })

    it('should return 500 for server error', async function () {
      // Stubbing Plant.findById used in deletePlant
      sinon.stub(Plant, 'findById').throws(new Error('Database error'))

      const res = await chai.request(app)
        .delete('/api/plants/' + plantId)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(500)
    })

    it('should return 404 when garden does not exist', async function () {
      // delete the garden
      await Garden.findByIdAndDelete(createdGardenId)
      const res = await chai.request(app)
        .delete('/api/plants/' + plantId)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(404)
    })
  })
})
