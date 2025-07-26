const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('./connection/db');
const userRoutes = require('./routes/userRoutes');
const linkRoutes = require('./routes/linkRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration for local development
app.use(cors({ 
  origin: ["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"],
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