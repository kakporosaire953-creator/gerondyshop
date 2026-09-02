const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.DATA_PATH || path.join(__dirname, '..', 'data', 'gerondyshop.json');
const dbDir = path.dirname(DB_PATH);
const initialState = {
  users: [],
  messages: [],
  concierge_requests: [],
  products: [],
};

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

function loadDb() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(initialState, null, 2), 'utf8');
    return JSON.parse(JSON.stringify(initialState));
  }
  const data = fs.readFileSync(DB_PATH, 'utf8');
  try {
    return JSON.parse(data || JSON.stringify(initialState));
  } catch (err) {
    console.error('Erreur de lecture du fichier de base de données:', err);
    return JSON.parse(JSON.stringify(initialState));
  }
}

function saveDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = { loadDb, saveDb };
