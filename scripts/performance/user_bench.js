
import mongoose from 'mongoose';
import User from '../../models/userModel.js';
import { connectDB } from '../../config/database.js';
import { createUser } from '../../services/userService.js';

const runBenchmark = async () => {
  try {
    // Setup
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test-secret';

    await connectDB();

    // Create a user for testing
    const userData = {
      identifier: 'bench_user_' + Date.now(),
      password: 'Password123!',
      firstName: 'Bench',
      lastName: 'Mark',
      birthDate: '1990-01-01'
    };

    await createUser(userData);
    const user = await User.findOne({ identifier: userData.identifier });
    const userId = user._id;

    console.log('--- Benchmarking User Service ---');

    // Benchmark 1: Existence Check (createUser logic simulation)
    const iterations = 100;

    console.time('Old: findOne existence check');
    for (let i = 0; i < iterations; i++) {
      await User.findOne({ identifier: userData.identifier });
    }
    console.timeEnd('Old: findOne existence check');

    console.time('New: exists existence check');
    for (let i = 0; i < iterations; i++) {
      await User.exists({ identifier: userData.identifier });
    }
    console.timeEnd('New: exists existence check');

    // Benchmark 2: Fetch User (fetchUserById logic)
    console.time('Old: findById + toObject');
    for (let i = 0; i < iterations; i++) {
      const u = await User.findById(userId);
      if (u) u.toObject();
    }
    console.timeEnd('Old: findById + toObject');

    console.time('New: findById + lean');
    for (let i = 0; i < iterations; i++) {
      await User.findById(userId).lean();
    }
    console.timeEnd('New: findById + lean');

    // Cleanup
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

runBenchmark();
