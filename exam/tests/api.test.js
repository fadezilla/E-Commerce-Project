const request = require('supertest');
const db = require('../models');
const app = require('../app');
const ItemService = require('../services/itemService');
const itemService = new ItemService(db);

test('POST /setup, Should populate the database', async () => {
    const response = await request(app).post('/setup');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Database has been successfully populated.');
});

test('POST /signup Should register a new user', async () => {
    const response = await request(app)
    .post('/signup')
    .send({
        firstname: 'test',
        lastname: 'user',
        username: 'testuser',
        email: 'tests@user.com',
        password: '123'
    });
    expect(response.status).toBe(200);
    expect(response.body.result).toBe('You created an account.');
});

test('POST /signup Should return an error if the username already exists', async () => {
    const response = await request(app)
    .post('/signup')
    .send({
        firstname: 'test',
        lastname: 'user',
        username: 'testuser',
        email: 'test@user.com',
        password: '123'
    });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Provided username is already in use.');
});

test('POST /signup Should return an error if the email has been used more than 4 times', async () => {
    for (let i = 0; i < 4; i++){
        await request(app)
        .post('/signup')
        .send({
            firstname: 'test',
            lastname: 'user',
            username: `user${i}`,
            email: `test@user.com`,
            password: '123'
        });
    }
    const response = await request(app)
    .post('/signup')
    .send({
        firstname: 'test',
        lastname: 'user',
        username: `newUser`,
        email: 'test@user.com',
        password: '123'
    });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Maximum email limit reached, please use another email.');
});

let userToken;
let cartId;
let userId;
test('POST /login Login and token retrieval', async () => {
    const response = await request(app)
    .post('/login')
    .send({
        username: 'testuser',
        password: '123'
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');

    userToken = response.body.token;
    cartId = response.body.cart.id;
    userId = response.body.id;
});

test('POST /login Should return an error if the username does not exist', async () => {
    const response = await request(app)
    .post('/login')
    .send({
        username: 'doesNotExist',
        password: '123'
    });
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Incorrect email or password');
});

test('POST /login Should return an error if the password is incorrect', async () => {
    const response = await request(app)
    .post('/login')
    .send({
        username: 'testuser',
        password: 'wrongPassword',
    });
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Incorrect email or password');
});

test('POST /search Should search for items with the text "mart" in the item name', async () => {
    const response = await request(app)
    .post('/search')
    .send({
        searchItem: 'mart',
    });
    expect(response.status).toBe(200)
    expect(response.body.items).toHaveLength(3);
});

test('POST /search should search for items with the name "Laptop"', async () => {
    const response = await request(app)
    .post('/search')
    .send({
        searchItem: 'Laptop',
    });
    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0]).toHaveProperty('Name', 'Laptop');
});

test('POST /search Should search for items in the category "Furniture"', async () => {
    const response = await request(app)
    .post('/search')
    .send({
        searchCategory: 'Furniture',
    });
    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(4);
});

test('POST /search Should search for item with the SKU: "EL133"', async () => {
    const response = await request(app)
    .post('/search')
    .send({
        searchSku: 'EL133',
    });
    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0]).toHaveProperty('SKU', 'EL133');
    expect(response.body.items[0]).toHaveProperty('Name', 'Smart Watch');
});

test('POST /search Should search for items in the price range of 100.00 to 160.00', async () => {
    const response = await request(app)
        .post('/search')
        .send({
        searchPriceRange: {
            min: 100.00,
            max: 160.00,
        },
        });
    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(4);
});

test('POST /cart_item Should add an item to the cart', async () => {
    const response = await request(app)
    .post('/cart_item')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
        itemId: 1,
        quantity: 1,
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('CartId');
    expect(response.body).toHaveProperty('Quantity', 1);
});

