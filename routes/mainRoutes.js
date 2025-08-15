const express = require('express');
const router = express.Router();
const projectModel = require('../models/projectModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const verifyAdminToken = require('../middlewares/auth');


router.get('/', (req, res) => {
  res.render('index', { title: 'Accueil' });
});

router.get('/projets', (req, res) => {
  projectModel.getAllProjects((err, projets) => {
    if (err) return res.status(500).send('Erreur de base de données');
    res.render('projets', { title: 'Mes projets', projets });
  });
});

// Colle ici le hash généré (étape 3)
const ADMIN_PASSWORD_HASH = '$2b$10$z0R9wECgY4YCHISEQQU0s.aUFYwFE3CwnCaTQ2c69BoOKxV5kvUmC';

// GET page login
router.get('/admin/login', (req, res) => {
  res.render('login', { error: null });
});

// POST traitement login
router.post('/admin/login', async (req, res) => {
  const { password } = req.body;

  const isMatch = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);

  if (!isMatch) {
    return res.status(401).render('login', { error: 'Mot de passe incorrect' });
  }

  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.cookie('token', token, { httpOnly: true });
  res.redirect('/admin/ajout-projet');
});

// GET page ajoutProjet protégée
router.get('/admin/ajout-projet', verifyAdminToken, (req, res) => {
  res.render('ajoutProjet', { title: 'Ajouter un projet' });
});

// POST ajout projet (protégé aussi)
router.post('/admin/ajout-projet', verifyAdminToken, (req, res) => {
  // ici, tu récupères les données du formulaire et tu les ajoutes dans ta DB
  const { titre, description, lien } = req.body;

  if (!titre || !description) {
    return res.status(400).send('Titre et description obligatoires');
  }

  projectModel.addProject(titre, description, lien || null, (err) => {
    if (err) {
      console.error('Erreur insertion :', err.message);
      return res.status(500).send('Erreur lors de l’ajout du projet');
    }
    res.redirect('/projets');
  });
});



// Affiche le formulaire contact
router.get('/contact', (req, res) => {
  res.render('contact', { title: 'Contact', message: null });
});

// Reçoit les données du formulaire
router.post('/contact', (req, res) => {
  const { nom, email, message } = req.body;

  if (!nom || !email || !message) {
    return res.render('contact', { title: 'Contact', message: 'Tous les champs sont obligatoires.' });
  }

  // Ici tu pourrais ajouter un envoi d'email ou sauvegarde
  // Pour l’instant on simule un succès
  res.render('contact', { title: 'Contact', message: 'Merci pour votre message, je vous répondrai bientôt !' });
});


module.exports = router;



// ⚠️ À utiliser une seule fois pour ajouter un exemple
// Décommente temporairement
/*
projectModel.addProject(
  'Portfolio Web',
  'Mon site personnel avec Express, EJS et SQLite',
  'https://github.com/ton-profil/portfolio',
  (err) => {
    if (err) console.error('Erreur insertion :', err.message);
    else console.log('✔ Projet ajouté');
  }
);
*/
