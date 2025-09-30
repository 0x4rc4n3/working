// ============================================
// SERVER.JS - Main Express Server Setup
// ============================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/recipe_hub', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('Connected to MongoDB'));

// ============================================
// MONGOOSE MODELS
// ============================================

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImage: { type: String, default: '' },
  dietaryPreferences: [String],
  savedRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
  uploadedRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Recipe Schema
const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['breakfast', 'lunch', 'dinner', 'desserts', 'drinks', 'snacks'] 
  },
  dietaryTags: [String],
  ingredients: [{
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true }
  }],
  instructions: [{
    stepNumber: { type: Number, required: true },
    description: { type: String, required: true },
    image: String,
    videoUrl: String
  }],
  cookingTime: { type: Number, required: true }, // in minutes
  prepTime: { type: Number, required: true },
  difficulty: { 
    type: String, 
    required: true, 
    enum: ['Easy', 'Medium', 'Hard'] 
  },
  servings: { type: Number, required: true },
  images: [String],
  videoUrl: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ratings: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    review: String,
    createdAt: { type: Date, default: Date.now }
  }],
  averageRating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isApproved: { type: Boolean, default: false },
  tags: [String]
});

// Calculate average rating before saving
recipeSchema.pre('save', function(next) {
  if (this.ratings.length > 0) {
    const totalRating = this.ratings.reduce((sum, rating) => sum + rating.rating, 0);
    this.averageRating = totalRating / this.ratings.length;
    this.totalRatings = this.ratings.length;
  }
  next();
});

const Recipe = mongoose.model('Recipe', recipeSchema);

// Meal Plan Schema
const mealPlanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weekStartDate: { type: Date, required: true },
  meals: [{
    day: { 
      type: String, 
      required: true, 
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] 
    },
    breakfast: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' },
    lunch: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' },
    dinner: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' },
    snacks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }]
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const MealPlan = mongoose.model('MealPlan', mealPlanSchema);

// ============================================
// MIDDLEWARE
// ============================================

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// File Upload Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF images and MP4 videos are allowed.'));
    }
  }
});

// ============================================
// AUTH ROUTES
// ============================================

// Register User
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, dietaryPreferences } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email or username already exists' 
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      dietaryPreferences: dietaryPreferences || []
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        dietaryPreferences: user.dietaryPreferences
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Login User
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        dietaryPreferences: user.dietaryPreferences
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Get User Profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-password')
      .populate('savedRecipes uploadedRecipes');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// ============================================
// RECIPE ROUTES
// ============================================

// Get All Recipes with Filtering and Pagination
app.get('/api/recipes', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      dietary, 
      difficulty, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { isApproved: true };
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (dietary) {
      filter.dietaryTags = { $in: Array.isArray(dietary) ? dietary : [dietary] };
    }
    
    if (difficulty) {
      filter.difficulty = difficulty;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'ingredients.name': { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const recipes = await Recipe.find(filter)
      .populate('author', 'username')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Recipe.countDocuments(filter);

    res.json({
      recipes,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecipes: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Recipes fetch error:', error);
    res.status(500).json({ message: 'Error fetching recipes' });
  }
});

// Get Single Recipe
app.get('/api/recipes/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('author', 'username profileImage')
      .populate('ratings.user', 'username');

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    res.json({ recipe });
  } catch (error) {
    console.error('Recipe fetch error:', error);
    res.status(500).json({ message: 'Error fetching recipe' });
  }
});

// Create New Recipe
app.post('/api/recipes', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      dietaryTags,
      ingredients,
      instructions,
      cookingTime,
      prepTime,
      difficulty,
      servings,
      tags
    } = req.body;

    // Process uploaded images
    const imagePaths = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const recipe = new Recipe({
      title,
      description,
      category,
      dietaryTags: JSON.parse(dietaryTags || '[]'),
      ingredients: JSON.parse(ingredients),
      instructions: JSON.parse(instructions),
      cookingTime: parseInt(cookingTime),
      prepTime: parseInt(prepTime),
      difficulty,
      servings: parseInt(servings),
      images: imagePaths,
      author: req.user.userId,
      tags: JSON.parse(tags || '[]'),
      isApproved: true // Auto-approve for now, implement moderation later
    });

    await recipe.save();

    // Add recipe to user's uploaded recipes
    await User.findByIdAndUpdate(req.user.userId, {
      $push: { uploadedRecipes: recipe._id }
    });

    const populatedRecipe = await Recipe.findById(recipe._id)
      .populate('author', 'username');

    res.status(201).json({
      message: 'Recipe created successfully',
      recipe: populatedRecipe
    });
  } catch (error) {
    console.error('Recipe creation error:', error);
    res.status(500).json({ message: 'Error creating recipe' });
  }
});

