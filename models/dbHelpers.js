const { loadDb, saveDb } = require('./db');

function getNextId(collection) {
  if (!collection.length) return 1;
  return Math.max(...collection.map((item) => item.id || item._id || 0)) + 1;
}

module.exports = {
  loadDb,
  saveDb,
  getNextId,
};
