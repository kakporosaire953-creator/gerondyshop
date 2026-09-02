const { loadDb, saveDb, getNextId } = require('./dbHelpers');

module.exports = {
  async create(data) {
    const db = loadDb();
    const id = typeof data.id === 'number' ? data.id : getNextId(db.products);
    const createdAt = new Date().toISOString();
    const product = {
      id,
      name: data.name,
      price: Number(data.price),
      category: data.category || 'Autres',
      description: data.description || '',
      image: data.image || '',
      seller: data.seller || '',
      createdAt,
    };
    db.products.push(product);
    saveDb(db);
    return product;
  },

  async update(id, data) {
    const db = loadDb();
    const productIndex = db.products.findIndex((item) => item.id === Number(id));
    if (productIndex === -1) {
      return null;
    }

    const product = {
      ...db.products[productIndex],
      ...data,
      price: Number(data.price ?? db.products[productIndex].price),
      id: Number(id),
    };

    db.products[productIndex] = product;
    saveDb(db);
    return product;
  },

  async delete(id) {
    const db = loadDb();
    const beforeCount = db.products.length;
    db.products = db.products.filter((product) => product.id !== Number(id));
    if (db.products.length === beforeCount) {
      return false;
    }
    saveDb(db);
    return true;
  },

  async findAll() {
    const db = loadDb();
    return db.products.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async findBySeller(sellerEmail) {
    const db = loadDb();
    return db.products
      .filter((product) => product.seller === sellerEmail)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
};
