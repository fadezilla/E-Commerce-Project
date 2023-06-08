const express = require('express');
const router = express.Router();
const db = require('../models');
const axios = require('axios');
const crypto = require('crypto');
const UserService = require('../services/userService');
const userService = new UserService(db);
const CartService = require('../services/cartService');
const cartService = new CartService(db);
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const jwt = require('jsonwebtoken');
const { Item, Category, Role, User } = require('../models');
const authentication = require('../public/javascripts/authentication');
const isAdmin = require('../public/javascripts/isAdmin');

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/setup', async (req, res, next) => {
  try {
    const itemCount = await Item.count();
    if (itemCount > 0) {
      return res.status(400).json({ error: 'Database has already been populated.' });
    }

    const response = await axios.get(process.env.ITEM_API);
    const { data } = response.data;

    const categories = data.map(item => item.category);
    const uniqueCategories = [...new Set(categories)];

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
      CategoryName: item.category,
    }));

    await Item.bulkCreate(items);
    await Role.bulkCreate([{ Name: 'Admin' }, { Name: 'User' }]);

    const salt = crypto.randomBytes(16);
    const password = process.env.USER_ADMIN_PASSWORD;

    crypto.pbkdf2(password, salt, 310000, 32, 'sha256', function(err, hashedPassword) {
      if (err) {
        return next(err);
      }
      userService.create('admin', 'user','Admin', 'admin@admin.com', hashedPassword, salt, 'Admin')
        .then(() => {
          res.json({ message: 'Database has been successfully populated.' });
        })
        .catch((error) => {
          console.error('Error creating admin:', error);
          res.status(500).json({ error: 'Failed to create admin user.' });
        });
    });
  } catch (error) {
    console.error('Server error', error);
    res.status(500).json({ error: 'Failed to populate the database.' });
  }
});

router.post("/login", jsonParser, async (req, res, next) => {
  const { username, password } = req.body;
  if (!username) {
    return res.status(400).json({ error: "Username is required." });
  }
  if (!password) {
    return res.status(400).json({ error: "Password is required." });
  }
  try {
    const data = await userService.getOneByUsername(username);
    if (data === null) {
      return res.status(401).json({ error: "Incorrect email or password" });
    }
    crypto.pbkdf2(password, data.Salt, 310000, 32, 'sha256', async function(err, hashedPassword) {
      if (err) {
        return cb(err);
      }
      if (!crypto.timingSafeEqual(data.EncryptedPassword, hashedPassword)) {
        return res.status(401).json({ error: "Incorrect email or password" });
      }
      let token;
      try {
        token = jwt.sign(
          { id: data.id, username: data.UserName },
          process.env.TOKEN_SECRET,
          { expiresIn: "2h" }
        );
      } catch (err) {
        return res.status(500).json({ error: "Something went wrong with creating JWT token" });
      }
      try {
        const cart = await cartService.createCart(data.id);
        res.json({
          result: 'You are logged in',
          id: data.id,
          email: data.Email,
          username: data.Username,
          token: token,
          cart: cart
        });
      } catch (error) {
        console.error('cart creation error', error);
        return res.json({ error: 'Something went wrong with creating the cart.'})
      }
    });
  } catch (err) {
    return res.status(500).json({ error: "Something went wrong while processing login" });
  }
});

router.post("/signup", async (req, res, next) => {
  const { firstname, lastname, username, email, password } = req.body;
  if (!firstname) {
    return res.status(400).json({ error: "Firstname is required." });
  }
  if (!lastname) {
    return res.status(400).json({ error: "Lastname is required." });
  }
  if (!username) {
    return res.status(400).json({ error: "Username is required." });
  }
  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }
  if (!password) {
    return res.status(400).json({ error: "Password is required." });
  }
  try {
    const user = await userService.getOneByUsername(username);
    if (user != null) {
      return res.status(400).json({ error: "Provided username is already in use." });
    }
    const emailCount = await userService.getEmailCount(email);
    if(emailCount >= 4) {
      return res.status(400).json({ error: 'Maximum email limit reached, please use another email.'})
    }
    const salt = crypto.randomBytes(16);
    crypto.pbkdf2(password, salt, 310000, 32, 'sha256', function(err, hashedPassword) {
      if (err) {
        return next(err);
      }
      userService.create(firstname, lastname, username, email, hashedPassword, salt, 'User')
        .then(() => {
          res.json({ result: "You created an account." });
        })
        .catch((error) => {
          console.error('Signup error', error);
          res.status(500).json({ error: "Failed to create an account." });
        });
    });
  } catch (error) {
    console.error('Signup error', error);
    res.status(500).json({ error: "Failed to create an account." });
  }
});

router.delete('/userdelete', authentication, isAdmin, jsonParser, async function(req, res, next) {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: "Username is required." });
  }
  try {
    const user = await userService.getOneByUsername(username);
    if (user == null) {
      return res.status(404).json({ error: "No such user in the database" });
    }
    await userService.delete(username);
    res.json({ result: "You deleted an account.", UserName: username });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: "Failed to delete the user." });
  }
});

module.exports = router;