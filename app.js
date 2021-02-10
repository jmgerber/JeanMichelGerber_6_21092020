require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoSanitize = require('express-mongo-sanitize');
const mongoose = require('mongoose');
const helmet = require('helmet');
const sauceRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user');
const path = require('path');

const app = express();
app.disable("x-powered-by");
app.use(helmet());

// Connexion à la base de données
mongoose.connect('mongodb+srv://'+ process.env.DB_USER +':'+ process.env.DB_PASS +'@cluster1.zaqnf.mongodb.net/Cluster1?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Pour empêcher les injections avec des opérateurs MongoDB
app.use(mongoSanitize({
  replaceWith: '_'
}))

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;