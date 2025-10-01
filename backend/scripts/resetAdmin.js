// ============================================
// FILE: backend/scripts/resetAdmin.js
// Delete existing admin and create new one
// ============================================
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: String,
  isActive: Boolean,
  dietaryPreferences: [String],
  savedRecipes: [],
  uploadedRecipes: [],
  createdAt: Date
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', userSchema);

async function resetAdmin() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/recipe_hub');
    console.log('✅ Connected!\n');

    console.log('🗑️  Deleting existing admin accounts...');
    const deleteResult = await User.deleteMany({ role: 'admin' });
    console.log(`   Deleted ${deleteResult.deletedCount} admin account(s)\n`);

    console.log('📝 Creating new admin account...');
    const admin = new User({
      username: 'admin',
      email: 'admin@recipehub.com',
      password: 'Admin@123456',
      role: 'admin',
      isActive: true,
      dietaryPreferences: [],
      createdAt: new Date()
    });

    await admin.save();
    
    console.log('\n✅✅✅ Admin account reset successfully! ✅✅✅');
    console.log('================================================');
    console.log('📧 Email:    admin@recipehub.com');
    console.log('🔑 Password: Admin@123456');
    console.log('👤 Username: admin');
    console.log('🎭 Role:     admin');
    console.log('================================================\n');

    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetAdmin();