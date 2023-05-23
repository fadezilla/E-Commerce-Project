module.exports = (sequelize, Sequelize) => {
    const OrderItem = sequelize.define('Order', {
        Quantity: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
        },
    });
    OrderItem.associate = function (models) {
        OrderItem.belongsTo(models.Order);
        OrderItem.belongsTo(models.Item);
    };
    return OrderItem;
};