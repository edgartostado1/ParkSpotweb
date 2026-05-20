/**
 * src/controllers/estacionamientoController.js
 * ---------------------------------------------------------------------------
 * Muestra al usuario los estacionamientos disponibles (tarjetas) y, al entrar
 * a uno, el mapa visual de sus espacios con colores segun el estado.
 * ---------------------------------------------------------------------------
 */

const Estacionamiento = require('../models/Estacionamiento');
const Espacio = require('../models/Espacio');

const estacionamientoController = {
  // GET /estacionamientos  -> tarjetas de estacionamientos
  async listar(req, res) {
    try {
      const estacionamientos = await Estacionamiento.todos();
      res.render('estacionamientos/index', {
        titulo: 'Estacionamientos',
        user: req.session.user,
        estacionamientos,
      });
    } catch (e) {
      console.error(e);
      res.status(500).send('Error al cargar estacionamientos.');
    }
  },

  // GET /estacionamientos/:id  -> mapa visual de espacios
  async mapa(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      const estacionamiento = await Estacionamiento.porId(id);
      if (!estacionamiento) return res.status(404).send('Estacionamiento no encontrado.');

      const espacios = await Espacio.porEstacionamiento(id);
      res.render('estacionamientos/mapa', {
        titulo: estacionamiento.nombre,
        user: req.session.user,
        estacionamiento,
        espacios,
      });
    } catch (e) {
      console.error(e);
      res.status(500).send('Error al cargar el mapa de espacios.');
    }
  },
};

module.exports = estacionamientoController;
