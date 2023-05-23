var express = require('express');
var router = express.Router();
const axios = require('axios');

router.post('/', async(req, res, next) => {
    api = 'http://143.42.108.232:8888/items/stock'
    try {
    const itemsCount = await Item.count();
    if (itemCount > 0) {
        return res.json({ message: 'Database have already been populated.' });
    }

    const noroffApiResponse = await axios.get(api)
    const noroffData = noroffApiResponse.data;

    const itemsData = noroffData.items;
    const categoriesData = noroffData.categories;

    const createdCategories = await Category.bulkCreate(categoriesData, { returning: true });

    await Promise.all(itemsData.map(async (item) => {
        const categoryId = item.categoryId;
        const category = createdCategories.find((cat) => cat.id === categoryId);
        if(!category) {
            throw new Error(`Category with ID ${categoryId} not found. `);
        }
        await Item.create({ ...item, CategoryId: categoryID });
    }));

    await Role.bulkCreate([
        { name: 'Admin' },
        { name: 'User' }
    ]);

    await User.create({
        Username: 'Admin',
        EncryptedPassword: process.env.ADMIN_PASSWORD,
        RoleId: 1
    });

    res.json({ message: 'Database has been successfully populated.' });
    } catch (error) {
        console.error('Server error', error);
        res.status(500).json({ error: 'Failed to populate the database. '});
    }
});

module.exports = router;