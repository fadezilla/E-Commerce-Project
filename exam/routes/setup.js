var express = require('express');
var router = express.Router();
const axios = require('axios');
const db = require('../models')
const { OP } = require('sequelize');
var crypto = require('crypto');
var UserService = require('../services/userService');
var userService = new UserService(db);
const { Item, Category, Role, User } = require('../models');

async function hashPassword(password, salt) {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 310000, 32, 'sha256', (err, hashedPassword) => {
      if(err) {
        reject(err);
      } else {
        resolve(hashedPassword.toString('hex'));
      }
    });
  });
}


router.post('/', async (req, res, next) => {
    const api = 'http://143.42.108.232:8888/items/stock';
  
    try {
      const itemCount = await Item.count();
      if (itemCount > 0) {
        return res.json({ message: 'Database has already been populated.' });
      }
  
      const response = await axios.get(api);
      const { data } = response.data;
  
      const categories = data.map(item => item.category);
      const uniqueCategories = [...new Set(categories)];
  
      // Create categories in bulk
      const createdCategories = await Category.bulkCreate(
        uniqueCategories.map(name => ({ Name: name }))
      );
  
      const categoryIdMap = {};
      createdCategories.forEach(category => {
        categoryIdMap[category.Name] = category.id;
      });
  
      const items = data.map(item => ({
        Name: item.item_name,
        price: item.price,
        StockQuantity: item.stock_quantity,
        SKU: item.sku,
        CategoryId: categoryIdMap[item.category],
      }));
  
      await Item.bulkCreate(items);
      await Role.bulkCreate([{ Name: 'Admin' }, { Name: 'User' }]);

      const salt = crypto.randomBytes(16).toString('hex');
      const hashedPassword = await hashPassword(process.env.USER_ADMIN_PASSWORD, salt);

      await userService.create('Admin', 'admin@admin.com', hashedPassword, salt, 'Admin');
  
      res.json({ message: 'Database has been successfully populated.' });
    } catch (error) {
      console.error('Server error', error);
      res.status(500).json({ error: 'Failed to populate the database.' });
    }
  });

  
module.exports = router;