const { loadDb, saveDb, getNextId } = require('./dbHelpers');

module.exports = {
  async create(data) {
    const db = loadDb();
    if (!db.messages) db.messages = [];
    const id = getNextId(db.messages);
    const createdAt = new Date().toISOString();
    const message = {
      id,
      conversationId: data.conversationId || 'default',
      senderId: Number(data.senderId || data.sender),
      senderName: data.senderName || 'Utilisateur Gérondy',
      recipientId: data.recipientId ? Number(data.recipientId) : null,
      recipientName: data.recipientName || 'Support Gérondy',
      text: data.text,
      productContext: data.productContext || null,
      read: false,
      createdAt,
    };
    db.messages.push(message);
    saveDb(db);
    return message;
  },

  async findRecent(limit = 100) {
    const db = loadDb();
    return (db.messages || [])
      .slice()
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .slice(-limit);
  },

  async findByConversation(conversationId) {
    const db = loadDb();
    return (db.messages || [])
      .filter((m) => m.conversationId === conversationId || (!m.conversationId && conversationId === 'default'))
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  },

  async findByUser(userId) {
    const db = loadDb();
    const uid = Number(userId);
    return (db.messages || [])
      .filter((m) => m.senderId === uid || m.recipientId === uid || !m.recipientId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  },
};
