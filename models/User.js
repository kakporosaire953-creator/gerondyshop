const { loadDb, saveDb, getNextId } = require('./dbHelpers');

module.exports = {
  async findOne(filter) {
    const db = loadDb();
    if (filter.email) {
      return db.users.find((user) => user.email.toLowerCase() === filter.email.toLowerCase()) || null;
    }
    if (filter.id) {
      return db.users.find((user) => user.id === Number(filter.id)) || null;
    }
    return null;
  },

  async findById(id) {
    const db = loadDb();
    return db.users.find((user) => user.id === Number(id)) || null;
  },

  async create(data) {
    const db = loadDb();
    const id = getNextId(db.users);
    const createdAt = new Date().toISOString();
    const user = {
      id,
      name: data.name,
      email: data.email.toLowerCase(),
      password: data.password,
      phone: data.phone || '',
      role: data.role || 'user',
      walletBalance: data.walletBalance !== undefined ? Number(data.walletBalance) : 100000,
      avatar: data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      city: data.city || 'Cotonou',
      district: data.district || '',
      storeName: data.storeName || '',
      createdAt,
    };
    db.users.push(user);
    saveDb(db);
    return user;
  },

  async update(id, data) {
    const db = loadDb();
    const index = db.users.findIndex((u) => u.id === Number(id));
    if (index === -1) return null;

    const current = db.users[index];
    const updated = {
      ...current,
      ...data,
      id: Number(id),
      walletBalance: data.walletBalance !== undefined ? Number(data.walletBalance) : current.walletBalance,
    };

    db.users[index] = updated;
    saveDb(db);
    return updated;
  },

  async findAll() {
    const db = loadDb();
    return db.users.slice();
  },
};
