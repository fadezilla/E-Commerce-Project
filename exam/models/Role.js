module.exports = (sequelize, Sequelize) => {
    const Role = sequelize.define('Role', {
        Name: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
    },{
        timestamps: false,
    });
    Role.associate = function (models) {
        Role.hasMany(models.User);
    };
    return Role;
};