const express = require('express');
const path = require('path')
const app = express();
const mainRoutes = require('./routes/mainRoutes');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Middleware
app.use("/public",express.static('public')); // Pour le CSS, images, etc.
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



// Définir EJS comme moteur de template
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Utiliser les routes
app.use('/', mainRoutes);

// Lancer le serveur
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`🌐 Serveur lancé sur http://localhost:${PORT}`);
});
