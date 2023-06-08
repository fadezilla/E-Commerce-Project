module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define('User', {
        FirstName: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false,
            unique: false,
        },
        LastName: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false,
            unique: false,
        },
        UserName: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        Email: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false,
            unique: false,
        },
        EncryptedPassword: {
            type: Sequelize.DataTypes.BLOB,
            allowNull: false,
        },
        Salt: {
            type: Sequelize.DataTypes.BLOB,
            allowNull: false,
        },
    });
    User.associate = function (models) {
        User.belongsTo(models.Role, { foreignKey: 'RoleId' });
        User.hasOne(models.Cart);
        User.hasMany(models.Order);
    };
    return User;
};