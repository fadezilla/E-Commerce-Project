class CartService {
    constructor(db) {
        this.client = db.sequelize;
        this.Cart = db.Cart;
        this.User = db.User;
        this.Item = db.Item;
        this.CartItems = db.CartItems;
    }

    async get(userId) {
        return this.Cart.findAll({
            where: { UserId: userId},
            include: [{
                model: this.CartItems,
                include: [{ model: this.Item }]
            }]
        });
    }

    async getOne(userId){
        return this.Cart.findOne({
            where: { UserId: userId },
            include: { model:this.CartItems, include: this.Item },
        });
    }

    async getCart(userId){
        return this.Cart.findOne({
            where: { UserId: userId}
        });
    }

    async getCartItemsByUser(userId) {
        return this.CartItems.findAll({
          where: { UserId: userId },
          include: [this.Item],
        });
      }

    async getCartByUser(userId, cartId){
        return this.Cart.findOne({
            where: { UserId: userId, id: cartId}
        });
    }

    async createCart(userId) {
        const cart = await this.Cart.findOne({
            where: { UserId: userId }
        });

        if(cart){
            return cart;
        }

        return this.Cart.create({
          UserId: userId
        });
      }

    async getAll() {
        return this.client.query(`
        SELECT
        C.id AS cartId,
        U.id AS userId,
        U.UserName,
        CI.id AS cartItemId,
        CI.Quantity,
        CI.PurchasePrice,
        I.id AS itemId,
        I.Name AS itemName,
        I.price AS itemPrice
        FROM Carts AS C
        INNER JOIN Users AS U ON C.UserId = U.id
        INNER JOIN CartItems AS CI ON CI.CartId = C.id
        INNER JOIN Items AS I ON CI.ItemId = I.id;
        `, { type: this.client.QueryTypes.SELECT });
    }

    async getCartItems(cartId){
        return this.CartItems.findAll({
            where: { CartId: cartId },
            include: [{ model: this.Item}]
        });
    }

    async addItemToCart(userId, itemId, quantity) {
        const item = await this.Item.findByPk(itemId);
        if (!item) {
          throw new Error('Item not found');
        }
      
        const cart = await this.Cart.findOne({
          where: { UserId: userId },
        });
      
        if (!cart) {
          throw new Error('Cart not found');
        }
        return this.CartItems.create({
          CartId: cart.id,
          ItemId: itemId,
          PurchasePrice: item.price * quantity,
          Quantity: quantity,
        });
      }

      async updateCartQuantity(itemId, quantity) {
        const cartItem = await this.CartItems.findOne({
            where: { ItemId: itemId }
        })
        if(!cartItem) {
            throw new Error('Cart item not found');
        }
        const item = await this.Item.findByPk(itemId);
        if(!item) {
            throw new Error('Item not found');
        }
        cartItem.Quantity = quantity;
        cartItem.PurchasePrice = item.price * quantity;
        await cartItem.save();
        return cartItem;
      }

    async deleteCartItem(cartItemsId) {
        const cartItems = await this.CartItems.findOne({
            where: { ItemId: cartItemsId },
            include: [this.Item]
        })
        if(!cartItems){
            throw new Error('Cart item not found');
        }
        const deletedItem = { Item: cartItems.Item.Name };
        await cartItems.destroy();
        return deletedItem;
    }
    
    async deleteAllCartItems(cartId){
        return this.CartItems.destroy({
            where: { CartId: cartId }
        });
    }

    async deleteCartByUserId(userId){
        return this.Cart.destroy({
            where: { UserId: userId }
        });
    }

    async deleteCart(cartId) {
        const cart = await this.Cart.findByPk(cartId);
        if (!cart) {
          throw new Error('Cart not found');
        }
        await cart.destroy();
      }
      
}

module.exports = CartService;