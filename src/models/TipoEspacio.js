/**
 * src/models/TipoEspacio.js
 * ---------------------------------------------------------------------------
 * Modelo TipoEspacio: lee la tabla "TiposEspacio".
 * Se usa para llenar los <select> de los formularios (crear/editar espacio).
 * ---------------------------------------------------------------------------
 */

const { getPool } = require('../../config/db');

const TipoEspacio = {
  async todos() {
    const pool = await getPool();
    const result = await pool.request()
      .query('SELECT id_tipo_espacio, nombre_tipo FROM TiposEspacio ORDER BY nombre_tipo');
    return result.recordset;
  },
};

module.exports = TipoEspacio;
