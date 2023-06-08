const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const db = require('../models');
const CategoryService = require('../services/categoryService');
const ItemService = require('../services/itemService');
const categoryService = new CategoryService(db);
const itemService = new ItemService(db);

router.post('/', async (req, res, next) => {
    const {searchItem, searchCategory, searchSku, searchPriceRange } = req.body;

    try {
        const searchWhere = {};
        if(searchItem) {
            searchWhere.Name = {
                [Op.or]: [
                    { [Op.like]: `%${searchItem}%`},
                    { [Op.like]: `%${searchItem.toUpperCase()}%`},
                ],
            };
        }
        if(searchCategory) {
            const category = await categoryService.getOne(searchCategory);
            if(category){
                searchWhere.CategoryId = category.id;
            } else {
                return res.json({ message: 'Category not found.'});
            }
        }
        if(searchSku) {
            searchWhere.sku = searchSku;
        }
        if(searchPriceRange) {
            const { min, max } = searchPriceRange;
            searchWhere.price =  { [Op.between]: [min, max]};
        }

        const items = await itemService.search(searchWhere);

        if (items.length === 0) {
            return res.json({ message: 'No matches found.' });
        }
        res.json({ items });
    } catch (error) {
        console.error('Search error', error);
        res.status(500).json({ error: 'no matches found, please check your search format.'})
    }
});

module.exports = router;