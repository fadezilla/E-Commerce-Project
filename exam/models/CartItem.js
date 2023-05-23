module.exports = (sequelize, Sequelize) => {
    const CartItem = sequelize.define('CartItem', {
        Quantity: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
        },
    });
    CartItem.associate = function (models) {
        CartItem.belongsTo(models.Cart);
        CartItem.belongsTo(models.Item)
    };
    return CartItem;
};