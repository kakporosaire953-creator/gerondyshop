const { loadDb, saveDb, getNextId } = require('./dbHelpers');

module.exports = {
  async create(data) {
    const db = loadDb();
    const id = getNextId(db.messages);
    const createdAt = new Date().toISOString();
    const message = {
      id,
      sender: Number(data.sender),
      senderName: data.senderName,
      text: data.text,
      createdAt,
    };
    db.messages.push(message);
    saveDb(db);
    return message;
  },

  async findRecent(limit = 50) {
    const db = loadDb();
    return db.messages
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  },
};
