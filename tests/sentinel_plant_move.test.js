import { expect } from './chai-setup.js';
import { chai } from './chai-setup.js';
import app from '../app.js';
import User from '../models/userModel.js';
import Garden from '../models/gardenModel.js';
import Plant from '../models/plantModel.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/database.js';

const request = chai.request;

describe('Sentinel: Plant IDOR/BAC Vulnerability Check', () => {
  let userA, userB;
  let tokenA, tokenB;
  let gardenA, gardenB;
  let plantA;

  before(async () => {
    await connectDB();
    // Clear DB
    await User.deleteMany({});
    await Garden.deleteMany({});
    await Plant.deleteMany({});

    // Create User A
    userA = await User.create({
      identifier: 'usera@example.com',
      password: 'Password123!',
      firstName: 'User',
      lastName: 'A'
    });
    tokenA = jwt.sign({ userId: userA._id, identifier: userA.identifier }, process.env.JWT_SECRET || 'testsecret');

    // Create User B
    userB = await User.create({
      identifier: 'userb@example.com',
      password: 'Password123!',
      firstName: 'User',
      lastName: 'B'
    });
    tokenB = jwt.sign({ userId: userB._id, identifier: userB.identifier }, process.env.JWT_SECRET || 'testsecret');

    // Create Garden A (owned by User A)
    gardenA = await Garden.create({
      name: 'Garden A',
      location: { type: 'Point', coordinates: [0, 0] },
      user: userA._id
    });

    // Create Garden B (owned by User B)
    gardenB = await Garden.create({
      name: 'Garden B',
      location: { type: 'Point', coordinates: [0, 0] },
      user: userB._id
    });

    // Create Plant in Garden A
    plantA = await Plant.create({
      commonName: 'Rose',
      scientificName: 'Rosa',
      family: 'Rosaceae',
      exposure: 'Full Sun',
      garden: gardenA._id
    });
  });

  after(async () => {
     await User.deleteMany({});
     await Garden.deleteMany({});
     await Plant.deleteMany({});
     await disconnectDB();
  });

  it('should allow User A to update their own plant (sanity check)', async () => {
    const res = await request(app)
      .put(`/api/plants/${plantA._id}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        commonName: 'Updated Rose',
        scientificName: 'Rosa',
        family: 'Rosaceae',
        exposure: 'Full Sun',
        garden: gardenA._id // Keeping same garden
      });

    if (res.status === 422) {
       console.log('Sanity Check Failed - 422 Errors:', JSON.stringify(res.body.errors, null, 2));
    }

    expect(res).to.have.status(200);
    expect(res.body.data.commonName).to.equal('Updated Rose');
  });

  it('should prevent User A from moving their plant to User B\'s garden', async () => {
    const res = await request(app)
      .put(`/api/plants/${plantA._id}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        commonName: 'Rose', // Required fields
        scientificName: 'Rosa',
        family: 'Rosaceae',
        exposure: 'Full Sun',
        garden: gardenB._id // Trying to move to User B's garden
      });

    // If vulnerability exists, this will return 200.
    // We expect 403 Forbidden.
    if (res.status === 200) {
        console.log("⚠️ VULNERABILITY CONFIRMED: User A moved plant to User B's garden.");
    }

    expect(res).to.have.status(403);
    expect(res.body.message).to.include('Not authorized');
  });
});
