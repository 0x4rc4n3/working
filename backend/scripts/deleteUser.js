// ============================================
// FILE: backend/scripts/deleteUser.js
// Script to delete a user by email
// ============================================
const mongoose = require('mongoose');
const readline = require('readline');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  role: String
});

const User = mongoose.model('User', userSchema);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function deleteUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/recipe_hub');
    console.log('✅ Connected to MongoDB\n');

    rl.question('Enter email of user to delete: ', async (email) => {
      try {
        const user = await User.findOne({ email });
        
        if (!user) {
          console.log(`❌ User with email '${email}' not found`);
        } else {
          console.log(`\nFound user: ${user.username} (${user.email}) - Role: ${user.role}`);
          
          rl.question('\nAre you sure you want to delete this user? (yes/no): ', async (answer) => {
            if (answer.toLowerCase() === 'yes') {
              await User.deleteOne({ email });
              console.log('✅ User deleted successfully!');
            } else {
              console.log('❌ Deletion cancelled');
            }
            
            await mongoose.connection.close();
            rl.close();
            process.exit(0);
          });
        }
      } catch (error) {
        console.error('❌ Error:', error.message);
        await mongoose.connection.close();
        rl.close();
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

deleteUser();