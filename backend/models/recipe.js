const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Recipe title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters long'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Recipe description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Recipe category is required'],
    enum: {
      values: ['breakfast', 'lunch', 'dinner', 'desserts', 'drinks', 'snacks', 'appetizers'],
      message: '{VALUE} is not a valid category'
    }
  },
  cuisine: {
    type: String,
    enum: ['italian', 'chinese', 'indian', 'mexican', 'mediterranean', 'american', 'french', 'thai', 'japanese', 'other']
  },
  dietaryTags: [{
    type: String,
    enum: ['vegetarian', 'vegan', 'keto', 'gluten-free', 'dairy-free', 'paleo', 'low-carb', 'pescatarian', 'nut-free', 'soy-free']
  }],
  ingredients: [{
    name: {
      type: String,
      required: [true, 'Ingredient name is required'],
      trim: true
    },
    quantity: {
      type: Number,
      required: [true, 'Ingredient quantity is required'],
      min: [0.01, 'Quantity must be greater than 0']
    },
    unit: {
      type: String,
      required: [true, 'Ingredient unit is required'],
      trim: true,
      enum: ['cups', 'tbsp', 'tsp', 'grams', 'kg', 'pounds', 'oz', 'liters', 'ml', 'pieces', 'cloves', 'slices', 'pinch', 'dash', 'whole']
    }
  }],
  instructions: [{
    stepNumber: {
      type: Number,
      required: [true, 'Step number is required'],
      min: [1, 'Step number must be at least 1']
    },
    description: {
      type: String,
      required: [true, 'Step description is required'],
      trim: true,
      maxlength: [500, 'Step description cannot exceed 500 characters']
    },
    image: String,
    videoUrl: String,
    timer: {
      type: Number, // in minutes
      min: [0, 'Timer cannot be negative']
    }
  }],
  cookingTime: {
    type: Number,
    required: [true, 'Cooking time is required'],
    min: [1, 'Cooking time must be at least 1 minute']
  },
  prepTime: {
    type: Number,
    required: [true, 'Preparation time is required'],
    min: [1, 'Preparation time must be at least 1 minute']
  },
  totalTime: {
    type: Number
  },
  difficulty: {
    type: String,
    required: [true, 'Difficulty level is required'],
    enum: {
      values: ['Easy', 'Medium', 'Hard'],
      message: '{VALUE} is not a valid difficulty level'
    }
  },
  servings: {
    type: Number,
    required: [true, 'Number of servings is required'],
    min: [1, 'Servings must be at least 1'],
    max: [100, 'Servings cannot exceed 100']
  },
  images: [{
    type: String,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Image must be a valid URL'
    }
  }],
  videoUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Video URL must be a valid URL'
    }
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipe author is required']
  },
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    review: {
      type: String,
      maxlength: [500, 'Review cannot exceed 500 characters'],
      trim: true
    },
    helpful: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: [0, 'Average rating cannot be negative'],
    max: [5, 'Average rating cannot exceed 5']
  },
  totalRatings: {
    type: Number,
    default: 0,
    min: [0, 'Total ratings cannot be negative']
  },
  views: {
    type: Number,
    default: 0,
    min: [0, 'Views cannot be negative']
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  nutritionInfo: {
    calories: {
      type: Number,
      min: [0, 'Calories cannot be negative']
    },
    protein: Number, // in grams
    carbs: Number,   // in grams
    fat: Number,     // in grams
    fiber: Number,   // in grams
    sugar: Number,   // in grams
    sodium: Number   // in mg
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  isApproved: {
    type: Boolean,
    default: true // Set to false if you want admin moderation
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  publishedAt: {
    type: Date,
    default: Date.now
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total time
recipeSchema.virtual('totalTimeVirtual').get(function() {
  return this.prepTime + this.cookingTime;
});

// Virtual for likes count
recipeSchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

// Indexes for better performance
recipeSchema.index({ title: 'text', description: 'text', tags: 'text' });
recipeSchema.index({ category: 1 });
recipeSchema.index({ dietaryTags: 1 });
recipeSchema.index({ author: 1 });
recipeSchema.index({ averageRating: -1 });
recipeSchema.index({ createdAt: -1 });
recipeSchema.index({ views: -1 });
recipeSchema.index({ isApproved: 1, isPublished: 1 });
recipeSchema.index({ 'ingredients.name': 1 });

// Compound indexes
recipeSchema.index({ category: 1, averageRating: -1 });
recipeSchema.index({ dietaryTags: 1, category: 1 });

// Pre-save middleware
recipeSchema.pre('save', function(next) {
  // Calculate total time
  this.totalTime = this.prepTime + this.cookingTime;
  
  // Update last modified date
  this.lastModified = new Date();
  
  // Set published date if being published for the first time
  if (this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Calculate average rating before saving
recipeSchema.pre('save', function(next) {
  if (this.ratings && this.ratings.length > 0) {
    const totalRating = this.ratings.reduce((sum, rating) => sum + rating.rating, 0);
    this.averageRating = Math.round((totalRating / this.ratings.length) * 10) / 10; // Round to 1 decimal place
    this.totalRatings = this.ratings.length;
  } else {
    this.averageRating = 0;
    this.totalRatings = 0;
  }
  next();
});

// Static method to find recipes by ingredient
recipeSchema.statics.findByIngredient = function(ingredient) {
  return this.find({
    'ingredients.name': { $regex: ingredient, $options: 'i' },
    isApproved: true,
    isPublished: true
  });
};

// Static method to find popular recipes
recipeSchema.statics.findPopular = function(limit = 10) {
  return this.find({ isApproved: true, isPublished: true })
    .sort({ averageRating: -1, totalRatings: -1, views: -1 })
    .limit(limit)
    .populate('author', 'username profileImage');
};

// Static method to find recipes by difficulty
recipeSchema.statics.findByDifficulty = function(difficulty) {
  return this.find({
    difficulty,
    isApproved: true,
    isPublished: true
  }).sort({ averageRating: -1 });
};

// Instance method to add rating
recipeSchema.methods.addRating = function(userId, rating, review) {
  // Check if user already rated this recipe
  const existingRatingIndex = this.ratings.findIndex(
    r => r.user.toString() === userId.toString()
  );

  if (existingRatingIndex > -1) {
    // Update existing rating
    this.ratings[existingRatingIndex].rating = rating;
    this.ratings[existingRatingIndex].review = review;
    this.ratings[existingRatingIndex].createdAt = new Date();
  } else {
    // Add new rating
    this.ratings.push({
      user: userId,
      rating,
      review,
      createdAt: new Date()
    });
  }

  return this.save();
};

// Instance method to increment views
recipeSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Instance method to toggle like
recipeSchema.methods.toggleLike = function(userId) {
  const likeIndex = this.likes.indexOf(userId);
  
  if (likeIndex > -1) {
    // Remove like
    this.likes.splice(likeIndex, 1);
  } else {
    // Add like
    this.likes.push(userId);
  }
  
  return this.save();
};

module.exports = mongoose.model('Recipe', recipeSchema);