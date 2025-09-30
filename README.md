# Smart Recipe Hub 🍳

A modern, interactive web application for recipe discovery, meal planning, and culinary community engagement.

## 🌟 Features

- **Recipe Discovery**: Browse thousands of recipes with advanced filtering
- **Interactive Meal Planner**: Drag-and-drop weekly meal planning
- **Community Driven**: Upload, rate, and review recipes
- **Smart Search**: Find recipes by ingredients or keywords
- **Dietary Preferences**: Filter by vegetarian, vegan, keto, gluten-free, etc.
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **React Hook Form** for form management

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Multer** for file uploads
- **bcrypt** for password hashing

## 📦 Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your environment variables
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Configure your environment variables
npm run dev
```

## 🔧 Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/recipe_hub
JWT_SECRET=your_jwt_secret_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:5000
VITE_APP_NAME=Smart Recipe Hub
```

## 🏃‍♂️ Running the Application

1. Start MongoDB service
2. Start the backend server:
   ```bash
   cd backend && npm run dev
   ```
3. Start the frontend development server:
   ```bash
   cd frontend && npm run dev
   ```
4. Open http://localhost:5173 in your browser

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Recipes
- `GET /api/recipes` - Get all recipes (with filtering)
- `GET /api/recipes/:id` - Get single recipe
- `POST /api/recipes` - Create new recipe
- `PUT /api/recipes/:id` - Update recipe
- `DELETE /api/recipes/:id` - Delete recipe

### User Actions
- `POST /api/users/save-recipe/:recipeId` - Save recipe
- `DELETE /api/users/save-recipe/:recipeId` - Remove saved recipe
- `GET /api/users/saved-recipes` - Get saved recipes

### Meal Planning
- `GET /api/meal-plans/:weekDate` - Get meal plan
- `POST /api/meal-plans` - Create/update meal plan

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

## 🚀 Deployment

### Backend (Heroku)
```bash
heroku create smart-recipe-hub-api
git subtree push --prefix backend heroku main
```

### Frontend (Netlify)
```bash
cd frontend
npm run build
# Deploy dist folder to Netlify
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Ayesha Sajjad** (INFT232101015) - Frontend Developer
- **Mariyam Amjad** (INFT232101026) - Backend Developer

## 🙏 Acknowledgments

- Khwaja Fareed University of Engineering & Information Technology
- Faculty of Information Technology
- All recipe contributors and community members