test('POST /cart_item Should return an error if item does not exist when adding to cart', async() => {
    const response = await request(app)
    .post('/cart_item')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
        itemId: 100,
        quantity: 1,
    });
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Failed to add item to cart.');
});
let orderId;
test('POST /order/:id Should create an order', async() => {
    const response = await request(app)
    .post('/order/1')
    .set('Authorization', `Bearer ${userToken}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Order successfully made!');
    expect(response.body.result.Order).toHaveProperty('PurchasePrice')
    expect(response.body.result).toHaveProperty('Order');

    orderId = response.body.result.Order.id;

    const item = await itemService.getItem(1);
    expect(item.StockQuantity).toBe(1);

    item.StockQuantity = 2;
    await item.save();
    
});

test('POST /cart_item Should add an item to the cart (create another order so we can test errors)', async () => {
    const response = await request(app)
    .post('/cart_item')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
        itemId: 2,
        quantity: 600,
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('CartId');
    expect(response.body).toHaveProperty('Quantity', 600);
});

test('POST /order/:id Should return an error if the order stock is more than what item table have.', async () => {
    const response = await request(app)
    .post('/order/2')
    .set('Authorization', `Bearer ${userToken}`);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Failed to create order item. Not enough stock.');
});
let adminToken ;
test('POST /login Admin Login and token retrieval', async () => {
    const response = await request(app)
    .post('/login')
    .send({
        username: 'Admin',
        password: process.env.USER_ADMIN_PASSWORD
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');

    adminToken = response.body.token;
});

test('Admin user /orders endpoint Should get all orders as an admin user', async() => {
    const response = await request(app)
    .get('/orders')
    .set('Authorization', `Bearer ${adminToken}`)
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
});
let categoryId;
test('POST /category Should create a new category', async () => {
    const response = await request(app)
    .post('/category')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
           name: 'CAT_TEST',
    });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Category added!');
    expect(response.body.category).toHaveProperty('id');
    expect(response.body.category).toHaveProperty('Name', 'CAT_TEST');
    categoryId = response.body.category.id;
});

test('POST /category Should return an error if the category name already exists', async () => {
    const response = await request(app)
    .post('/category')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
        name: 'CAT_TEST',
    });
    expect(response.status).toBe(409);
    expect(response.body.error).toBe('Category name already exists.');
});
let itemId;
test('POST /item Should create a new item', async () => {
    const response = await request(app)
    .post('/item')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
        name: 'ITEM_TEST',
        price: 10.00,
        stockQuantity: 50,
        SKU: 'TES123',
        categoryName: 'CAT_TEST',
    });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('item added!');
    expect(response.body.item).toHaveProperty('id');
    expect(response.body.item).toHaveProperty('Name', 'ITEM_TEST');
    expect(response.body.item).toHaveProperty('CategoryName', 'CAT_TEST');
    expect(response.body.item).toHaveProperty('CategoryId');
    itemId = response.body.item.id;
});

test('POST /item Should return an error if the item name already exists in the database', async() => {
    const response = await request(app)
    .post('/item')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
        name: 'ITEM_TEST',
        price: '10.00',
        stockQuantity: 100,
        SKU: 'TET123',
        categoryName: 'CAT_TEST',
    });
    expect(response.status).toBe(409);
    expect(response.body.error).toBe('An item with the same name already exists.')
});

test('POST /item Should return an error if the SKU Already exists', async () => {
    const response = await request(app)
    .post('/item')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
        name: 'ITEM_TEST1',
        price: '10.00',
        stockQuantity: 100,
        SKU: 'TES123',
        categoryName: 'CAT_TEST',
    });
    expect(response.status).toBe(409);
    expect(response.body.error).toBe('An item with the same SKU already exists.');
});
test('PUT /order/:id Should update the order status', async () => {
    const response = await request(app)
    .put(`/order/${orderId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ status: 'completed' });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Order status updated successfully');
});
test('PUT /order/:id Should return an error if order not found', async () => {
    const response = await request(app)
    .put('/order/100')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ status: 'completed' });
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Order not found.');
});

test('GET /allorders Should retrieve all orders', async () => {
    const response = await request(app)
    .get('/allorders')
    .set('Authorization', `Bearer ${adminToken}`)
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
});

test('GET /allcarts Should retrieve all carts', async () => {
    const response = await request(app)
    .get('/allcarts')
    .set('Authorization', `Bearer ${adminToken}`)
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
});

test('DELETE /item/:id should remove the created item', async () => {
    const response = await request(app)
    .delete(`/item/${itemId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'item deleted!');
});

test('DELETE /item/:id should remove the created category', async () => {
    const response = await request(app)
    .delete(`/category/${categoryId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'category deleted!');
});

test('DELETE /cart_item/admin_delete/:id To delete the created cart items', async () => {
    const response = await request(app)
    .delete(`/cart_item/admin_delete/${cartId}`)
    .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200)
});

test('DELETE /cart/admin_delete/:id Should delete a cart', async () => {
    const response = await request(app)
      .delete(`/cart/admin_delete/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`);
      
    expect(response.status).toBe(200);
});

test('DELETE /order_item/:id Should delete order items', async () => {
    const response = await request(app)
      .delete(`/order_item/${orderId}`)
      .set('Authorization', `Bearer ${adminToken}`);
      
    expect(response.status).toBe(200);
});

test('DELETE /order/:id Should delete an order', async () => {
    const response = await request(app)
      .delete(`/order/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`);
      
    expect(response.status).toBe(200);
});

test('DELETE /userdelete Should remove a user', async () => {
    const response = await request(app)
      .delete('/userdelete')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({username: "testuser"})
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('result', 'You deleted an account.')
});

test('DELETE /deleteuser Should remove users and associated carts, cart items, orders, and order items', async () => {
    for (let i = 0; i < 4; i++) {
      const response = await request(app)
        .delete(`/userdelete`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ username: `user${i}` });
      expect(response.status).toBe(200);
    }
});

test('POST /setup should not make an API call or populate the database', async () => {
    const response = await request(app).post('/setup');
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Database has already been populated.');
});