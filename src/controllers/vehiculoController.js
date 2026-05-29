/**
 * src/controllers/vehiculoController.js
 * ---------------------------------------------------------------------------
 * El usuario ve sus vehiculos y registra nuevos. Ahora el formulario usa
 * <select> con los catalogos normalizados (Modelos+Marca, Colores, TiposVehiculo).
 * ---------------------------------------------------------------------------
 */

const Vehiculo = require('../models/Vehiculo');
const Catalogos = require('../models/Catalogos');

function popFlash(req) {
  const flash = req.session.flash || {};
  req.session.flash = null;
  return flash;
}

const vehiculoController = {
  // GET /vehiculos -> lista + formulario de registro
  async listar(req, res) {
    try {
      const [vehiculos, modelos, colores, tipos] = await Promise.all([
        Vehiculo.porUsuario(req.session.user.id_usuario),
        Catalogos.modelos(),
        Catalogos.colores(),
        Catalogos.tiposVehiculo(),
      ]);

      res.render('vehiculos/index', {
        titulo: 'Mis vehiculos',
        user: req.session.user,
        vehiculos,
        modelos,
        colores,
        tipos,
        flash: popFlash(req),
      });
    } catch (e) {
      console.error(e);
      res.status(500).send('Error al cargar vehiculos.');
    }
  },

  // POST /vehiculos -> registra un vehiculo (ahora con IDs de catalogos)
  async crear(req, res) {
    const placa = (req.body.placa || '').trim().toUpperCase();
    const id_modelo = parseInt(req.body.id_modelo, 10);
    const id_color  = parseInt(req.body.id_color, 10);
    const id_tipo   = parseInt(req.body.id_tipo, 10);

    if (!placa || !id_modelo || !id_color || !id_tipo) {
      req.session.flash = { error: 'Completa todos los campos del vehiculo.' };
      return res.redirect('/vehiculos');
    }

    try {
      if (await Vehiculo.placaExiste(placa)) {
        req.session.flash = { error: 'Ya existe un vehiculo con esa placa.' };
        return res.redirect('/vehiculos');
      }

      await Vehiculo.crear({
        placa, id_modelo, id_color, id_tipo,
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
