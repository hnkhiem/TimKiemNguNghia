const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const formRoutes = require('./routes/formRoutes');
const userRoutes = require('./routes/userRoutes');
const historyRoutes = require('./routes/historyRoutes')

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/forms', formRoutes);   
app.use('/api/users', userRoutes); 
app.use('/api/history', historyRoutes);  

// Default route
app.get('/', (req, res) => {
  res.send('✅ Semantic Search Server is running!');
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
