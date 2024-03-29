module.exports = (sequelize, Sequelize) => {
    const Order = sequelize.define('Order', {
        Status: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        }
    });
    Order.associate = function (models) {
        Order.belongsTo(models.User);
        Order.hasMany(models.OrderItems);
    };
    return Order;
};