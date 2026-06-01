/**
 * src/models/Reserva.js
 * ---------------------------------------------------------------------------
 * Modelo Reserva: acceso a la tabla "Reservas".
 * - Verifica que no exista una reserva que se solape en el mismo espacio.
 * - Crea la reserva.
 * - Lista las reservas de un usuario (con datos del espacio, estacionamiento y vehiculo).
 * - Permite cancelar.
 *
 * Las fechas/horas se envian como texto ('YYYY-MM-DD' y 'HH:MM') y SQL Server
 * las convierte a DATE / TIME automaticamente.
 * ---------------------------------------------------------------------------
 */

const { getPool, sql } = require('../../config/db');

const Reserva = {
  /**
   * ¿Hay una reserva que choque con este espacio/fecha/horario?
   * Dos rangos se solapan si: inicioA < finB  AND  finA > inicioB.
   * Ignora las reservas canceladas.
   */
  async hayConflicto(idEspacio, fecha, horaInicio, horaFin) {
    const pool = await getPool();
    const result = await pool.request()
      .input('espacio', sql.Int, idEspacio)
      .input('fecha', sql.VarChar(10), fecha)
      .input('hi', sql.VarChar(8), horaInicio)
      .input('hf', sql.VarChar(8), horaFin)
      .query(`
        SELECT COUNT(*) AS total
        FROM Reservas
        WHERE id_espacio = @espacio
          AND fecha_reserva = @fecha
          AND estado_reserva <> 'Cancelada'
          AND hora_inicio < @hf
          AND hora_fin > @hi
      `);
    return result.recordset[0].total > 0;
  },

  /** Crea una reserva y devuelve su id.
   *  Usamos OUTPUT INTO @tabla porque Reservas tiene trigger
   *  (SQL Server exige esta forma cuando hay triggers).
   */
  async crear(datos) {
    const pool = await getPool();
    const result = await pool.request()
      .input('fecha', sql.VarChar(10), datos.fecha_reserva)
      .input('hi', sql.VarChar(8), datos.hora_inicio)
      .input('hf', sql.VarChar(8), datos.hora_fin)
      .input('usuario', sql.Int, datos.id_usuario)
      .input('vehiculo', sql.Int, datos.id_vehiculo)
      .input('espacio', sql.Int, datos.id_espacio)
      .query(`
        DECLARE @t TABLE (id INT);
        INSERT INTO Reservas
          (fecha_reserva, hora_inicio, hora_fin, estado_reserva,
           id_usuario, id_vehiculo, id_espacio)
        OUTPUT INSERTED.id_reserva INTO @t
        VALUES (@fecha, @hi, @hf, 'Activa', @usuario, @vehiculo, @espacio);
        SELECT id AS id_reserva FROM @t;
      `);
    return result.recordset[0].id_reserva;
  },

  /** Reservas de un usuario, con info del espacio, estacionamiento y vehiculo. */
  async porUsuario(idUsuario) {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, idUsuario)
      .query(`
        SELECT r.id_reserva, r.fecha_reserva, r.hora_inicio, r.hora_fin,
               r.estado_reserva,
               s.numero_espacio, e.nombre AS nombre_estacionamiento,
               v.placa
        FROM Reservas r
        INNER JOIN Espacios s ON r.id_espacio = s.id_espacio
        INNER JOIN Estacionamientos e ON s.id_estacionamiento = e.id_estacionamiento
        INNER JOIN Vehiculos v ON r.id_vehiculo = v.id_vehiculo
        WHERE r.id_usuario = @id
        ORDER BY r.fecha_reserva DESC, r.hora_inicio DESC
      `);
    return result.recordset;
  },

  /** Devuelve una reserva por id (para validar al cancelar). */
  async porId(id) {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Reservas WHERE id_reserva = @id');
    return result.recordset[0] || null;
  },

  /** Marca una reserva como cancelada. */
  async cancelar(id) {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, id)
      .query(`UPDATE Reservas SET estado_reserva = 'Cancelada' WHERE id_reserva = @id`);
    return true;
  },
};

module.exports = Reserva;
