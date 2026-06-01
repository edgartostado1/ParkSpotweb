/**
 * src/models/Ticket.js
 * ---------------------------------------------------------------------------
 * Modelo Ticket: consulta los tickets generados (los crea el TRIGGER
 * tr_generar_ticket_reserva al insertar una reserva).
 * ---------------------------------------------------------------------------
 */

const { getPool, sql } = require('../../config/db');

const Ticket = {
  /** Devuelve el ticket de una reserva, con todos sus datos para mostrarlo. */
  async porReserva(idReserva) {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, idReserva)
      .query(`
        SELECT t.id_ticket, t.codigo_ticket, t.fecha_generacion, t.estado_ticket,
               r.id_reserva, r.fecha_reserva, r.hora_inicio, r.hora_fin,
               r.estado_reserva,
               u.id_usuario, u.nombre + ' ' + u.apellido AS usuario, u.correo,
               v.placa,
               s.numero_espacio, te.nombre_tipo AS tipo_espacio,
               e.nombre AS estacionamiento
        FROM Tickets t
        INNER JOIN Reservas r          ON t.id_reserva  = r.id_reserva
        INNER JOIN Usuarios u          ON r.id_usuario  = u.id_usuario
        INNER JOIN Vehiculos v         ON r.id_vehiculo = v.id_vehiculo
        INNER JOIN Espacios s          ON r.id_espacio  = s.id_espacio
        INNER JOIN TiposEspacio te     ON s.id_tipo_espacio = te.id_tipo_espacio
        INNER JOIN Estacionamientos e  ON s.id_estacionamiento = e.id_estacionamiento
        WHERE t.id_reserva = @id
      `);
    return result.recordset[0] || null;
  },

  /**
   * Asegura que exista un ticket para la reserva. Si el trigger
   * tr_generar_ticket_reserva ya lo creo, lo devuelve. Si no, lo crea aqui.
   * Asi el ticket SIEMPRE existe despues del pago.
   */
  async crearSiNoExiste(idReserva) {
    const pool = await getPool();
    // ¿Ya existe?
    const check = await pool.request()
      .input('id', sql.Int, idReserva)
      .query('SELECT id_ticket FROM Tickets WHERE id_reserva = @id');
    if (check.recordset.length > 0) return check.recordset[0].id_ticket;

    // No existe: lo creamos con codigo "TKT-XXXXXXXX" basado en el id de reserva
    const codigo = 'TKT-' + String(idReserva).padStart(8, '0');
    const result = await pool.request()
      .input('codigo', sql.NVarChar(50), codigo)
      .input('id', sql.Int, idReserva)
      .query(`
        INSERT INTO Tickets (codigo_ticket, fecha_generacion, estado_ticket, id_reserva)
        OUTPUT INSERTED.id_ticket
        VALUES (@codigo, GETDATE(), 'Vigente', @id)
      `);
    return result.recordset[0].id_ticket;
  },

  /** Lista los tickets de un usuario, mas recientes primero. */
  async porUsuario(idUsuario) {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, idUsuario)
      .query(`
        SELECT t.id_ticket, t.codigo_ticket, t.fecha_generacion, t.estado_ticket,
               r.id_reserva, r.fecha_reserva, r.hora_inicio, r.hora_fin,
               s.numero_espacio, e.nombre AS estacionamiento
        FROM Tickets t
        INNER JOIN Reservas r         ON t.id_reserva = r.id_reserva
        INNER JOIN Espacios s         ON r.id_espacio = s.id_espacio
        INNER JOIN Estacionamientos e ON s.id_estacionamiento = e.id_estacionamiento
        WHERE r.id_usuario = @id
        ORDER BY t.fecha_generacion DESC
      `);
    return result.recordset;
  },
};

module.exports = Ticket;
