// ============================================
// FILE: backend/scripts/listUsers.js
// Script to list all users in the database
// ============================================
const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  role: String,
  isActive: Boolean,
  createdAt: Date
});

const User = mongoose.model('User', userSchema);

async function listUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/recipe_hub');
    console.log('✅ Connected to MongoDB\n');

    const users = await User.find({}).select('username email role isActive createdAt');
    
    if (users.length === 0) {
      console.log('📭 No users found in database');
    } else {
      console.log(`📋 Found ${users.length} user(s):\n`);
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.username}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role || 'user'}`);
        console.log(`   Active: ${user.isActive}`);
        console.log(`   Created: ${user.createdAt}\n`);
      });
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

listUsers();