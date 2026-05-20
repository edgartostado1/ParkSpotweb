/**
 * src/models/Rol.js
 * ---------------------------------------------------------------------------
 * Modelo Rol: acceso a la tabla "Roles".
 * Se usa, por ejemplo, para obtener el id del rol "Usuario" al registrar.
 * ---------------------------------------------------------------------------
 */

const { getPool, sql } = require('../../config/db');

const Rol = {
  /** Devuelve todos los roles. */
  async todos() {
    const pool = await getPool();
    const result = await pool.request()
      .query('SELECT id_rol, nombre_rol FROM Roles ORDER BY id_rol');
    return result.recordset;
  },

  /** Busca el id de un rol por su nombre (ej: 'Usuario'). */
  async idPorNombre(nombreRol) {
    const pool = await getPool();
    const result = await pool.request()
      .input('nombre', sql.NVarChar(50), nombreRol)
      .query('SELECT id_rol FROM Roles WHERE nombre_rol = @nombre');
    return result.recordset[0] ? result.recordset[0].id_rol : null;
  },
};

module.exports = Rol;
