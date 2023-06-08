class UserService {
    constructor(db) {
        this.client = db.sequelize;
        this.User = db.User;
        this.Role = db.Role;
    }

    async getOne(email) {
        return this.User.findOne({
            where: { Email: email}
        });
    }

    async getEmail(userId){
        const user = await this.User.findOne({
            where: { id: userId },
        });

        if(!user){
            throw new Error('User not found');
        }

        return user.Email;
    }

    async getEmailCount(email){
        return this.User.count({
            where: { Email: email },
        });
    }

    async getOneByUsername(username){
        return this.User.findOne({
            where: { Username: username },
        });
    }

    async getOneUser(userId){
        return this.User.findOne({
            where: { Id: userId}
        });
    }

    async create(firstName, lastName, name, email, encryptedPassword, salt, roleName) {
        const role = await this.Role.findOne({
            where: { Name: roleName }
        });
        
        return this.User.create({
            FirstName: firstName,
            LastName: lastName,
            UserName: name,
            Email: email,
            EncryptedPassword: encryptedPassword,
            Salt: salt,
            RoleId: role.id
        });
    }

    async delete(username) {
        return this.User.destroy({
            where: { UserName: username}
        })
    }
}

module.exports = UserService;