const { loadDb, saveDb, getNextId } = require('./dbHelpers');

module.exports = {
  async findOne(filter) {
    const db = loadDb();
    if (filter.email) {
      return db.users.find((user) => user.email === filter.email.toLowerCase()) || null;
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
      phone: data.phone,
      role: data.role || 'user',
      createdAt,
    };
    db.users.push(user);
    saveDb(db);
    return user;
  },
};
