import mongoose from 'mongoose';
import { updateUser, createUser, deleteUser } from '../../services/userService.js';
import User from '../../models/userModel.js';
import { MongoMemoryServer } from 'mongodb-memory-server';

const RUNS = 1000;

async function runBenchmark() {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  await mongoose.connect(uri);

  // Setup: Create a user
  const userData = {
    identifier: `benchmark_${Date.now()}@test.com`,
    password: 'Password123!',
    firstName: 'Bench',
    lastName: 'Mark',
    birthDate: '1990-01-01'
  };

  let user;
  try {
     const hashedPassword = 'hashedpassword123';
     user = await User.create({
         ...userData,
         password: hashedPassword
     });
  } catch (e) {
    console.log("User creation error", e.message);
    process.exit(1);
  }

  const userId = user._id;

  console.log('Starting benchmark for updateUser...');
  const start = performance.now();

  for (let i = 0; i < RUNS; i++) {
    await updateUser(userId, { firstName: `Bench_${i}` });
  }

  const end = performance.now();
  console.log(`Total time for ${RUNS} updates: ${(end - start).toFixed(2)}ms`);
  console.log(`Average time per update: ${((end - start) / RUNS).toFixed(2)}ms`);

  // Cleanup
  await mongoose.disconnect();
  await mongod.stop();
}

runBenchmark();
