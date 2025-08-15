const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 📁 Crée (ou ouvre) le fichier de base
const db = new sqlite3.Database(path.join(__dirname, 'portfolio.db'), (err) => {
  if (err) {
    console.error('Erreur SQLite :', err.message);
  } else {
    console.log('✅ Base de données connectée');
  }
});

// 📦 Créer la table "projets" si elle n'existe pas
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS projets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titre TEXT NOT NULL,
      description TEXT NOT NULL,
      lien TEXT
    )
  `);
});

module.exports = db;