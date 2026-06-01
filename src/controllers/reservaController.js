/**
 * src/controllers/reservaController.js
 * ---------------------------------------------------------------------------
 * Flujo de reserva del usuario:
 *   1. Abre el formulario para un espacio concreto (elige horario y vehiculo).
 *   2. Al enviar, se valida el horario, se comprueba que no choque con otra
 *      reserva, se crea la reserva y el espacio pasa a estado 'Reservado'.
 *   3. El usuario puede ver y cancelar sus reservas.
 * ---------------------------------------------------------------------------
 */

const Reserva = require('../models/Reserva');
const Espacio = require('../models/Espacio');
const Vehiculo = require('../models/Vehiculo');

function popFlash(req) {
  const flash = req.session.flash || {};
  req.session.flash = null;
  return flash;
}

const reservaController = {
  // GET /reservas/nueva?espacio=ID -> formulario de reserva
  async nueva(req, res) {
    try {
      const idEspacio = parseInt(req.query.espacio, 10);
      const espacio = await Espacio.porId(idEspacio);
      if (!espacio) return res.status(404).send('Espacio no encontrado.');

      if (espacio.estado !== 'Disponible') {
        req.session.flash = { error: 'Ese espacio no esta disponible.' };
        return res.redirect('/estacionamientos/' + espacio.id_estacionamiento);
      }

      const vehiculos = await Vehiculo.porUsuario(req.session.user.id_usuario);
      res.render('reservas/nueva', {
        titulo: 'Nueva reserva',
        user: req.session.user,
        espacio,
        vehiculos,
        flash: popFlash(req),
      });
    } catch (e) {
      console.error(e);
      res.status(500).send('Error al abrir el formulario de reserva.');
    }
  },

  // POST /reservas -> crea la reserva
  async crear(req, res) {
    const idEspacio = parseInt(req.body.id_espacio, 10);
    const idVehiculo = parseInt(req.body.id_vehiculo, 10);
    const fecha = (req.body.fecha_reserva || '').trim();
    const horaInicio = (req.body.hora_inicio || '').trim();
    const horaFin = (req.body.hora_fin || '').trim();

    try {
      const espacio = await Espacio.porId(idEspacio);
      if (!espacio) return res.status(404).send('Espacio no encontrado.');

      // ----- Validaciones -----
      const errores = [];
      if (!idVehiculo) errores.push('Debes elegir un vehiculo (registra uno si no tienes).');
      if (!fecha) errores.push('Elige la fecha.');
      if (!horaInicio || !horaFin) errores.push('Elige hora de inicio y fin.');
      if (horaInicio && horaFin && horaFin <= horaInicio) {
        errores.push('La hora de fin debe ser mayor que la de inicio.');
      }

      if (errores.length === 0) {
        const choca = await Reserva.hayConflicto(idEspacio, fecha, horaInicio, horaFin);
        if (choca) errores.push('Ese espacio ya esta reservado en ese horario.');
      }

      if (errores.length > 0) {
        req.session.flash = { error: errores.join(' ') };
        return res.redirect('/reservas/nueva?espacio=' + idEspacio);
      }

      // ----- Crear reserva y marcar el espacio como Reservado -----
      const idReserva = await Reserva.crear({
        fecha_reserva: fecha,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        id_usuario: req.session.user.id_usuario,
        id_vehiculo: idVehiculo,
        id_espacio: idEspacio,
      });
      await Espacio.cambiarEstado(idEspacio, 'Reservado');

      // Tras la reserva, mandamos al usuario a pagar.
      req.session.flash = { success: 'Reserva creada. Procede a pagar.' };
      res.redirect('/pagos/nuevo/' + idReserva);
    } catch (e) {
      console.error(e);
      req.session.flash = { error: 'No se pudo crear la reserva.' };
      res.redirect('/reservas/nueva?espacio=' + idEspacio);
    }
  },

  // GET /reservas -> mis reservas
  async listar(req, res) {
    try {
      const reservas = await Reserva.porUsuario(req.session.user.id_usuario);
      res.render('reservas/index', {
        titulo: 'Mis reservas',
        user: req.session.user,
        reservas,
        flash: popFlash(req),
      });
    } catch (e) {
      console.error(e);
      res.status(500).send('Error al cargar tus reservas.');
    }
  },

  // POST /reservas/:id/cancelar -> cancela y libera el espacio
  async cancelar(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      const reserva = await Reserva.porId(id);

      // Solo el dueno de la reserva puede cancelarla.
      if (!reserva || reserva.id_usuario !== req.session.user.id_usuario) {
        req.session.flash = { error: 'Reserva no valida.' };
        return res.redirect('/reservas');
      }

      await Reserva.cancelar(id);
      await Espacio.cambiarEstado(reserva.id_espacio, 'Disponible');

      req.session.flash = { success: 'Reserva cancelada.' };
      res.redirect('/reservas');
    } catch (e) {
      console.error(e);
      req.session.flash = { error: 'No se pudo cancelar la reserva.' };
      res.redirect('/reservas');
    }
  },
};

module.exports = reservaController;
