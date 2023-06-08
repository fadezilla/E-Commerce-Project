const express = require('express');
const router = express.Router();
const db = require('../models');
const jwt = require('jsonwebtoken');
const OrderService = require('../services/orderService');
const orderService = new OrderService(db);
const UserService = require('../services/userService');
const userService = new UserService(db);
const CartService = require('../services/cartService');
const cartService = new CartService(db);
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const { calculateTotalPrice } = require('../public/javascripts/priceCalculator');
const authentication = require('../public/javascripts/authentication');
const isAdmin = require('../public/javascripts/isAdmin');



router.get('/orders', authentication, async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        const user = await userService.getOneUser(userId);
        let orders;

        if(user.RoleId === 1) {
            orders = await orderService.getAllOrders();
        } else {
            orders = await orderService.getUserOrder(userId);
        }
        res.json(orders);
    } catch (error){
        console.error('Error getting orders: ', error);
        res.status(500).json({ error: 'Failed to get orders.' });
    }
});

router.get('/allorders', authentication, isAdmin, async(req, res, next) => {
    try {
        const orders = await orderService.getallOrdersQuery();
        res.json(orders);
    } catch (error){
        console.error('Error getting all orders: ', error);
        res.status(500).json({ error: 'Failed to retrieve all orders.'});
    }
});

router.post('/order/:id', authentication, async(req, res, next) => {
    try {
        const { id: itemId } = req.params;
        const { id: userId } = req.user;

        const orderItem = await orderService.createOrder(userId, itemId);
        const email = await userService.getEmail(userId);
        const usersWithSameEmail = await userService.getEmailCount(email);

        const totalPrice = calculateTotalPrice([orderItem], usersWithSameEmail);

        const result = {
            Price: totalPrice,
            Order: orderItem,
        };
        
        res.json({ message: 'Order successfully made!', result});
    } catch (error){
        console.error('Error creating order:', error);
        if (error.message === 'Item not found' || error.message === 'Cart item not found') {
            res.status(404).json({ error: 'Failed to create order item. Item not found or cart item not found.' });
          } else if (error.message === 'Not enough stock') {
            res.status(400).json({ error: 'Failed to create order item. Not enough stock.' });
          } else {
            res.status(500).json({ error: 'Failed to create order' });
          }
    }
});

router.post('/checkout', authentication, async(req, res, next) => {
    try {
        const { id: userId } = req.user;

        const cart = await cartService.getOne(userId);
        if(!cart) {
            return res.status(404).json({ error: 'Cart not found.'});
        }

        const email = await userService.getEmail(userId)
        const cartItems = await cartService.getCartItems(cart.id);
        const usersWithSameEmail = await userService.getEmailCount(email);

        if(!cartItems || cartItems.length === 0) {
            return res.status(404).json({ error: 'No items found in the cart. '});
        }
    
        const totalPrice = calculateTotalPrice(cartItems, usersWithSameEmail);

        const orderItems = [];
        for (const cartItem of cartItems) {
            const orderItem = await orderService.createOrder(userId, cartItem.ItemId);
            orderItems.push(orderItem)
        };

        const result = {
            totalPrice: totalPrice,
            Order: orderItems,
        };
        
        res.json({ message: 'Checkout success!', result});
    } catch (error) {
        console.error('Error during checkout: ', error);
        res.status(500).json({ error: 'Failed to complete checkout.'})
    }
})

router.put('/order/:id', authentication, isAdmin, async (req, res, next) => {
    try {
        const { id: orderId } = req.params;
        const { status } = req.body;
        const order = await orderService.findOrderById(orderId);

        if(!order){
            return res.status(404).json({ error: 'Order not found.'});
        }
        await orderService.updateOrder(orderId, status);
        
        res.json({ message: 'Order status updated successfully'});
    } catch (error){
        console.error('Error updating order status: ', error);
        res.status(500).json({ error: 'Failed to update order status.'});
    }
});

router.delete('/order_item/:id', authentication, isAdmin, async (req, res, next) => {
    try {
        const { id: orderId } = req.params;
        await orderService.deleteOrderItems(orderId);
        res.json({ message: 'order items have been deleted'});
    } catch (error) {
        console.error('Error deleting order items: ', error);
        res.status(500).json({ error: 'Failed to delete order items.'});
    }
});

router.delete('/order/:id', authentication, isAdmin, async (req, res, next) => {
    try {
        const { id: userId } = req.params;
        await orderService.deleteOrderById(userId);
        res.json({ message: 'Order have been deleted'});
    } catch (error){
        console.error('Error deleting order: ', error);
        res.status(500).json({ error: 'Failed to delete order.' });
    }
});

module.exports = router;



