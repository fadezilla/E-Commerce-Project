module.exports = (sequelize, Sequelize) => {
    const Order = sequelize.define('Order', {});
    Order.associate = function (models) {
        Order.belongsTo(models.User);
        Order.belongsToMany(models.Item, { through: models.OrderItem });
    };
    return Order;
};