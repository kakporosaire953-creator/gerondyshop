const { loadDb, saveDb, getNextId } = require('./dbHelpers');

module.exports = {
  async create(data) {
    const db = loadDb();
    if (!db.concierge_requests) db.concierge_requests = [];
    const id = getNextId(db.concierge_requests);
    const createdAt = new Date().toISOString();
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const referenceCode = data.referenceCode || `CC-${randomCode}`;

    const request = {
      id,
      referenceCode,
      user: Number(data.user || data.userId),
      userName: data.userName || 'Client Gérondy',
      userEmail: data.userEmail || '',
      userPhone: data.userPhone || '',
      productName: data.productName || data.subject,
      category: data.category || 'High-Tech & Gadgets',
      budgetMin: data.budgetMin ? Number(data.budgetMin) : null,
      budgetMax: data.budgetMax ? Number(data.budgetMax) : null,
      quantity: data.quantity ? Number(data.quantity) : 1,
      description: data.description || data.details || '',
      referenceLink: data.referenceLink || '',
      referenceImage: data.referenceImage || '',
      status: data.status || 'pending', // 'pending' (En attente), 'searching' (Recherche en cours), 'found' (Produit trouvé), 'completed' (Demande terminée)
      statusLabel: data.statusLabel || 'En attente',
      adminNotes: data.adminNotes || 'Votre demande a été prise en compte par nos équipes.',
      offer: data.offer || null,
      createdAt,
    };
    db.concierge_requests.push(request);
    saveDb(db);
    return request;
  },

  async findAll() {
    const db = loadDb();
    return (db.concierge_requests || []).slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async findByUser(userId) {
    const db = loadDb();
    return (db.concierge_requests || [])
      .filter((request) => request.user === Number(userId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async findById(id) {
    const db = loadDb();
    return (db.concierge_requests || []).find((r) => r.id === Number(id)) || null;
  },

  async updateStatus(id, updateData) {
    const db = loadDb();
    const index = (db.concierge_requests || []).findIndex((r) => r.id === Number(id));
    if (index === -1) return null;

    const current = db.concierge_requests[index];
    const statusLabels = {
      pending: 'En attente',
      searching: 'Recherche en cours',
      found: 'Produit trouvé',
      completed: 'Demande terminée',
      cancelled: 'Annulée'
    };

    const status = updateData.status || current.status;
    const updated = {
      ...current,
      ...updateData,
      status,
      statusLabel: statusLabels[status] || current.statusLabel,
      updatedAt: new Date().toISOString()
    };

    db.concierge_requests[index] = updated;
    saveDb(db);
    return updated;
  }
};
