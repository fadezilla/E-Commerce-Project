class ItemService {
    constructor(db) {
        this.client = db.sequelize;
        this.Item = db.Item;
        this.Category = db.Category
    }

    async getOne(itemName) {
        return this.Item.findOne({
            where: { Name: itemName}
        });
    }
    
    async getOneBySku(SKU){
        return this.Item.findOne({
            where: { SKU: SKU}
        });
    }

    async getItem(itemId){
        return this.Item.findOne({
            where: { id: itemId}
        });
    }

    async getAll() {
        return this.Item.findAll();
    }

    async create(name, price, stockQuantity, SKU, categoryName) {
        const newItem = {
          Name: name,
          price: price,
          StockQuantity: stockQuantity,
          SKU: SKU,
          CategoryId: null,
          CategoryName: categoryName,
        };
      
        if (categoryName) {
          let category = await this.Category.findOne({
            where: { Name: categoryName },
          });
      
          if (!category) {
            const lastCategory = await this.Category.findOne({
              order: [['id', 'DESC']],
            });
      
            const newCategoryId = lastCategory ? lastCategory.id + 1 : 1;
            category = await this.Category.create({ id: newCategoryId, Name: categoryName });
          }
      
          newItem.CategoryId = category.id;
        }
      
        return this.Item.create(newItem);
      }
    
    async search(searchWhere) {
        return this.Item.findAll({
            where: searchWhere,
            include: [this.Category]
        })
    }
    async update(itemId, itemName, price, stockQuantity, SKU, categoryName) {
        return this.Item.update({
            Name: itemName,
            price: price,
            StockQuantity: stockQuantity,
            SKU: SKU,
            CategoryName: categoryName
        },{
            where: { id: itemId }
        }
        );
    }

    async delete(itemId) {
        return this.Item.destroy({
            where: { id: itemId}
        })
    }
}

module.exports = ItemService;