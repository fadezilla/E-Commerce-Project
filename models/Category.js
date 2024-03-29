module.exports = (sequelize, Sequelize) => {
    const Category = sequelize.define('Category', {
        Name: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
    },{
        timestamps: false,
    });
    Category.associate = function (models) {
        Category.hasMany(models.Item)
    };
    return Category;
};