import { expect } from 'chai'
import User from '../models/userModel.js'
import { connectDB, disconnectDB } from '../config/database.js'

describe('Sentinel: Password Leak Check', function () {
  before(async function () {
    await connectDB()
  })

  after(async function () {
    await disconnectDB()
  })

  it('should NOT return password by default (Secure)', async function () {
    await User.deleteMany({})
    const newUser = new User({
      identifier: 'leaktest@example.com',
      firstName: 'Leak',
      lastName: 'Test',
      password: 'hashedpassword'
    })
    await newUser.save()

    const user = await User.findOne({ identifier: 'leaktest@example.com' })
    expect(user).to.exist
    // Checking Mongoose default behavior with select: false
    expect(user.password).to.be.undefined
  })
})
