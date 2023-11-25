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

describe('Plants API Tests', function () {
  let token // Variable pour stocker le token d'authentification
  let createdGardenId
  let plantId // Pour stocker l'ID du jardin créé

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
    plantId = res.body._id
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
      expect(res.body).to.include.keys('_id', 'commonName', 'scientificName') // et d'autres champs
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

    it('should return error 488 when error in data is detected', async function () {
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

      expect(res).to.have.status(488)
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

      token = res.body.token
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
      await disconnectDB()

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
      await connectDB()
    })
  })

  describe('GET /api/plants', function () {
    it('should get all plants', async function () {
      const res = await chai.request(app)
        .get('/api/plants')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.be.an('array')
    })

    it('should handle server error', async function () {
      // Déconnecter la base de données
      await disconnectDB()

      const res = await chai.request(app)
        .get('/api/plants')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(500)

      // Reconecter la base de données
      await connectDB()
    })
  })

  describe('GET /api/plants/:id', function () {
    it('should get a specific plant by ID', async function () {
      const res = await chai.request(app)
        .get('/api/plants/' + plantId)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body._id).to.equal(plantId)
    })

    it('should return 404 for non-existent plant ID', async function () {
      const res = await chai.request(app)
        .get('/api/plants/nonexistent-id')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(404)
    })

    it('should return 401 for unauthenticated user', async function () {
      const res = await chai.request(app)
        .get('/api/plants/nonexistent-id')

      expect(res).to.have.status(401)
    })

    it('should return 500 for server error', async function () {
      // Déconnecter la base de données
      await disconnectDB()

      const res = await chai.request(app)
        .get('/api/plants/' + plantId)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(500)

      // Reconecter la base de données
      await connectDB()
    })
  })

  describe('PUT /api/plants/:id', function () {
    it('should update a plant with valid data', async function () {
      const updatedData = {
        commonName: 'Nom commun mis à jour',
        scientificName: 'Nom scientifique mis à jour'
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
        scientificName: 'Nom scientifique mis à jour'
      }
      const res = await chai.request(app)
        .put('/api/plants/nonexistent-id')
        .set('Authorization', `Bearer ${token}`)
        .send(updatedData)

      expect(res).to.have.status(404)
    })

    it('should return 401 for unauthenticated user', async function () {
      const updatedData = {
        commonName: 'Nom commun mis à jour',
        scientificName: 'Nom scientifique mis à jour'
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

      token = res.body.token
      const updatedData = {
        commonName: 'Nom commun mis à jour',
        scientificName: 'Nom scientifique mis à jour'
      }
      res = await chai.request(app)
        .put('/api/plants/' + plantId)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedData)
      expect(res).to.have.status(403)
    })

    it('should return 500 for server error', async function () {
      // Déconnecter la base de données
      await disconnectDB()

      const updatedData = {
        commonName: 'Nom commun mis à jour',
        scientificName: 'Nom scientifique mis à jour'
      }
      const res = await chai.request(app)
        .put('/api/plants/' + plantId)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedData)

      expect(res).to.have.status(500)

      // Reconecter la base de données
      await connectDB()
    })

    // TO DO : erreur 404 si garden n'existe pas mais je sais pas comment faire
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
        .delete('/api/plants/nonexistent-id')
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

      token = res.body.token
      res = await chai.request(app)
        .delete('/api/plants/' + plantId)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(403)
    })

    it('should return 500 for server error', async function () {
      // Déconnecter la base de données
      await disconnectDB()

      const res = await chai.request(app)
        .delete('/api/plants/' + plantId)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(500)

      // Reconecter la base de données
      await connectDB()
    })

    // Ajoutez d'autres tests pour d'autres cas
  })
})
