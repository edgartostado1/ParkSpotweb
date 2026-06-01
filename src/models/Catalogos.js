/**
 * src/models/Catalogos.js
 * ---------------------------------------------------------------------------
 * Modelo "catalogos": entrega listas para llenar dropdowns/selects de los
 * formularios (Marcas, Modelos+marca, Colores, TiposVehiculo, MetodosPago).
 * ---------------------------------------------------------------------------
 */

const { getPool } = require('../../config/db');

const Catalogos = {
  async marcas() {
    const pool = await getPool();
    const result = await pool.request()
      .query('SELECT id_marca, nombre FROM Marcas ORDER BY nombre');
    return result.recordset;
  },

  /** Modelos con el nombre de su marca, listos para mostrar "Toyota - Corolla". */
  async modelos() {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT mo.id_modelo, mo.nombre, m.nombre AS marca, mo.id_marca
      FROM Modelos mo
      INNER JOIN Marcas m ON mo.id_marca = m.id_marca
      ORDER BY m.nombre, mo.nombre
    `);
    return result.recordset;
  },

  async colores() {
    const pool = await getPool();
    const result = await pool.request()
      .query('SELECT id_color, nombre FROM Colores ORDER BY nombre');
    return result.recordset;
  },

  async tiposVehiculo() {
    const pool = await getPool();
    const result = await pool.request()
      .query('SELECT id_tipo, nombre FROM TiposVehiculo ORDER BY nombre');
    return result.recordset;
  },

  async metodosPago() {
    const pool = await getPool();
    const result = await pool.request()
      .query('SELECT id_metodo_pago, nombre_metodo FROM MetodosPago ORDER BY nombre_metodo');
    return result.recordset;
  },

  /** Solo Visa y MasterCard (para el formulario de pago simulado). */
  async metodosTarjeta() {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT id_metodo_pago, nombre_metodo
      FROM MetodosPago
      WHERE nombre_metodo IN ('Visa', 'MasterCard')
      ORDER BY nombre_metodo
    `);
    return result.recordset;
  },
};

module.exports = Catalogos;
