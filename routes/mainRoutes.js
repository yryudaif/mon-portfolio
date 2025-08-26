const express = require('express');
const router = express.Router();
const projectModel = require('../models/projectModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const verifyAdminToken = require('../middlewares/auth');
const { Resend } = require('resend');



router.get('/', (req, res) => {
  res.render('index', { title: 'Accueil' });
});

router.get('/projets', (req, res) => {
  projectModel.getAllProjects((err, projets) => {
    if (err) return res.status(500).send('Erreur de base de données');
    res.render('projets', { title: 'Mes projets', projets });
  });
});

// Hash généré
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

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

// POST ajout projet (protégé)
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

//POST supprimer projet (protégé)
router.post('/projets/:id/supprimer', verifyAdminToken, (req,res) => {
  projectModel.deleteProject(req.params.id, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Erreur lors de la suppression.');
    }
    res.redirect('/projets'); // redirige vers la liste des projets
  });
});


// Affiche le formulaire contact
router.get('/contact', (req, res) => {
  res.render('contact', { title: 'Contact', message: null });
});

// Clé API Resend
const resend = new Resend(process.env.RESEND_API_KEY);
// Reçoit les données du formulaire
router.post('/contact', async (req, res) => {
  const { nom, email, message } = req.body;

  if (!nom || !email || !message) {
    return res.render('contact', { title: 'Contact', message: 'Tous les champs sont obligatoires.' });
  }
  const subject = "subject"
  try {
      await resend.emails.send({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: `Nouveau message: ${subject}`,
        html: `
          <p><strong>De :</strong> ${email}</p>
          <p><strong>Message :</strong></p>
          <p>${message}</p>
        `
      });

      res.render('contact', { title: 'Contact', message: 'Merci pour votre message, je vous répondrai bientôt !' });
    } catch (error) {
      console.error('Erreur envoi email:', error);
      res.status(500).json({ error: 'Erreur lors de l’envoi de l’email' });
    }
});

module.exports = router;
