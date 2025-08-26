const db = require('../db/database');

function getAllProjects(callback) {
  db.all('SELECT * FROM projets ORDER BY id DESC', [], callback);
}

function addProject(titre, description, lien, callback) {
  db.run(
    'INSERT INTO projets (titre, description, lien) VALUES (?, ?, ?)',
    [titre, description, lien],
    callback
  );
}

function deleteProject(id, callback) {
  db.run('DELETE FROM projets WHERE id = ?', [id], callback);
}

module.exports = {
  getAllProjects,
  addProject,
  deleteProject
};