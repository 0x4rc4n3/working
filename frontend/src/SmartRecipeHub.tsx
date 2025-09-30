import React, { useState, useEffect } from 'react';
import { Search, Heart, Clock, Users, Star, ChefHat, Calendar, Plus } from 'lucide-react';

// Main App Component
const SmartRecipeHub = () => {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [currentView, setCurrentView] = useState('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [user, setUser] = useState(null);

  // Sample recipe data
  const sampleRecipes = [
    {
      id: 1,
      title: "Mediterranean Quinoa Bowl",
      category: "lunch",
      dietaryTags: ["vegetarian", "gluten-free"],
      cookingTime: 25,
      difficulty: "Easy",
      servings: 4,
      rating: 4.5,
      totalRatings: 128,
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
      ingredients: [
        { name: "Quinoa", quantity: 1, unit: "cup" },
        { name: "Cherry tomatoes", quantity: 200, unit: "g" },
        { name: "Cucumber", quantity: 1, unit: "piece" },
        { name: "Feta cheese", quantity: 100, unit: "g" }
      ],
      instructions: [
        { step: 1, description: "Rinse quinoa and cook according to package directions" },
        { step: 2, description: "Dice cucumber and halve cherry tomatoes" },
        { step: 3, description: "Combine all ingredients and serve" }
      ]
    },
    {
      id: 2,
      title: "Chocolate Chip Cookies",
      category: "desserts",
      dietaryTags: ["vegetarian"],
      cookingTime: 45,
      difficulty: "Medium",
      servings: 24,
      rating: 4.8,
      totalRatings: 256,
      image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400",
      ingredients: [
        { name: "All-purpose flour", quantity: 2, unit: "cups" },
        { name: "Butter", quantity: 1, unit: "cup" },
        { name: "Brown sugar", quantity: 0.75, unit: "cup" },
        { name: "Chocolate chips", quantity: 2, unit: "cups" }
      ],
      instructions: [
        { step: 1, description: "Preheat oven to 375°F (190°C)" },
        { step: 2, description: "Mix butter and sugars until creamy" },
        { step: 3, description: "Add flour and chocolate chips, mix well" },
        { step: 4, description: "Bake for 9-11 minutes until golden brown" }
      ]
    }
  ];

  useEffect(() => {
    setRecipes(sampleRecipes);
    setFilteredRecipes(sampleRecipes);
  }, []);

  // Filter recipes based on search and category
  useEffect(() => {
    let filtered = recipes;
    
    if (searchTerm) {
      filtered = filtered.filter(recipe => 
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.ingredients.some(ing => ing.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(recipe => recipe.category === selectedCategory);
    }
    
    setFilteredRecipes(filtered);
  }, [searchTerm, selectedCategory, recipes]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        currentView={currentView}
        setCurrentView={setCurrentView}
        user={user}
      />
      
      <main className="container mx-auto px-4 py-6">
        {currentView === 'home' && (
          <HomePage 
            recipes={filteredRecipes}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            setCurrentView={setCurrentView}
            setSelectedRecipe={setSelectedRecipe}
          />
        )}
        
        {currentView === 'recipe-detail' && selectedRecipe && (
          <RecipeDetail 
            recipe={selectedRecipe}
            setCurrentView={setCurrentView}
          />
        )}
        
        {currentView === 'meal-planner' && (
          <MealPlanner 
            recipes={recipes}
            setCurrentView={setCurrentView}
          />
        )}
      </main>
    </div>
  );
};

// Header Component
const Header = ({ searchTerm, setSearchTerm, currentView, setCurrentView, user }) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => setCurrentView('home')}
          >
            <ChefHat className="h-8 w-8 text-orange-500" />
            <h1 className="text-2xl font-bold text-gray-900">Smart Recipe Hub</h1>
          </div>
          
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search recipes or ingredients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <nav className="flex items-center space-x-4">
            <button 
              onClick={() => setCurrentView('home')}
              className={`px-4 py-2 rounded-md transition-colors ${
                currentView === 'home' ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Recipes
            </button>
            <button 
              onClick={() => setCurrentView('meal-planner')}
              className={`px-4 py-2 rounded-md transition-colors ${
                currentView === 'meal-planner' ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="inline h-4 w-4 mr-1" />
              Meal Planner
            </button>
            <button className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors">
              <Plus className="inline h-4 w-4 mr-1" />
              Add Recipe
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

// Home Page Component
const HomePage = ({ recipes, selectedCategory, setSelectedCategory, setCurrentView, setSelectedRecipe }) => {
  const categories = [
    { id: 'all', name: 'All Recipes', icon: '🍽️' },
    { id: 'breakfast', name: 'Breakfast', icon: '🌅' },
    { id: 'lunch', name: 'Lunch', icon: '🥗' },
    { id: 'dinner', name: 'Dinner', icon: '🍽️' },
    { id: 'desserts', name: 'Desserts', icon: '🍰' },
    { id: 'drinks', name: 'Drinks', icon: '🥤' }
  ];

  const handleRecipeClick = (recipe) => {
    setSelectedRecipe(recipe);
    setCurrentView('recipe-detail');
  };

  return (
    <div>
      {/* Featured Section */}
      <section className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Recipes</h2>
        <div className="bg-gradient-to-r from-orange-400 to-pink-500 rounded-xl p-6 text-white">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-2">Discover Amazing Recipes</h3>
              <p className="text-orange-100 mb-4">
                Join our community of food lovers and explore thousands of delicious recipes
              </p>
              <button className="bg-white text-orange-500 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Explore Now
              </button>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">👨‍🍳</div>
              <div className="text-lg font-semibold">{recipes.length} Recipes Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Browse by Category</h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`p-4 rounded-lg text-center transition-all ${
                selectedCategory === category.id
                  ? 'bg-orange-500 text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-700 hover:bg-orange-50 hover:shadow-md border'
              }`}
            >
              <div className="text-2xl mb-2">{category.icon}</div>
              <div className="font-medium text-sm">{category.name}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Recipe Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            {selectedCategory === 'all' ? 'All Recipes' : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Recipes`}
          </h3>
          <div className="text-sm text-gray-600">{recipes.length} recipes found</div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map(recipe => (
            <RecipeCard 
              key={recipe.id} 
              recipe={recipe} 
              onClick={() => handleRecipeClick(recipe)}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

// Recipe Card Component
const RecipeCard = ({ recipe, onClick }) => {
  const [isSaved, setIsSaved] = useState(false);

  return (
    <div 
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative">
        <img 
          src={recipe.image} 
          alt={recipe.title}
          className="w-full h-48 object-cover rounded-t-xl group-hover:scale-105 transition-transform duration-300"
        />
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsSaved(!isSaved);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
            isSaved ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-500'
          }`}
        >
          <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>
        <div className="absolute bottom-3 left-3">
          <span className="bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs font-medium capitalize">
            {recipe.category}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">{recipe.title}</h3>
        
        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {recipe.cookingTime}m
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            {recipe.servings}
          </div>
          <div className="flex items-center">
            <Star className="h-4 w-4 mr-1 text-yellow-500 fill-current" />
            {recipe.rating} ({recipe.totalRatings})
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            recipe.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
            recipe.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {recipe.difficulty}
          </span>
          
          <div className="flex space-x-1">
            {recipe.dietaryTags.slice(0, 2).map(tag => (
              <span key={tag} className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Recipe Detail Component
const RecipeDetail = ({ recipe, setCurrentView }) => {
  const [servings, setServings] = useState(recipe.servings);
  const [activeTab, setActiveTab] = useState('ingredients');

  const scaleIngredient = (originalQuantity, originalServings, newServings) => {
    return (originalQuantity * newServings / originalServings).toFixed(2);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button 
        onClick={() => setCurrentView('home')}
        className="mb-6 text-orange-500 hover:text-orange-600 font-medium"
      >
        ← Back to Recipes
      </button>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Hero Section */}
        <div className="relative">
          <img 
            src={recipe.image} 
            alt={recipe.title}
            className="w-full h-64 md:h-80 object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
            <div className="p-6 text-white">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{recipe.title}</h1>
              <div className="flex items-center space-x-4 text-sm">
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {recipe.cookingTime} minutes
                </span>
                <span className="flex items-center">
                  <Star className="h-4 w-4 mr-1 text-yellow-400 fill-current" />
                  {recipe.rating} ({recipe.totalRatings} reviews)
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  recipe.difficulty === 'Easy' ? 'bg-green-500' :
                  recipe.difficulty === 'Medium' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}>
                  {recipe.difficulty}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Serving Scaler */}
          <div className="mb-6 p-4 bg-orange-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">Adjust servings:</span>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => servings > 1 && setServings(servings - 1)}
                  className="w-8 h-8 rounded-full bg-white border border-orange-300 flex items-center justify-center hover:bg-orange-100"
                >
                  -
                </button>
                <span className="font-semibold text-lg px-3">{servings}</span>
                <button 
                  onClick={() => setServings(servings + 1)}
                  className="w-8 h-8 rounded-full bg-white border border-orange-300 flex items-center justify-center hover:bg-orange-100"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('ingredients')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'ingredients'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Ingredients
              </button>
              <button
                onClick={() => setActiveTab('instructions')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'instructions'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Instructions
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'ingredients' && (
            <div className="grid md:grid-cols-2 gap-4">
              {recipe.ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{ingredient.name}</span>
                  <span className="text-orange-600 font-semibold">
                    {scaleIngredient(ingredient.quantity, recipe.servings, servings)} {ingredient.unit}
                  </span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'instructions' && (
            <div className="space-y-4">
              {recipe.instructions.map((instruction, index) => (
                <div key={index} className="flex space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold">
                    {instruction.step}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-gray-800">{instruction.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Meal Planner Component
const MealPlanner = ({ recipes, setCurrentView }) => {
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [mealPlan, setMealPlan] = useState({});
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mealTypes = ['breakfast', 'lunch', 'dinner'];

  const handleDrop = (day, mealType, recipe) => {
    setMealPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealType]: recipe
      }
    }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Weekly Meal Planner</h2>
        <button 
          onClick={() => setCurrentView('home')}
          className="text-orange-500 hover:text-orange-600 font-medium"
        >
          ← Back to Recipes
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-8 gap-4">
          {/* Header */}
          <div className="font-semibold text-gray-700">Meal Type</div>
          {days.map(day => (
            <div key={day} className="font-semibold text-gray-700 text-center">{day}</div>
          ))}

          {/* Meal Plan Grid */}
          {mealTypes.map(mealType => (
            <React.Fragment key={mealType}>
              <div className="font-medium text-gray-600 capitalize py-4">{mealType}</div>
              {days.map(day => (
                <div 
                  key={`${day}-${mealType}`}
                  className="min-h-[100px] border-2 border-dashed border-gray-200 rounded-lg p-2 hover:border-orange-300 transition-colors"
                  onDrop={(e) => {
                    e.preventDefault();
                    const recipeData = JSON.parse(e.dataTransfer.getData('text/plain'));
                    handleDrop(day, mealType, recipeData);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                >
                  {mealPlan[day]?.[mealType] ? (
                    <div className="bg-orange-50 rounded-lg p-2 border border-orange-200">
                      <img 
                        src={mealPlan[day][mealType].image} 
                        alt={mealPlan[day][mealType].title}
                        className="w-full h-16 object-cover rounded mb-2"
                      />
                      <div className="text-xs font-medium text-gray-900 line-clamp-2">
                        {mealPlan[day][mealType].title}
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                      Drop recipe here
                    </div>
                  )}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>

        {/* Recipe Suggestions */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Drag Recipes to Your Meal Plan</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recipes.slice(0, 8).map(recipe => (
              <div 
                key={recipe.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', JSON.stringify(recipe));
                }}
                className="bg-gray-50 rounded-lg p-3 cursor-move hover:bg-gray-100 transition-colors border"
              >
                <img 
                  src={recipe.image} 
                  alt={recipe.title}
                  className="w-full h-20 object-cover rounded mb-2"
                />
                <div className="text-sm font-medium text-gray-900 line-clamp-2">
                  {recipe.title}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {recipe.cookingTime}m • {recipe.category}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-center space-x-4">
          <button className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors">
            Save Meal Plan
          </button>
          <button className="border border-orange-500 text-orange-500 px-6 py-2 rounded-lg hover:bg-orange-50 transition-colors">
            Generate Auto Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmartRecipeHub;