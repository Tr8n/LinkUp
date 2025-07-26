# LinkUp 🔗

A modern link management application built with the MERN stack (MongoDB, Express.js, React, Node.js).

## 🌟 Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Link Management**: Full CRUD operations for managing your links
- **Tagging System**: Organize links with custom tags
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Real-time Updates**: Instant feedback for all operations

## 🚀 Live Demo

- **Frontend**: [https://tr8n.github.io/LinkUp/](https://tr8n.github.io/LinkUp/)
- **Backend API**: [https://your-backend-url.onrender.com](https://your-backend-url.onrender.com)

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **CSS3** - Custom styling with responsive design

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing

## 📁 Project Structure

```
linkup/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API services
│   │   └── ...
│   └── package.json
├── backend/                  # Node.js backend
│   ├── controllers/         # Route controllers
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Tr8n/LinkUp.git
   cd LinkUp
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**
   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/LinkManagement
   JWT_SECRET=your_secret_key_here
   ```

5. **Start the development servers**
   ```bash
   # Start backend (from backend directory)
   npm run dev
   
   # Start frontend (from frontend directory)
   npm run dev
   ```

6. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

## 📚 API Endpoints

### Authentication
- `POST /api/users/signup` - Register a new user
- `POST /api/users/login` - Login user

### Links (Requires Authentication)
- `GET /api/links` - Get all user links
- `POST /api/links` - Create a new link
- `PUT /api/links/:id` - Update a link
- `DELETE /api/links/:id` - Delete a link

## 🎨 Features in Detail

### User Authentication
- Secure password hashing with bcrypt
- JWT token-based authentication
- Automatic token expiration handling
- Protected routes

### Link Management
- Add links with name, URL, and tags
- Edit existing links
- Delete links with confirmation
- View all links with creation dates
- Tag-based organization

### User Interface
- Clean, modern design
- Responsive layout for all devices
- Loading states and error handling
- Smooth animations and transitions

## 🔧 Deployment

### Backend Deployment (Render)
1. Connect your GitHub repository to Render
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables

### Frontend Deployment (GitHub Pages)
1. Run `npm run deploy` from frontend directory
2. Enable GitHub Pages in repository settings
3. Select gh-pages branch as source

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Tr8n**
- GitHub: [@Tr8n](https://github.com/Tr8n)

## 🙏 Acknowledgments

- React team for the amazing framework
- MongoDB for the database
- Express.js community for the web framework
- All contributors and supporters

---

⭐ If you find this project helpful, please give it a star! 