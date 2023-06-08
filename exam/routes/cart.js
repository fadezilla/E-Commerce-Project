const express = require('express');
const router = express.Router();
const db = require('../models');
const jwt = require('jsonwebtoken');
const CartService = require('../services/cartService');
const cartService = new CartService(db);
const UserService = require('../services/userService');
const userService = new UserService(db);
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const authentication = require('../public/javascripts/authentication');
const isAdmin = require('../public/javascripts/isAdmin');
const { calculateTotalPrice } = require('../public/javascripts/priceCalculator');

router.get('/cart', authentication, async(req, res, next)=> {
    try {
        const { id: userId } = req.user;
        const cart = await cartService.getCart(userId);
        if(!cart){
            return res.json({ message: 'Cart not found.'});
        }

        const cartItems = await cartService.getCartItems(cart.id);
        if (!cartItems || cartItems.length === 0) {
            return res.json({ message: 'No items found in the cart.' });
          }
        
        const email = await userService.getEmail(userId)
        const usersWithSameEmail = await userService.getEmailCount(email);
        const discountedPrice = calculateTotalPrice(cartItems, usersWithSameEmail);
        
        res.json({ cart, totalPrice: discountedPrice });
    } catch (error){
        console.error('Cart GET error', error);
        res.status(500).json({ error: 'Failed to retrieve the cart. '})
    }
});

router.get('/allcarts', authentication, async (req, res, next)=> {
    try{
        const { id: userId } = req.user;
        const user = await userService.getOneUser(userId);
        if(!user || user.RoleId !== 1) {
            return res.status(403).json({ error: 'Access denied. Only logged in Admin can view this page.'});
        }
        const allCarts = await cartService.getAll();
        res.json(allCarts);
    } catch (error) {
        console.error('All carts GET error', error)
        res.status(500).json({ error: 'Failed to get all carts.'});
    }
});

router.post('/cart_item', authentication, async(req, res, next) => {
    try {
        const { id: userId } = req.user;
        const { itemId, quantity } = req.body;
        const cartItems = await cartService.addItemToCart(userId, itemId, quantity);

        if (!cartItems) {
            return res.status(500).json({ error: 'Failed to add item to cart.' });
          }
        
        res.json(cartItems);
    } catch (error) {
        console.error('Error adding item to cart', error)
        res.status(500).json({ error: 'Failed to add item to cart.'});
    }
});

router.put('/cart_item/:id', authentication, async(req, res, next) => {
    try {
        const { id: userId } = req.user;
        const { id: itemId } = req.params;
        const { quantity } = req.body;

        try {
            const result = await cartService.updateCartQuantity(itemId, quantity);
            res.json({ result });
        } catch (error) {
            return res.status(404).json({ error: 'Failed to update cart item. Cart not found.'})
        }
    } catch (error) {
        console.error('Error updating cart item', error);
        res.status(500).json({ error: 'Failed to update cart item.'})
    }
});

router.delete('/cart_item/:id', authentication, async(req, res, next) => {
    try {
        const { id: userId } = req.user;
        const { id: cartItemsId } = req.params;

        const result = await cartService.deleteCartItem(cartItemsId);
        if(!result){
            return res.status(404).json({ error: 'Failed to delete cart item. CartItem not found.'})
        }
        res.json({message: 'Cart item successfully deleted', result })
    } catch (error) {
        console.error('Error deleting cart item: ', error);
        res.status(500).json({ error: 'Failed to delete cart item.'});
    }
});

router.delete('/cart/:id', authentication, async(req, res, next) => {
    try {
        const { id: userId } = req.user;
        const { id: cartId } = req.params;
        
        const cart = await cartService.getCartByUser(userId, cartId);
        if(!cart){
            return res.status(404).json({ error: 'Cart not found or does not belong to currently logged in user.'})
        }

        await cartService.deleteAllCartItems(cartId);

        res.json({ message: 'All items have been successfully deleted from the cart.'})
    } catch (error){
        console.error('Error deleting cart: ', error)
        res.status(500).json({ error: 'Failed to delete cart items.'});
    }
});

router.delete('/cart/admin_delete/:id', authentication, isAdmin, async(req, res, next)=> {
    try {
        const { id: userId } = req.params;
        await cartService.deleteCartByUserId(userId);
        res.json({message: 'Cart have been deleted.'});
    } catch (error) {
        console.error('Error deleting cart: ', error);
        res.status(500).json({error: 'Failed to delete carts. '});
    }
});

router.delete('/cart_item/admin_delete/:id', authentication, isAdmin, async (req, res, next) => {
    try {
        const { id: cartId } = req.params;
        await cartService.deleteAllCartItems(cartId);
        res.json({ message: 'Cart items have been deleted'});
    } catch (error) {
        console.error('Error deleting cart items: ', error);
        res.status(500).json({ error: 'Failed to delete cart items.'});
    }
});

module.exports = router;