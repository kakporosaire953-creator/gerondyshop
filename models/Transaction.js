const { loadDb, saveDb, getNextId } = require('./dbHelpers');

module.exports = {
  async create(data) {
    const db = loadDb();
    if (!db.transactions) db.transactions = [];
    const id = getNextId(db.transactions);
    const createdAt = new Date().toISOString();
    const transaction = {
      id,
      userId: Number(data.userId),
      type: data.type || 'deposit', // 'deposit', 'payment', 'refund', 'credit', 'payout'
      amount: Number(data.amount),
      description: data.description || 'Transaction Gérondy Wallet',
      reference: data.reference || `TX-${Date.now().toString(36).toUpperCase()}`,
      status: data.status || 'completed',
      createdAt,
    };
    db.transactions.push(transaction);
    saveDb(db);
    return transaction;
  },

  async findByUser(userId) {
    const db = loadDb();
    return (db.transactions || [])
      .filter((tx) => tx.userId === Number(userId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async findAll() {
    const db = loadDb();
    return (db.transactions || []).slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
};
