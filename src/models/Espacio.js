/**
 * src/models/Espacio.js
 * ---------------------------------------------------------------------------
 * Modelo Espacio: acceso a la tabla "Espacios".
 * - Para el usuario: lista los espacios de un estacionamiento (con su tipo y
 *   tarifa) para dibujar el mapa visual.
 * - Para el admin: CRUD completo (crear, listar, editar, eliminar) y cambiar
 *   el estado de un espacio.
 *
 * Estados usados: 'Disponible', 'Ocupado', 'Reservado'.
 * La tarifa se obtiene con OUTER APPLY tomando la mas reciente por tipo.
 * ---------------------------------------------------------------------------
 */

const { getPool, sql } = require('../../config/db');

const Espacio = {
  /** Espacios de un estacionamiento, con nombre de tipo y precio por hora. */
  async porEstacionamiento(idEstacionamiento) {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, idEstacionamiento)
      .query(`
        SELECT s.id_espacio, s.numero_espacio, s.estado,
               s.id_tipo_espacio, s.id_estacionamiento,
               t.nombre_tipo, tar.precio_hora
        FROM Espacios s
        INNER JOIN TiposEspacio t ON s.id_tipo_espacio = t.id_tipo_espacio
        OUTER APPLY (
          SELECT TOP 1 precio_hora
          FROM Tarifas
          WHERE id_tipo_espacio = s.id_tipo_espacio
          ORDER BY fecha_actualizacion DESC
        ) tar
        WHERE s.id_estacionamiento = @id
        ORDER BY s.numero_espacio
      `);
    return result.recordset;
  },

  /** Lista TODOS los espacios (para la tabla del admin), con tipo y estacionamiento. */
  async todos() {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT s.id_espacio, s.numero_espacio, s.estado,
             t.nombre_tipo, e.nombre AS nombre_estacionamiento,
             s.id_tipo_espacio, s.id_estacionamiento
      FROM Espacios s
      INNER JOIN TiposEspacio t ON s.id_tipo_espacio = t.id_tipo_espacio
      INNER JOIN Estacionamientos e ON s.id_estacionamiento = e.id_estacionamiento
      ORDER BY e.nombre, s.numero_espacio
    `);
    return result.recordset;
  },

  /** Un espacio por id (con tipo y precio), para el formulario de reserva. */
  async porId(id) {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT s.id_espacio, s.numero_espacio, s.estado,
               s.id_tipo_espacio, s.id_estacionamiento,
               t.nombre_tipo, e.nombre AS nombre_estacionamiento,
               tar.precio_hora
        FROM Espacios s
        INNER JOIN TiposEspacio t ON s.id_tipo_espacio = t.id_tipo_espacio
        INNER JOIN Estacionamientos e ON s.id_estacionamiento = e.id_estacionamiento
        OUTER APPLY (
          SELECT TOP 1 precio_hora
          FROM Tarifas
          WHERE id_tipo_espacio = s.id_tipo_espacio
          ORDER BY fecha_actualizacion DESC
        ) tar
        WHERE s.id_espacio = @id
      `);
    return result.recordset[0] || null;
  },

  /** Crea un espacio (admin). */
  async crear(datos) {
    const pool = await getPool();
    await pool.request()
      .input('numero', sql.NVarChar(20), datos.numero_espacio)
      .input('estado', sql.NVarChar(20), datos.estado || 'Disponible')
      .input('tipo', sql.Int, datos.id_tipo_espacio)
      .input('est', sql.Int, datos.id_estacionamiento)
      .query(`
        INSERT INTO Espacios (numero_espacio, estado, id_tipo_espacio, id_estacionamiento)
        VALUES (@numero, @estado, @tipo, @est)
      `);
    return true;
  },

  /** Actualiza un espacio (admin). */
  async actualizar(id, datos) {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, id)
      .input('numero', sql.NVarChar(20), datos.numero_espacio)
      .input('estado', sql.NVarChar(20), datos.estado)
      .input('tipo', sql.Int, datos.id_tipo_espacio)
      .input('est', sql.Int, datos.id_estacionamiento)
      .query(`
        UPDATE Espacios
        SET numero_espacio = @numero, estado = @estado,
            id_tipo_espacio = @tipo, id_estacionamiento = @est
        WHERE id_espacio = @id
      `);
    return true;
  },

  /** Elimina un espacio (admin). */
  async eliminar(id) {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Espacios WHERE id_espacio = @id');
    return true;
  },

  /** Cambia solo el estado de un espacio. */
  async cambiarEstado(id, nuevoEstado) {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, id)
      .input('estado', sql.NVarChar(20), nuevoEstado)
      .query('UPDATE Espacios SET estado = @estado WHERE id_espacio = @id');
    return true;
  },
};

module.exports = Espacio;
