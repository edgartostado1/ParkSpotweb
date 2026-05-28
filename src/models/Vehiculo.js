/**
 * src/models/Vehiculo.js
 * ---------------------------------------------------------------------------
 * Modelo Vehiculo: acceso a la tabla "Vehiculos".
 * Cada vehiculo pertenece a un usuario (id_usuario).
 * ---------------------------------------------------------------------------
 */

const { getPool, sql } = require('../../config/db');

const Vehiculo = {
  /** Vehiculos de un usuario. */
  async porUsuario(idUsuario) {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, idUsuario)
      .query(`
        SELECT id_vehiculo, placa, marca, modelo, color, tipo_vehiculo
        FROM Vehiculos
        WHERE id_usuario = @id
        ORDER BY placa
      `);
    return result.recordset;
  },

  /** ¿Existe ya esa placa? (la placa es UNIQUE en la tabla). */
  async placaExiste(placa) {
    const pool = await getPool();
    const result = await pool.request()
      .input('placa', sql.NVarChar(15), placa)
      .query('SELECT COUNT(*) AS total FROM Vehiculos WHERE placa = @placa');
    return result.recordset[0].total > 0;
  },

  /** Registra un vehiculo para un usuario. */
  async crear(datos) {
    const pool = await getPool();
    await pool.request()
      .input('placa', sql.NVarChar(15), datos.placa)
      .input('marca', sql.NVarChar(50), datos.marca || null)
      .input('modelo', sql.NVarChar(50), datos.modelo || null)
      .input('color', sql.NVarChar(30), datos.color || null)
      .input('tipo', sql.NVarChar(30), datos.tipo_vehiculo || null)
      .input('usuario', sql.Int, datos.id_usuario)
      .query(`
        INSERT INTO Vehiculos (placa, marca, modelo, color, tipo_vehiculo, id_usuario)
        VALUES (@placa, @marca, @modelo, @color, @tipo, @usuario)
      `);
    return true;
  },
};

module.exports = Vehiculo;
