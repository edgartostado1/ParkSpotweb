/**
 * src/controllers/espacioController.js
 * ---------------------------------------------------------------------------
 * CRUD de espacios para el ADMIN: listar, crear, editar, eliminar y cambiar estado.
 * Protegido con requireRole('Administrador') en las rutas.
 * ---------------------------------------------------------------------------
 */

const Espacio = require('../models/Espacio');
const TipoEspacio = require('../models/TipoEspacio');
const Estacionamiento = require('../models/Estacionamiento');

function popFlash(req) {
  const flash = req.session.flash || {};
  req.session.flash = null;
  return flash;
}

const espacioController = {
  // GET /admin/espacios -> tabla con todos los espacios
  async listar(req, res) {
    try {
      const espacios = await Espacio.todos();
      res.render('espacios/index', {
        titulo: 'Gestion de espacios',
        user: req.session.user,
        espacios,
        flash: popFlash(req),
      });
    } catch (e) {
      console.error(e);
      res.status(500).send('Error al cargar espacios.');
    }
  },

  // GET /admin/espacios/nuevo -> formulario vacio
  async formNuevo(req, res) {
    const [tipos, estacionamientos] = await Promise.all([
      TipoEspacio.todos(),
      Estacionamiento.todos(),
    ]);
    res.render('espacios/form', {
      titulo: 'Nuevo espacio',
      user: req.session.user,
      espacio: null,
      tipos,
      estacionamientos,
      flash: popFlash(req),
    });
  },

  // POST /admin/espacios -> crear
  async crear(req, res) {
    try {
      await Espacio.crear({
        numero_espacio: (req.body.numero_espacio || '').trim(),
        estado: req.body.estado,
        id_tipo_espacio: parseInt(req.body.id_tipo_espacio, 10),
        id_estacionamiento: parseInt(req.body.id_estacionamiento, 10),
      });
      req.session.flash = { success: 'Espacio creado.' };
      res.redirect('/admin/espacios');
    } catch (e) {
      console.error(e);
      req.session.flash = { error: 'No se pudo crear el espacio.' };
      res.redirect('/admin/espacios/nuevo');
    }
  },

  // GET /admin/espacios/:id/editar -> formulario con datos
  async formEditar(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      const [espacio, tipos, estacionamientos] = await Promise.all([
        Espacio.porId(id),
        TipoEspacio.todos(),
        Estacionamiento.todos(),
      ]);
      if (!espacio) return res.status(404).send('Espacio no encontrado.');

      res.render('espacios/form', {
        titulo: 'Editar espacio',
        user: req.session.user,
        espacio,
        tipos,
        estacionamientos,
        flash: popFlash(req),
      });
    } catch (e) {
      console.error(e);
      res.status(500).send('Error al abrir el espacio.');
    }
  },

  // POST /admin/espacios/:id -> actualizar
  async actualizar(req, res) {
    const id = parseInt(req.params.id, 10);
    try {
      await Espacio.actualizar(id, {
        numero_espacio: (req.body.numero_espacio || '').trim(),
        estado: req.body.estado,
        id_tipo_espacio: parseInt(req.body.id_tipo_espacio, 10),
        id_estacionamiento: parseInt(req.body.id_estacionamiento, 10),
      });
      req.session.flash = { success: 'Espacio actualizado.' };
      res.redirect('/admin/espacios');
    } catch (e) {
      console.error(e);
      req.session.flash = { error: 'No se pudo actualizar el espacio.' };
      res.redirect('/admin/espacios/' + id + '/editar');
    }
  },

  // POST /admin/espacios/:id/eliminar -> eliminar
  async eliminar(req, res) {
    try {
      await Espacio.eliminar(parseInt(req.params.id, 10));
      req.session.flash = { success: 'Espacio eliminado.' };
    } catch (e) {
      console.error(e);
      req.session.flash = { error: 'No se pudo eliminar (puede tener reservas asociadas).' };
    }
    res.redirect('/admin/espacios');
  },
};

module.exports = espacioController;
