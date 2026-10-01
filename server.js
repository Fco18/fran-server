const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection with enhanced error handling
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB Atlas successfully');
    })
    .catch((error) => {
        console.error('MongoDB Connection Error Details:');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        if (error.code) {
            console.error('Error Code:', error.code);
        }
        process.exit(1);
    });

// Import routes
const testRoutes = require('./routes/test');
const studentRoutes = require('./routes/students');
const attendanceRoutes = require('./routes/attendance');
const inventoryRoutes = require('./routes/inventory');
const paymentRoutes = require('./routes/payments');
const authRoutes = require('./routes/auth');

// Use routes
app.use('/api/tests', testRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/auth', authRoutes);

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the API' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 