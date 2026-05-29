/**
 * src/models/Vehiculo.js
 * ---------------------------------------------------------------------------
 * Modelo Vehiculo NORMALIZADO. Ya no guardamos marca/modelo/color/tipo como
 * texto libre, sino como llaves a sus respectivas tablas (Modelos -> Marcas,
 * Colores, TiposVehiculo). Los JOIN reconstruyen los nombres para mostrarlos.
 * ---------------------------------------------------------------------------
 */

const { getPool, sql } = require('../../config/db');

const Vehiculo = {
  /** Vehiculos de un usuario, ya con marca/modelo/color/tipo como texto. */
  async porUsuario(idUsuario) {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, idUsuario)
      .query(`
        SELECT v.id_vehiculo, v.placa,
               m.nombre  AS marca,
               mo.nombre AS modelo,
               c.nombre  AS color,
               tv.nombre AS tipo_vehiculo,
               v.id_modelo, v.id_color, v.id_tipo
        FROM Vehiculos v
        INNER JOIN Modelos mo      ON v.id_modelo = mo.id_modelo
        INNER JOIN Marcas m        ON mo.id_marca = m.id_marca
        INNER JOIN Colores c       ON v.id_color = c.id_color
        INNER JOIN TiposVehiculo tv ON v.id_tipo = tv.id_tipo
        WHERE v.id_usuario = @id
        ORDER BY v.placa
      `);
    return result.recordset;
  },

  /** ¿Ya existe esa placa? (es UNIQUE en la tabla). */
  async placaExiste(placa) {
    const pool = await getPool();
    const result = await pool.request()
      .input('placa', sql.NVarChar(20), placa)
      .query('SELECT COUNT(*) AS total FROM Vehiculos WHERE placa = @placa');
    return result.recordset[0].total > 0;
  },

  /** Registra un vehiculo. Recibe los IDs de los catalogos. */
  async crear(datos) {
    const pool = await getPool();
    await pool.request()
      .input('placa',     sql.NVarChar(20), datos.placa)
      .input('id_modelo', sql.Int, datos.id_modelo)
      .input('id_color',  sql.Int, datos.id_color)
      .input('id_tipo',   sql.Int, datos.id_tipo)
      .input('id_usuario', sql.Int, datos.id_usuario)
      .query(`
        INSERT INTO Vehiculos (placa, id_modelo, id_color, id_tipo, id_usuario)
        VALUES (@placa, @id_modelo, @id_color, @id_tipo, @id_usuario)
      `);
    return true;
  },
};

module.exports = Vehiculo;
