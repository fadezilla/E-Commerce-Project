module.exports = (sequelize, Sequelize) => {
    const Item = sequelize.define('Item', {
        Name: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false,
        },
        price: {
            type: Sequelize.DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        StockQuantity: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
        },
    });
    Item.associate = function (models) {
        Item.belongsTo(models.Category);
        Item.belongsToMany(models.Cart, { through: models.CartItem });
        Item.belongsToMany(models.Order, { through: models.OrderItem });
    };
    return Item;
};