// Rate and Review Recipe
app.post('/api/recipes/:id/rate', authenticateToken, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const recipeId = req.params.id;
    const userId = req.user.userId;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check if user already rated this recipe
    const existingRatingIndex = recipe.ratings.findIndex(
      r => r.user.toString() === userId
    );

    if (existingRatingIndex > -1) {
      // Update existing rating
      recipe.ratings[existingRatingIndex] = {
        user: userId,
        rating,
        review,
        createdAt: new Date()
      };
    } else {
      // Add new rating
      recipe.ratings.push({
        user: userId,
        rating,
        review,
        createdAt: new Date()
      });
    }

    await recipe.save();

    const populatedRecipe = await Recipe.findById(recipeId)
      .populate('ratings.user', 'username');

    res.json({
      message: 'Rating submitted successfully',
      recipe: populatedRecipe
    });
  } catch (error) {
    console.error('Rating error:', error);
    res.status(500).json({ message: 'Error submitting rating' });
  }
});

// ============================================
// USER INTERACTION ROUTES
// ============================================

// Save/Bookmark Recipe
app.post('/api/users/save-recipe/:recipeId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const recipeId = req.params.recipeId;

    const user = await User.findById(userId);
    if (!user.savedRecipes.includes(recipeId)) {
      user.savedRecipes.push(recipeId);
      await user.save();
    }

    res.json({ message: 'Recipe saved successfully' });
  } catch (error) {
    console.error('Save recipe error:', error);
    res.status(500).json({ message: 'Error saving recipe' });
  }
});

// Remove Saved Recipe
app.delete('/api/users/save-recipe/:recipeId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const recipeId = req.params.recipeId;

    await User.findByIdAndUpdate(userId, {
      $pull: { savedRecipes: recipeId }
    });

    res.json({ message: 'Recipe removed from saved list' });
  } catch (error) {
    console.error('Remove saved recipe error:', error);
    res.status(500).json({ message: 'Error removing saved recipe' });
  }
});

// Get User's Saved Recipes
app.get('/api/users/saved-recipes', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate({
        path: 'savedRecipes',
        populate: {
          path: 'author',
          select: 'username'
        }
      });

    res.json({ savedRecipes: user.savedRecipes });
  } catch (error) {
    console.error('Fetch saved recipes error:', error);
    res.status(500).json({ message: 'Error fetching saved recipes' });
  }
});

// ============================================
// MEAL PLANNER ROUTES
// ============================================

// Get Meal Plan
app.get('/api/meal-plans/:weekDate', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const weekDate = new Date(req.params.weekDate);

    const mealPlan = await MealPlan.findOne({
      user: userId,
      weekStartDate: weekDate
    }).populate({
      path: 'meals.breakfast meals.lunch meals.dinner meals.snacks',
      select: 'title images cookingTime difficulty'
    });

    res.json({ mealPlan });
  } catch (error) {
    console.error('Fetch meal plan error:', error);
    res.status(500).json({ message: 'Error fetching meal plan' });
  }
});

// Create/Update Meal Plan
app.post('/api/meal-plans', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { weekStartDate, meals } = req.body;

    const existingPlan = await MealPlan.findOne({
      user: userId,
      weekStartDate: new Date(weekStartDate)
    });

    if (existingPlan) {
      existingPlan.meals = meals;
      existingPlan.updatedAt = new Date();
      await existingPlan.save();
      res.json({ message: 'Meal plan updated successfully', mealPlan: existingPlan });
    } else {
      const newMealPlan = new MealPlan({
        user: userId,
        weekStartDate: new Date(weekStartDate),
        meals
      });
      await newMealPlan.save();
      res.status(201).json({ message: 'Meal plan created successfully', mealPlan: newMealPlan });
    }
  } catch (error) {
    console.error('Save meal plan error:', error);
    res.status(500).json({ message: 'Error saving meal plan' });
  }
});

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large' });
    }
  }
  res.status(500).json({ message: 'Something went wrong!' });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});