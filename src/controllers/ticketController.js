/**
 * src/controllers/ticketController.js
 * ---------------------------------------------------------------------------
 * Tickets digitales:
 *   GET /tickets             -> mis tickets (lista)
 *   GET /tickets/:idReserva  -> mostrar el ticket de una reserva
 * ---------------------------------------------------------------------------
 */

const Ticket = require('../models/Ticket');
const Pago = require('../models/Pago');

function popFlash(req) {
  const flash = req.session.flash || {};
  req.session.flash = null;
  return flash;
}

const ticketController = {
  // GET /tickets -> lista de mis tickets
  async listar(req, res) {
    try {
      const tickets = await Ticket.porUsuario(req.session.user.id_usuario);
      res.render('tickets/index', {
        titulo: 'Mis tickets',
        user: req.session.user,
        tickets,
        flash: popFlash(req),
      });
    } catch (e) {
      console.error(e);
      res.status(500).send('Error al cargar tickets.');
    }
  },

  // GET /tickets/:idReserva -> ticket detallado de la reserva
  async mostrar(req, res) {
    try {
      const idReserva = parseInt(req.params.idReserva, 10);
      const ticket = await Ticket.porReserva(idReserva);

      if (!ticket || ticket.id_usuario !== req.session.user.id_usuario) {
        req.session.flash = { error: 'Ticket no encontrado.' };
        return res.redirect('/tickets');
      }

      const pago = await Pago.porReserva(idReserva);

      res.render('tickets/mostrar', {
        titulo: 'Ticket ' + ticket.codigo_ticket,
        user: req.session.user,
        ticket,
        pago,
        flash: popFlash(req),
      });
    } catch (e) {
      console.error(e);
      res.status(500).send('Error al cargar el ticket.');
    }
  },
};

module.exports = ticketController;
