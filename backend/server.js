const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS configuration
app.use(cors({
    origin: true, // Allow all origins in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Authentication middleware
const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    
    if (!token) {
        // Check if the request is for a protected page
        const protectedPages = ['/dashboard.html', '/fuel-order.html', '/trackorder.html'];
        if (protectedPages.includes(req.path)) {
            return res.redirect('/signin.html');
        }
        return next();
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.clearCookie('token');
        if (protectedPages.includes(req.path)) {
            return res.redirect('/signin.html');
        }
        next();
    }
};

// Apply authentication middleware
app.use(authMiddleware);

// Serve static files
app.use(express.static(path.join(__dirname, '../pages')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', (req, res, next) => {
  console.log(`Order route accessed: ${req.method} ${req.path}`);
  next();
}, orderRoutes);

// Route to serve HTML files
app.get('*.html', (req, res) => {
    const filePath = path.join(__dirname, '../pages', req.path);
    
    // Check if file exists
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).sendFile(path.join(__dirname, '../pages/404.html'));
    }
});

// Default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 