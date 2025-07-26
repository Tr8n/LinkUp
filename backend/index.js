const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('./connection/db');
const userRoutes = require('./routes/userRoutes');
const linkRoutes = require('./routes/linkRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration for development and production
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://tr8n.github.io', // Your GitHub Pages URL
  'https://linkup-app.vercel.app' // If you deploy to Vercel
];

app.use(cors({ 
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true 
}));
app.use(bodyParser.json());

app.use('/api/users', userRoutes);
app.use('/api/links', linkRoutes);

app.get('/', (req, res) => {
  res.send('Hello, Express!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});