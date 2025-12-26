import { expect } from 'chai'
import sinon from 'sinon'
import axios from 'axios'
import { getWeatherData } from '../services/weatherService.js'

describe('Weather Service Security - Timeout', () => {
  let axiosGetStub

  beforeEach(() => {
    axiosGetStub = sinon.stub(axios, 'get')
  })

  afterEach(() => {
    sinon.restore()
  })

  it('should include a timeout in the external API call to prevent DoS', async () => {
    // Mock successful response to avoid the function throwing due to response structure
    axiosGetStub.resolves({
      data: {
        current_weather: { temperature: 20, cloudcover: 10 },
        hourly: { precipitation: [] }
      }
    })

    const mockLocation = { coordinates: [2.35, 48.85] } // [long, lat]

    await getWeatherData(mockLocation)

    // Verify axios.get was called with a config object containing timeout
    sinon.assert.calledOnce(axiosGetStub)
    const callArgs = axiosGetStub.firstCall.args

    // axios.get(url, config)
    expect(callArgs[1]).to.be.an('object')
    expect(callArgs[1]).to.have.property('timeout')
    expect(callArgs[1].timeout).to.be.a('number')
    expect(callArgs[1].timeout).to.be.at.most(10000) // Expect sensible timeout <= 10s
  })
})
