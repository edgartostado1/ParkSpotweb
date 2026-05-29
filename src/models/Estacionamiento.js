/**
 * src/models/Estacionamiento.js
 * ---------------------------------------------------------------------------
 * Modelo Estacionamiento. Ahora la direccion vive en su propia tabla
 * (Direcciones) y se obtiene con un JOIN, formateandola como una cadena
 * legible: "calle numero, colonia, ciudad".
 * ---------------------------------------------------------------------------
 */

const { getPool, sql } = require('../../config/db');

const Estacionamiento = {
  /** Lista todos los estacionamientos con direccion y conteo de espacios. */
  async todos() {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT e.id_estacionamiento, e.nombre, e.capacidad_total,
             e.horario_apertura, e.horario_cierre,
             CONCAT(d.calle, ' ', d.numero, ', ', d.colonia, ', ', d.ciudad) AS direccion,
             (SELECT COUNT(*) FROM Espacios s
              WHERE s.id_estacionamiento = e.id_estacionamiento) AS total_espacios,
             (SELECT COUNT(*) FROM Espacios s
              WHERE s.id_estacionamiento = e.id_estacionamiento
              AND s.estado = 'Disponible') AS disponibles
      FROM Estacionamientos e
      INNER JOIN Direcciones d ON e.id_direccion = d.id_direccion
      ORDER BY e.nombre
    `);
    return result.recordset;
  },

  /** Obtiene un estacionamiento por su id, con su direccion formateada. */
  async porId(id) {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT e.id_estacionamiento, e.nombre, e.capacidad_total,
               e.horario_apertura, e.horario_cierre, e.id_direccion,
               CONCAT(d.calle, ' ', d.numero, ', ', d.colonia, ', ', d.ciudad) AS direccion
        FROM Estacionamientos e
        INNER JOIN Direcciones d ON e.id_direccion = d.id_direccion
        WHERE e.id_estacionamiento = @id
      `);
    return result.recordset[0] || null;
  },
};

module.exports = Estacionamiento;
