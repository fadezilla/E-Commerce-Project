class OrderService {
    constructor(db) {
        this.client = db.sequelize;
        this.Order = db.Order;
        this.User = db.User;
        this.Item = db.Item;
        this.OrderItems = db.OrderItems;
        this.CartItems = db.CartItems;
    }

    async getUserOrder(userId){
        return this.Order.findAll({
            where: { UserId: userId },
            include: [this.OrderItems],
        });
    }

    async getAllOrders(){
        return this.Order.findAll({
            include: [this.OrderItems],
        });
    }

    async findOrder(userId){
        return this.Order.findOne({
            where: { UserId: userId },
        });
    }

    async findOrderById(orderId){
        return this.Order.findOne({
            where: { id: orderId}
        })
    }

    async getallOrdersQuery(){
        return this.client.query( `
        SELECT
        O.id AS orderId,
        O.Status,
        O.createdAt AS orderCreatedAt,
        O.updatedAt AS orderUpdatedAt,
        U.id AS userId,
        U.FirstName,
        U.LastName,
        I.id AS itemId,
        I.price AS itemPrice,
        OI.Quantity,
        OI.PurchasePrice
        FROM Orders AS O
        INNER JOIN Users AS U ON O.UserId = U.id
        INNER JOIN OrderItems AS OI ON OI.OrderId = O.id
        INNER JOIN Items AS I ON OI.ItemId = I.id;
        `,{ type: this.client.QueryTypes.SELECT });
    }

    async createOrder(userId, itemId) {
        const item = await this.Item.findByPk(itemId);
        if(!item){
            throw new Error('Item not found');
        }

        const cartItem = await this.CartItems.findOne({
            where: { ItemId: itemId },
        });

        if(!cartItem) {
            throw new Error('Cart item not found');
        }

        if(item.StockQuantity < cartItem.Quantity) {
            throw new Error('Not enough stock')
        };
    
       const order = await this.Order.create({
        UserId: userId,
        Status: 'Process',
       });
       
        const orderItem = await this.OrderItems.create({
            OrderId: order.id,
            ItemId: itemId,
            Quantity: cartItem.Quantity,
            PurchasePrice: cartItem.PurchasePrice,
        });

        item.StockQuantity -= cartItem.Quantity;
        await item.save();

        return orderItem;
    }

    async updateOrder(orderId, status){
        const order = await this.Order.findByPk(orderId);
        if(!order){
            throw new Error('Order not found.');
        }

        order.Status = status;
        await order.save();
    }

    async deleteOrderById(userId) {
        return this.Order.destroy({ 
            where: { UserId: userId } 
        });
    }

    async deleteOrderItems(orderId){
        return this.OrderItems.destroy({
            where:{ OrderId: orderId}
        });
    }
}

module.exports = OrderService;