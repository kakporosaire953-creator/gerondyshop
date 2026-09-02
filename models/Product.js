const { loadDb, saveDb, getNextId } = require('./dbHelpers');

module.exports = {
  async create(data) {
    const db = loadDb();
    const id = typeof data.id === 'number' ? data.id : getNextId(db.products);
    const createdAt = new Date().toISOString();
    const product = {
      id,
      name: data.name,
      category: data.category || 'tech',
      price: Number(data.price),
      originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
      badge: data.badge || '',
      stock: data.stock !== undefined ? Number(data.stock) : 10,
      description: data.description || '',
      shortSpecs: data.shortSpecs || '',
      specs: data.specs || {},
      image: data.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      seller: data.seller || 'Gérondy Store Officiel',
      sellerEmail: data.sellerEmail || 'seller@gerondyshop.com',
      sellerId: data.sellerId || 2,
      rating: data.rating ? Number(data.rating) : 4.8,
      reviewsCount: data.reviewsCount ? Number(data.reviewsCount) : 12,
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

    const current = db.products[productIndex];
    const product = {
      ...current,
      ...data,
      id: Number(id),
      price: data.price !== undefined ? Number(data.price) : current.price,
      originalPrice: data.originalPrice !== undefined ? (data.originalPrice ? Number(data.originalPrice) : null) : current.originalPrice,
      stock: data.stock !== undefined ? Number(data.stock) : current.stock,
      specs: data.specs ? { ...current.specs, ...data.specs } : current.specs,
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

  async findById(id) {
    const db = loadDb();
    return db.products.find((p) => p.id === Number(id)) || null;
  },

  async findByCategory(category) {
    const db = loadDb();
    if (!category || category === 'all') return db.products;
    return db.products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  },

  async findBySeller(sellerEmail) {
    const db = loadDb();
    return db.products
      .filter((product) => product.sellerEmail === sellerEmail || product.seller === sellerEmail)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
};
