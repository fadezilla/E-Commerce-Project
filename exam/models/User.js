module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define('User', {
        Username: {
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
    },{
        timestamps: false,
    });
    User.associate = function (models) {
        User.belongsTo(models.Role);
        User.hasOne(models.Cart);
        User.hasMany(models.Order);
    };
    return User;
};