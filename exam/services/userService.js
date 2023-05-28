class UserService {
    constructor(db) {
        this.client = db.sequelize;
        this.User = db.User;
        this.Role = db.Role;
    }

    async getOne(userName) {
        return this.User.findOne({
            where: { UserName: userName}
        });
    }

    async create(userName, email, encryptedPassword, salt, roleName) {
        const role = await this.Role.findOne({
            where: { Name: roleName }
        });

        return this.User.create({
            UserName: userName,
            Email: email,
            EncryptedPassword: encryptedPassword,
            Salt: salt,
            RoleId: role.id
        });
    }

    async delete(userName) {
        return this.User.destroy({
            where: { UserName: userName}
        })
    }
}

module.exports = UserService;