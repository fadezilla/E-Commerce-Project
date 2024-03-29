class CategoryService {
    constructor(db) {
        this.client = db.sequelize;
        this.Category = db.Category;
    }

    async getOne(categoryName) {
        return this.Category.findOne({
            where: { Name: categoryName}
        });
    }
    async getAll() {
        return this.Category.findAll();
    }

    async update(id, Name) {
        return this.Category.update(
            { Name },
            {where: { id }}
        );
    }

    async create(categoryName) {
        return this.Category.create({
            Name: categoryName
        });
    }

    async delete(id) {
        return this.Category.destroy({
            where: { id: id }
        });
    }
}

module.exports = CategoryService;