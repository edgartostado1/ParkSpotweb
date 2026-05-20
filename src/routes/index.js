/**
 * src/routes/index.js
 * ---------------------------------------------------------------------------
 * Definicion de rutas de la aplicacion (equivale al Router del MVC).
 * Asocia cada URL + metodo HTTP con la funcion del controlador correspondiente.
 * ---------------------------------------------------------------------------
 */

const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const userController = require('../controllers/userController');
const { requireLogin, requireRole } = require('../middleware/auth');

// ----- Autenticacion -----
router.get('/', authController.loginForm);            // raiz -> login
router.get('/login', authController.loginForm);
router.post('/login', authController.procesarLogin);
router.get('/register', authController.registerForm);
router.post('/register', authController.procesarRegister);
router.get('/logout', authController.logout);

// ----- Paneles (protegidos) -----
router.get('/admin', requireRole('Administrador'), adminController.dashboard);
router.get('/usuario', requireLogin, userController.dashboard);

module.exports = router;
