/**
 * src/models/Pago.js
 * ---------------------------------------------------------------------------
 * Modelo Pago: registra pagos en la tabla Pagos.
 * El pago siempre se asocia a una reserva, un metodo de pago y una tarjeta
 * (en nuestra simulacion, una tarjeta nueva por cada pago).
 * ---------------------------------------------------------------------------
 */

const { getPool, sql } = require('../../config/db');

const Pago = {
  /** Crea un pago marcado como 'Pagado' (simulado) y devuelve su id.
   *  Usa OUTPUT INTO @tabla porque Pagos tiene trigger (tr_cerrar_ticket_al_pagar).
   */
  async crear(datos) {
    const pool = await getPool();
    const result = await pool.request()
      .input('monto',        sql.Decimal(10, 2), datos.monto)
      .input('id_reserva',   sql.Int, datos.id_reserva)
      .input('id_metodo',    sql.Int, datos.id_metodo_pago)
      .input('id_tarjeta',   sql.Int, datos.id_tarjeta)
      .query(`
        DECLARE @t TABLE (id INT);
        INSERT INTO Pagos (monto, fecha_pago, estado_pago,
                           id_reserva, id_metodo_pago, id_tarjeta)
        OUTPUT INSERTED.id_pago INTO @t
        VALUES (@monto, CAST(GETDATE() AS DATE), 'Pagado',
                @id_reserva, @id_metodo, @id_tarjeta);
        SELECT id AS id_pago FROM @t;
      `);
    return result.recordset[0].id_pago;
  },

  /** Devuelve el pago de una reserva (si existe). */
  async porReserva(idReserva) {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, idReserva)
      .query(`
        SELECT p.id_pago, p.monto, p.fecha_pago, p.estado_pago,
               mp.nombre_metodo, t.ultimos_4, t.titular, t.tipo_tarjeta
        FROM Pagos p
        INNER JOIN MetodosPago mp ON p.id_metodo_pago = mp.id_metodo_pago
        INNER JOIN Tarjetas t     ON p.id_tarjeta = t.id_tarjeta
        WHERE p.id_reserva = @id
      `);
    return result.recordset[0] || null;
  },
};

module.exports = Pago;
