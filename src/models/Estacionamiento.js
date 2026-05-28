/**
 * src/models/Estacionamiento.js
 * ---------------------------------------------------------------------------
 * Modelo Estacionamiento: acceso a la tabla "Estacionamientos".
 * Incluye, por cada estacionamiento, cuantos espacios tiene en total y
 * cuantos estan "Disponible" (con subconsultas), para mostrarlo en las tarjetas.
 * ---------------------------------------------------------------------------
 */

const { getPool, sql } = require('../../config/db');

const Estacionamiento = {
  /** Lista todos los estacionamientos con su conteo de espacios disponibles. */
  async todos() {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT e.id_estacionamiento, e.nombre, e.direccion, e.capacidad_total,
             e.horario_apertura, e.horario_cierre,
             (SELECT COUNT(*) FROM Espacios s
              WHERE s.id_estacionamiento = e.id_estacionamiento) AS total_espacios,
             (SELECT COUNT(*) FROM Espacios s
              WHERE s.id_estacionamiento = e.id_estacionamiento
              AND s.estado = 'Disponible') AS disponibles
      FROM Estacionamientos e
      ORDER BY e.nombre
    `);
    return result.recordset;
  },

  /** Obtiene un estacionamiento por su id. */
  async porId(id) {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Estacionamientos WHERE id_estacionamiento = @id');
    return result.recordset[0] || null;
  },
};

module.exports = Estacionamiento;
