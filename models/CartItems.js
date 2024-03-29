module.exports = (sequelize, Sequelize) => {
    const CartItems = sequelize.define('CartItems', {
        id: {
            type: Sequelize.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        Quantity: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
        },
        PurchasePrice: {
            type: Sequelize.DataTypes.DECIMAL(10, 2),
            allowNUll: false
        }
    });
    CartItems.associate = function (models) {
        CartItems.belongsTo(models.Cart, { foreignKey: 'CartId'});
        CartItems.belongsTo(models.Item);
    };
    return CartItems;
};