// ============================================
// FILE: backend/scripts/createAdmin.js
// ============================================
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

console.log('🚀 Starting Admin Creation Script...');
console.log('📁 Current directory:', __dirname);
console.log('🔗 MongoDB URI:', process.env.MONGODB_URI || 'mongodb://localhost:27017/recipe_hub');

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  profileImage: { type: String, default: '' },
  dietaryPreferences: [String],
  savedRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
  uploadedRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('🔐 Password hashed successfully');
    next();
  } catch (error) {
    console.error('❌ Error hashing password:', error);
    next(error);
  }
});

const User = mongoose.model('User', userSchema);

// Connect to MongoDB
async function connectDB() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/recipe_hub');
    console.log('✅ Connected to MongoDB successfully!');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    return false;
  }
}

// Create Admin Function
async function createAdmin() {
  try {
    console.log('\n🔍 Checking for existing admin...');
    
    // Check if ANY admin exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin account already exists!');
      console.log('================================');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Username:', existingAdmin.username);
      console.log('🎭 Role:', existingAdmin.role);
      console.log('================================');
      console.log('\n💡 To login, use these credentials in your browser:');
      console.log('   Email: admin@recipehub.com');
      console.log('   Password: Admin@123456');
      return;
    }

    console.log('📝 No admin found. Creating new admin account...');

    // Create new admin
    const admin = new User({
      username: 'admin',
      email: 'admin@recipehub.com',
      password: 'Admin@123456',
      role: 'admin',
      isActive: true,
      dietaryPreferences: []
    });

    console.log('💾 Saving admin to database...');
    await admin.save();

    console.log('\n✅✅✅ Admin account created successfully! ✅✅✅');
    console.log('================================================');
    console.log('📧 Email:    admin@recipehub.com');
    console.log('🔑 Password: Admin@123456');
    console.log('👤 Username: admin');
    console.log('🎭 Role:     admin');
    console.log('================================================');
    console.log('\n🌐 Now you can login at: http://localhost:5173/login');
    console.log('⚠️  IMPORTANT: Change this password after first login!\n');
    
  } catch (error) {
    console.error('\n❌ Error creating admin:', error.message);
    if (error.code === 11000) {
      console.error('💡 Duplicate key error - Admin might already exist');
      console.error('   Try: db.users.find({ role: "admin" }) in MongoDB shell');
    }
    throw error;
  }
}

// Main execution
async function main() {
  try {
    const connected = await connectDB();
    
    if (!connected) {
      console.error('\n❌ Could not connect to MongoDB. Make sure MongoDB is running!');
      console.error('💡 Start MongoDB with: mongod');
      process.exit(1);
    }

    await createAdmin();
    
    console.log('\n✅ Script completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Script failed:', error.message);
    process.exit(1);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  }
}

// Run the script
main();