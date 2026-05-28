/**
 * src/controllers/vehiculoController.js
 * ---------------------------------------------------------------------------
 * El usuario ve sus vehiculos y registra nuevos. Necesarios para crear reservas.
 * ---------------------------------------------------------------------------
 */

const Vehiculo = require('../models/Vehiculo');

function popFlash(req) {
  const flash = req.session.flash || {};
  req.session.flash = null;
  return flash;
}

const vehiculoController = {
  // GET /vehiculos -> lista + formulario de registro
  async listar(req, res) {
    try {
      const vehiculos = await Vehiculo.porUsuario(req.session.user.id_usuario);
      res.render('vehiculos/index', {
        titulo: 'Mis vehiculos',
        user: req.session.user,
        vehiculos,
        flash: popFlash(req),
      });
    } catch (e) {
      console.error(e);
      res.status(500).send('Error al cargar vehiculos.');
    }
  },

  // POST /vehiculos -> registra un vehiculo
  async crear(req, res) {
    const placa = (req.body.placa || '').trim().toUpperCase();
    const { marca, modelo, color, tipo_vehiculo } = req.body;

    if (!placa) {
      req.session.flash = { error: 'La placa es obligatoria.' };
      return res.redirect('/vehiculos');
    }

    try {
      if (await Vehiculo.placaExiste(placa)) {
        req.session.flash = { error: 'Ya existe un vehiculo con esa placa.' };
        return res.redirect('/vehiculos');
      }

      await Vehiculo.crear({
        placa, marca, modelo, color, tipo_vehiculo,
        id_usuario: req.session.user.id_usuario,
      });
      req.session.flash = { success: 'Vehiculo registrado correctamente.' };
      res.redirect('/vehiculos');
    } catch (e) {
      console.error(e);
      req.session.flash = { error: 'No se pudo registrar el vehiculo.' };
      res.redirect('/vehiculos');
    }
  },
};

module.exports = vehiculoController;
