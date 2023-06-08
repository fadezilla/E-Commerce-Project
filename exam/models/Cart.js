module.exports = (sequelize, Sequelize) => {
    const Cart = sequelize.define('Cart', {
        id: {
            type: Sequelize.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
    });
    Cart.associate = function (models) {
        Cart.belongsTo(models.User);
        Cart.hasMany(models.CartItems, { foreignKey: 'CartId'});
    };
    return Cart;
};