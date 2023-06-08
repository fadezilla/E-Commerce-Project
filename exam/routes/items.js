const express = require('express');
const router = express.Router();
const db = require('../models');
const ItemService = require('../services/itemService');
const itemService = new ItemService(db);
const authentication = require('../public/javascripts/authentication');
const isAdmin = require('../public/javascripts/isAdmin');


router.get('/items', async (req, res, next) => {
    try {
        const items = await itemService.getAll();
        res.json({ items });
    } catch (error) {
        console.error('Items get error', error);
        res.status(500).json({ error: 'Failed to get items. '});
    }
});

router.post('/item', authentication, isAdmin, async (req, res, next) => {
    const { name, price, stockQuantity, SKU, categoryName  } = req.body;
    try {
        const duplicateName = await itemService.getOne(name);
        if(duplicateName){
            return res.status(409).json({ error: 'An item with the same name already exists.'});
        }

        const duplicateSku = await itemService.getOneBySku(SKU);
        if(duplicateSku){
            return res.status(409).json({ error: 'An item with the same SKU already exists.'});
        }
        const item = await itemService.create(name, price, stockQuantity, SKU, categoryName);
        res.json({item,  message: 'item added!'});
    } catch (error) {
        console.error('item creation error', error);
        res.status(500).json({ error: 'Failed to create item. '});
    }
});

router.put('/item/:id', authentication, isAdmin, async (req, res, next)=> {
    const itemId = req.params.id;
    const { name, price, stockQuantity, SKU, categoryName } = req.body;
    try {
        const result = await itemService.update(itemId, name, price, stockQuantity, SKU, categoryName);
        if (result === 0){
            return res.status(404).json({ error: 'Item not found.'});
        }

        res.json({ message: 'Item updated!'});
    } catch (error) {
        console.error('Update item error', error);
        res.status(500).json({ error: 'Failed to update item.'})
    }
});

router.delete('/item/:id', authentication, isAdmin, async(req, res, next)=> {
    const itemId = req.params.id;

    try{
        const item = await itemService.delete(itemId);
        if(!item){
            return res.status(404).json({ error: 'item not found. '});
        }
        res.json({ message: 'item deleted!'});
    } catch (error) {
        console.error('item category error. ');
        res.status(500).json({ error: 'Failed to delete item. '});
    }
});

module.exports = router;