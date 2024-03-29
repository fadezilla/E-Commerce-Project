module.exports = (sequelize, Sequelize) => {
    const Item = sequelize.define('Item', {
        id: {
            type: Sequelize.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
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
        CategoryName: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false,
            unique: false,
        }
    });
    Item.associate = function (models) {
        Item.belongsTo(models.Category);
        Item.hasMany(models.CartItems);
        Item.hasMany(models.OrderItems);
    };
    return Item;
};