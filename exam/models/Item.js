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
        SKU: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
    });
    Item.associate = function (models) {
        Item.belongsTo(models.Category, { foreignKey: 'CategoryId' });
        Item.belongsToMany(models.Cart, { through: models.CartItem });
        Item.belongsToMany(models.Order, { through: models.OrderItem });
    };
    return Item;
};