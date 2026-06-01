/**
 * src/controllers/pagoController.js
 * ---------------------------------------------------------------------------
 * Flujo de pago simulado:
 *   GET  /pagos/nuevo/:idReserva  -> formulario con datos de la reserva,
 *                                    el costo total y los campos de tarjeta
 *                                    (Visa o MasterCard). Es simulado, no
 *                                    procesa pagos reales.
 *   POST /pagos                   -> guarda la tarjeta + el pago en BD y
 *                                    redirige al ticket digital.
 * ---------------------------------------------------------------------------
 */

const Reserva = require('../models/Reserva');
const Espacio = require('../models/Espacio');
const Pago = require('../models/Pago');
const Tarjeta = require('../models/Tarjeta');
const Ticket = require('../models/Ticket');
const Catalogos = require('../models/Catalogos');

function popFlash(req) {
  const flash = req.session.flash || {};
  req.session.flash = null;
  return flash;
}

/** Calcula el costo total = horas * precio_hora. */
function calcularCosto(horaInicio, horaFin, precioHora) {
  if (!precioHora) return 0;
  const [hi, mi] = horaInicio.split(':').map(Number);
  const [hf, mf] = horaFin.split(':').map(Number);
  const minutos = (hf * 60 + mf) - (hi * 60 + mi);
  const horas = minutos / 60;
  return Math.round(horas * Number(precioHora) * 100) / 100;
}

/** Convierte un valor de hora (Date o string) a "HH:MM". */
function fmtHora(t) {
  if (!t) return '';
  if (t instanceof Date) {
    return String(t.getUTCHours()).padStart(2, '0') + ':' +
           String(t.getUTCMinutes()).padStart(2, '0');
  }
  return String(t).substring(0, 5);
}

const pagoController = {
  // GET /pagos/nuevo/:idReserva
  async nuevo(req, res) {
    try {
      const idReserva = parseInt(req.params.idReserva, 10);
      const reserva = await Reserva.porId(idReserva);

      if (!reserva || reserva.id_usuario !== req.session.user.id_usuario) {
        req.session.flash = { error: 'Reserva no encontrada.' };
        return res.redirect('/reservas');
      }

      const espacio = await Espacio.porId(reserva.id_espacio);
      const metodos = await Catalogos.metodosTarjeta();

      const horaInicioStr = fmtHora(reserva.hora_inicio);
      const horaFinStr    = fmtHora(reserva.hora_fin);
      const costo = calcularCosto(horaInicioStr, horaFinStr, espacio.precio_hora);

      res.render('pagos/nuevo', {
        titulo: 'Pago',
        user: req.session.user,
        reserva,
        espacio,
        metodos,
        costo,
        horaInicioStr,
        horaFinStr,
        flash: popFlash(req),
      });
    } catch (e) {
      console.error(e);
      res.status(500).send('Error al abrir el pago.');
    }
  },

  // POST /pagos
  async procesar(req, res) {
    const idReserva = parseInt(req.body.id_reserva, 10);
    const idMetodo  = parseInt(req.body.id_metodo_pago, 10);
    const monto     = parseFloat(req.body.monto);

    const numero        = (req.body.numero_tarjeta || '').replace(/\s/g, '');
    const titular       = (req.body.titular || '').trim();
    const expiracion    = req.body.fecha_expiracion;       // YYYY-MM-DD
    const tipoTarjeta   = req.body.tipo_tarjeta;            // 'Visa' o 'MasterCard'

    // ----- Validaciones basicas (simulado) -----
    const errores = [];
    if (!idReserva || !idMetodo || !monto) errores.push('Faltan datos del pago.');
    if (numero.length < 13) errores.push('Numero de tarjeta invalido.');
    if (!titular) errores.push('Ingresa el nombre del titular.');
    if (!expiracion) errores.push('Ingresa la fecha de expiracion.');
    if (errores.length) {
      req.session.flash = { error: errores.join(' ') };
      return res.redirect('/pagos/nuevo/' + idReserva);
    }

    try {
      const reserva = await Reserva.porId(idReserva);
      if (!reserva || reserva.id_usuario !== req.session.user.id_usuario) {
        req.session.flash = { error: 'Reserva no valida.' };
        return res.redirect('/reservas');
      }

      // 1) Guardar la tarjeta (solo los ultimos 4 digitos)
      const idTarjeta = await Tarjeta.crear({
        ultimos_4: numero.slice(-4),
        titular,
        tipo_tarjeta: tipoTarjeta,
        fecha_expiracion: expiracion,
        id_usuario: req.session.user.id_usuario,
      });

      // 2) Guardar el pago
      await Pago.crear({
        monto,
        id_reserva: idReserva,
        id_metodo_pago: idMetodo,
        id_tarjeta: idTarjeta,
      });

      // 3) Asegurar que el ticket exista (por si el trigger no esta instalado)
      await Ticket.crearSiNoExiste(idReserva);

      // 4) Ir a la pagina de "Pago exitoso"
      res.redirect('/pagos/exitoso/' + idReserva);
    } catch (e) {
      console.error(e);
      req.session.flash = { error: 'No se pudo procesar el pago.' };
      res.redirect('/pagos/nuevo/' + idReserva);
    }
  },

  // GET /pagos/exitoso/:idReserva  -> Pagina de confirmacion
  async exitoso(req, res) {
    try {
      const idReserva = parseInt(req.params.idReserva, 10);
      const reserva = await Reserva.porId(idReserva);
      if (!reserva || reserva.id_usuario !== req.session.user.id_usuario) {
        return res.redirect('/reservas');
      }

      const pago = await Pago.porReserva(idReserva);
      const ticket = await Ticket.porReserva(idReserva);

      res.render('pagos/exitoso', {
        titulo: 'Pago exitoso',
        user: req.session.user,
        pago,
        ticket,
      });
    } catch (e) {
      console.error(e);
      res.redirect('/reservas');
    }
  },
};

module.exports = pagoController;
