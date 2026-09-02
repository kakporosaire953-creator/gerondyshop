const { loadDb, saveDb, getNextId } = require('./dbHelpers');

module.exports = {
  async create(data) {
    const db = loadDb();
    const id = getNextId(db.orders || []);
    const createdAt = new Date().toISOString();
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const trackingNumber = data.trackingNumber || `GER-${new Date().getFullYear()}-${randomCode}`;

    const order = {
      id,
      trackingNumber,
      userId: Number(data.userId),
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      shippingAddress: data.shippingAddress || {},
      items: data.items || [],
      subtotal: Number(data.subtotal || 0),
      shippingCost: Number(data.shippingCost || 0),
      totalAmount: Number(data.totalAmount || 0),
      paymentMethod: data.paymentMethod || 'wallet', // 'wallet', 'cash_on_delivery', 'mobile_money'
      paymentStatus: data.paymentStatus || (data.paymentMethod === 'wallet' ? 'paid' : 'pending_cash'),
      status: data.status || 'processing', // 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
      sellerEmail: data.sellerEmail || 'seller@gerondyshop.com',
      notes: data.notes || '',
      createdAt,
    };

    if (!db.orders) db.orders = [];
    db.orders.push(order);
    saveDb(db);
    return order;
  },

  async findByUser(userId) {
    const db = loadDb();
    return (db.orders || [])
      .filter((order) => order.userId === Number(userId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async findBySeller(sellerEmail) {
    const db = loadDb();
    return (db.orders || [])
      .filter((order) => order.sellerEmail === sellerEmail || (order.items && order.items.some(i => i.sellerEmail === sellerEmail)))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async findById(id) {
    const db = loadDb();
    return (db.orders || []).find((o) => o.id === Number(id)) || null;
  },

  async findByTracking(trackingNumber) {
    const db = loadDb();
    return (db.orders || []).find((o) => o.trackingNumber.toLowerCase() === trackingNumber.toLowerCase()) || null;
  },

  async findAll() {
    const db = loadDb();
    return (db.orders || []).slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async updateStatus(id, status, paymentStatus) {
    const db = loadDb();
    const index = (db.orders || []).findIndex((o) => o.id === Number(id));
    if (index === -1) return null;

    db.orders[index].status = status || db.orders[index].status;
    if (paymentStatus) {
      db.orders[index].paymentStatus = paymentStatus;
    }
    db.orders[index].updatedAt = new Date().toISOString();
    saveDb(db);
    return db.orders[index];
  },
};
