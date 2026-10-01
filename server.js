const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
 
const app = express();
 
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
 
// Conexión a MongoDB (reutilizable para Vercel)
const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    await mongoose.connect(process.env.MONGODB_URI);
};
 
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error('MongoDB Connection Error:', error.message);
        res.status(500).json({ message: 'Error de conexión a la base de datos' });
    }
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
 
// Solo escuchar un puerto cuando se corre en local (node server.js)
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}
 
// Necesario para que Vercel pueda usar la app
module.exports = app;