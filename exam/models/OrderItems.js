module.exports = (sequelize, Sequelize) => {
    const OrderItems = sequelize.define('OrderItems', {
        Quantity: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
        },
        PurchasePrice: {
            type: Sequelize.DataTypes.DECIMAL(10, 2),
            allowNUll: false
        }
    });
    OrderItems.associate = function (models) {
        OrderItems.belongsTo(models.Order);
        OrderItems.belongsTo(models.Item);
    };
    return OrderItems;
};