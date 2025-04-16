const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');

// Middleware to verify authentication
const authMiddleware = async (req, res, next) => {
    try {
        console.log('Auth middleware - cookies:', req.cookies);
        const token = req.cookies.token;
        
        if (!token) {
            console.log('No token found in cookies');
            return res.status(401).json({ message: 'Authentication required' });
        }
        
        console.log('Token found, verifying...');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token verified, user ID:', decoded.userId);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Authentication failed', error: error.message });
    }
};

// Place a new order
router.post('/place', authMiddleware, async (req, res) => {
    try {
        console.log('Place order request received:', req.body);
        console.log('User ID from token:', req.userId);
        
        const {
            fuelType,
            quantity,
            deliveryAddress,
            deliveryDate,
            estimatedDeliveryTime,
            notes
        } = req.body;
        
        // Create new order
        const order = new Order({
            user: req.userId,
            fuelType,
            quantity,
            deliveryAddress,
            deliveryDate,
            estimatedDeliveryTime,
            notes
        });
        
        console.log('Order object created:', order);
        
        // Save order
        try {
            // Generate order number manually if needed
            if (!order.orderNumber) {
                const date = new Date();
                const year = date.getFullYear().toString().substr(-2);
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const day = date.getDate().toString().padStart(2, '0');
                const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
                order.orderNumber = `FU${year}${month}${day}${random}`;
                console.log('Manually generated order number:', order.orderNumber);
            }
            
            await order.save();
            console.log('Order saved successfully:', order.orderNumber);
            
            res.status(201).json({
                message: 'Order placed successfully',
                order: {
                    orderNumber: order.orderNumber,
                    status: order.status,
                    deliveryDate: order.deliveryDate,
                    estimatedDeliveryTime: order.estimatedDeliveryTime
                }
            });
        } catch (saveError) {
            console.error('Error saving order:', saveError);
            res.status(500).json({ 
                message: 'Failed to save order', 
                error: saveError.message,
                details: saveError.errors
            });
        }
    } catch (error) {
        console.error('Place order error:', error);
        res.status(500).json({ message: 'Failed to place order', error: error.message });
    }
});

// Get all orders for the authenticated user
router.get('/my-orders', authMiddleware, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.userId })
            .sort({ createdAt: -1 });
        
        res.json({ orders });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ message: 'Failed to retrieve orders' });
    }
});

// Get a specific order by order number
router.get('/track/:orderNumber', async (req, res) => {
    try {
        const { orderNumber } = req.params;
        
        const order = await Order.findOne({ orderNumber });
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        // If user is authenticated, check if the order belongs to them
        const token = req.cookies.token;
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                if (order.user.toString() === decoded.userId) {
                    // User owns the order, return full details
                    return res.json({ order });
                }
            } catch (error) {
                // Token verification failed, continue with limited details
            }
        }
        
        // Return limited details for non-owners
        res.json({
            order: {
                orderNumber: order.orderNumber,
                status: order.status,
                estimatedDeliveryTime: order.estimatedDeliveryTime,
                deliveryDate: order.deliveryDate
            }
        });
    } catch (error) {
        console.error('Track order error:', error);
        res.status(500).json({ message: 'Failed to track order' });
    }
});

// Cancel an order
router.post('/cancel/:orderNumber', authMiddleware, async (req, res) => {
    try {
        const { orderNumber } = req.params;
        
        const order = await Order.findOne({ 
            orderNumber,
            user: req.userId
        });
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        // Check if order can be cancelled
        if (order.status === 'Delivered' || order.status === 'Cancelled') {
            return res.status(400).json({ 
                message: `Order cannot be cancelled in ${order.status} status` 
            });
        }
        
        // Update order status
        order.status = 'Cancelled';
        await order.save();
        
        res.json({ 
            message: 'Order cancelled successfully',
            order: {
                orderNumber: order.orderNumber,
                status: order.status
            }
        });
    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({ message: 'Failed to cancel order' });
    }
});

module.exports = router; 