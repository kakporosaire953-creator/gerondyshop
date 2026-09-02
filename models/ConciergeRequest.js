const { loadDb, saveDb, getNextId } = require('./dbHelpers');

module.exports = {
  async create(data) {
    const db = loadDb();
    const id = getNextId(db.concierge_requests);
    const createdAt = new Date().toISOString();
    const request = {
      id,
      user: Number(data.user),
      userName: data.userName,
      subject: data.subject,
      details: data.details,
      status: data.status || 'pending',
      createdAt,
    };
    db.concierge_requests.push(request);
    saveDb(db);
    return request;
  },

  async findAll() {
    const db = loadDb();
    return db.concierge_requests.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async findByUser(userId) {
    const db = loadDb();
    return db.concierge_requests
      .filter((request) => request.user === Number(userId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
};
