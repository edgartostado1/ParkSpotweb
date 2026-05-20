/**
 * app.js
 * ---------------------------------------------------------------------------
 * Punto de entrada de ParkSpot (Node.js + Express).
 * Configura el servidor, el motor de vistas (EJS), los archivos estaticos,
 * las sesiones y monta las rutas. Equivale al "front controller" del MVC.
 * ---------------------------------------------------------------------------
 */

require('dotenv').config();

const path = require('path');
const express = require('express');
const session = require('express-session');

const routes = require('./src/routes');

const app = express();

// ---- Motor de vistas EJS (la carpeta de "vistas" del MVC) ----
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

// ---- Middlewares base ----
app.use(express.urlencoded({ extended: true })); // leer datos de formularios (POST)
app.use(express.static(path.join(__dirname, 'public'))); // css, js, imagenes

// ---- Sesiones ----
app.use(session({
  secret: process.env.SESSION_SECRET || 'parkspot-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 2, // 2 horas
  },
}));

// Hacemos disponible el usuario actual en TODAS las vistas como "currentUser".
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

// ---- Rutas ----
app.use('/', routes);

// ---- 404 ----
app.use((req, res) => {
  res.status(404).send('<h1>404 - Pagina no encontrada</h1>');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`ParkSpot corriendo en http://localhost:${PORT}`);
});
