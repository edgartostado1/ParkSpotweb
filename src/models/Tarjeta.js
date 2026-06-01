/**
 * src/models/Tarjeta.js
 * ---------------------------------------------------------------------------
 * Modelo Tarjeta: guarda SOLO los datos seguros de una tarjeta (ultimos 4,
 * titular, tipo y fecha de expiracion). Nunca guardamos el numero completo
 * ni el CVV (esto es una simulacion escolar, no hay procesamiento real).
 * ---------------------------------------------------------------------------
 */

const { getPool, sql } = require('../../config/db');

const Tarjeta = {
  /** Crea una tarjeta y devuelve su id.
   *  Usa OUTPUT INTO @tabla porque Tarjetas tiene trigger
   *  (tr_validar_tarjeta_expiracion).
   */
  async crear(datos) {
    const pool = await getPool();
    const result = await pool.request()
      .input('ultimos_4',        sql.Char(4),        datos.ultimos_4)
      .input('titular',          sql.NVarChar(100),  datos.titular)
      .input('tipo_tarjeta',     sql.NVarChar(50),   datos.tipo_tarjeta)
      .input('fecha_expiracion', sql.Date,           datos.fecha_expiracion)
      .input('id_usuario',       sql.Int,            datos.id_usuario)
      .query(`
        DECLARE @t TABLE (id INT);
        INSERT INTO Tarjetas (ultimos_4, titular, tipo_tarjeta,
                              fecha_expiracion, id_usuario)
        OUTPUT INSERTED.id_tarjeta INTO @t
        VALUES (@ultimos_4, @titular, @tipo_tarjeta, @fecha_expiracion, @id_usuario);
        SELECT id AS id_tarjeta FROM @t;
      `);
    return result.recordset[0].id_tarjeta;
  },
};

module.exports = Tarjeta;
