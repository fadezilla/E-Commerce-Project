const express = require('express');
const router = express.Router();
const db = require('../models');
const CategoryService = require('../services/categoryService');
const categoryService = new CategoryService(db);
const authentication = require('../public/javascripts/authentication');
const isAdmin = require('../public/javascripts/isAdmin');

router.get('/categories', async (req, res, next) => {
    try {
        const categories = await categoryService.getAll();
        res.json({ categories });
    } catch (error) {
        console.error('Categories get error', error);
        res.status(500).json({ error: 'Failed to get categories. '});
    }
});

router.post('/category', authentication, isAdmin, async (req, res, next) => {
    const { name } = req.body;
    try {
        const existingCategory = await categoryService.getOne(name);
        if(existingCategory){
            return res.status(409).json({ error: 'Category name already exists.' });
        }

        const category = await categoryService.create(name);
        res.json({category, message: 'Category added!'});
    } catch(error) {
        console.error('Category creation error', error);
        res.status(500).json({ error: 'Failed to create category.'});
    }
});

router.put('/category/:id', authentication, isAdmin, async (req, res, next)=> {
    const categoryId = req.params.id;
    const { name } = req.body;

    try {
        const result = await categoryService.update(categoryId, name);
        if(result[0] === 0) {
            return res.status(404).json({ error: 'Category not found.'});
        }
        res.json({ message: 'category updated!'});
    } catch (error) {
        console.error('Update category error', error);
        res.status(500).json({ error: 'Failed to update category. '});
    }
});

router.delete('/category/:id', authentication, isAdmin, async(req, res, next)=> {
    const categoryId = req.params.id;
    try{
        const category = await categoryService.delete(categoryId);
        if(!category){
            return res.status(404).json({ error: 'category not found. '});
        }
        res.json({ message: 'category deleted!'});
    } catch (error) {
        console.error('Delete category error. ');
        res.status(500).json({ error: 'Failed to delete category. '});
    }
});

module.exports = router;