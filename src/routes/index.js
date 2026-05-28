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
const estacionamientoController = require('../controllers/estacionamientoController');
const espacioController = require('../controllers/espacioController');
const vehiculoController = require('../controllers/vehiculoController');
const reservaController = require('../controllers/reservaController');
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

// ===========================================================================
//  USUARIO: estacionamientos, mapa de espacios, vehiculos y reservas
// ===========================================================================
router.get('/estacionamientos', requireLogin, estacionamientoController.listar);
router.get('/estacionamientos/:id', requireLogin, estacionamientoController.mapa);

router.get('/vehiculos', requireLogin, vehiculoController.listar);
router.post('/vehiculos', requireLogin, vehiculoController.crear);

router.get('/reservas', requireLogin, reservaController.listar);
router.get('/reservas/nueva', requireLogin, reservaController.nueva);
router.post('/reservas', requireLogin, reservaController.crear);
router.post('/reservas/:id/cancelar', requireLogin, reservaController.cancelar);

// ===========================================================================
//  ADMIN: CRUD de espacios
// ===========================================================================
router.get('/admin/espacios', requireRole('Administrador'), espacioController.listar);
router.get('/admin/espacios/nuevo', requireRole('Administrador'), espacioController.formNuevo);
router.post('/admin/espacios', requireRole('Administrador'), espacioController.crear);
router.get('/admin/espacios/:id/editar', requireRole('Administrador'), espacioController.formEditar);
router.post('/admin/espacios/:id', requireRole('Administrador'), espacioController.actualizar);
router.post('/admin/espacios/:id/eliminar', requireRole('Administrador'), espacioController.eliminar);

module.exports = router;
