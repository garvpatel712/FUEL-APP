/**
 * Script to create an initial admin user
 * 
 * Usage: node create-admin.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables
dotenv.config({ path: '../.env' });

// Admin user details
const adminUser = {
    name: 'Admin User',
    email: 'admin@fuelup.com',
    password: 'admin123',  // Change this to a secure password in production
    role: 'admin'
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fuelup')
    .then(() => {
        console.log('Connected to MongoDB');
        createAdmin();
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// Create admin user
async function createAdmin() {
    try {
        // Check if admin user already exists
        const existingAdmin = await User.findOne({ email: adminUser.email });
        
        if (existingAdmin) {
            console.log('Admin user already exists');
            process.exit(0);
        }
        
        // Create new admin user
        const user = new User(adminUser);
        await user.save();
        
        console.log('Admin user created successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
}