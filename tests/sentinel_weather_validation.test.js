import { expect } from 'chai'
import sinon from 'sinon'
import axios from 'axios'
import { getWeatherData } from '../services/weatherService.js'

describe('Sentinel Security - Weather Service Input Validation', () => {
  let axiosGetStub

  beforeEach(() => {
    // Stub axios to prevent actual network calls, though validation should fail before this.
    axiosGetStub = sinon.stub(axios, 'get').resolves({
      data: {
        current_weather: { temperature: 20, cloudcover: 10 },
        hourly: { precipitation: [] }
      }
    })
  })

  afterEach(() => {
    sinon.restore()
  })

  it('should throw error if location is missing', async () => {
    try {
      await getWeatherData(null)
      expect.fail('Should have thrown an error')
    } catch (error) {
      expect(error.message).to.equal('Invalid location data')
      sinon.assert.notCalled(axiosGetStub)
    }
  })

  it('should throw error if coordinates are missing', async () => {
    try {
      await getWeatherData({})
      expect.fail('Should have thrown an error')
    } catch (error) {
      expect(error.message).to.equal('Invalid location data')
      sinon.assert.notCalled(axiosGetStub)
    }
  })

  it('should throw error if coordinates are not an array of length 2', async () => {
    try {
      await getWeatherData({ coordinates: [1] })
      expect.fail('Should have thrown an error')
    } catch (error) {
      expect(error.message).to.equal('Invalid coordinates format')
      sinon.assert.notCalled(axiosGetStub)
    }
  })

  it('should throw error if coordinates contain non-numbers', async () => {
    try {
      await getWeatherData({ coordinates: ["1", 2] })
      expect.fail('Should have thrown an error')
    } catch (error) {
      expect(error.message).to.equal('Invalid coordinates values')
      sinon.assert.notCalled(axiosGetStub)
    }
  })

  it('should throw error if latitude is out of range', async () => {
    try {
      // [longitude, latitude]
      await getWeatherData({ coordinates: [0, 91] })
      expect.fail('Should have thrown an error')
    } catch (error) {
      expect(error.message).to.equal('Latitude must be between -90 and 90')
      sinon.assert.notCalled(axiosGetStub)
    }
  })

  it('should throw error if longitude is out of range', async () => {
    try {
      // [longitude, latitude]
      await getWeatherData({ coordinates: [181, 0] })
      expect.fail('Should have thrown an error')
    } catch (error) {
      expect(error.message).to.equal('Longitude must be between -180 and 180')
      sinon.assert.notCalled(axiosGetStub)
    }
  })

  it('should succeed with valid inputs', async () => {
    // Use unique coordinates to avoid hitting the in-memory cache if other tests ran first
    const uniqueLong = 2.35 + Math.random()
    const uniqueLat = 48.85 + Math.random()
    const result = await getWeatherData({ coordinates: [uniqueLong, uniqueLat] })
    expect(result).to.have.property('temperature')
    sinon.assert.calledOnce(axiosGetStub)
  })
})
