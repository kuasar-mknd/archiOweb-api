import chai from 'chai'
import chaiHttp from 'chai-http'
import { after, before, describe, it } from 'mocha'
import app from '../app.js'
import { connectDB, disconnectDB } from '../config/database.js'

chai.use(chaiHttp)
const { expect } = chai

describe('Sentinel Reproduction - Public Garden Exposure', function () {
  before(async function () {
    this.timeout(30000)
    await connectDB()
  })

  after(async function () {
    await disconnectDB()
  })

  it('should FAIL if GET /api/gardens is accessible without authentication', async function () {
    const res = await chai.request(app).get('/api/gardens')

    console.log(`GET /api/gardens returned status: ${res.status}`)

    if (res.status === 401) {
        console.log("SUCCESS: Endpoint is protected.")
    } else {
        console.log("FAILURE: Endpoint is NOT protected.")
    }

    expect(res).to.have.status(401)
  })
})
