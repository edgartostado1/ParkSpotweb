/**
 * src/models/Usuario.js
 * ---------------------------------------------------------------------------
 * Modelo Usuario: acceso a la tabla "Usuarios" (JOIN con "Roles").
 * Usa consultas parametrizadas (input) para evitar inyeccion SQL,
 * y bcryptjs para hashear y verificar contrasenas.
 * ---------------------------------------------------------------------------
 */

const bcrypt = require('bcryptjs');
const { getPool, sql } = require('../../config/db');

const Usuario = {
  /** Busca un usuario por correo, incluyendo el nombre de su rol. */
  async buscarPorCorreo(correo) {
    const pool = await getPool();
    const result = await pool.request()
      .input('correo', sql.NVarChar(150), correo)
      .query(`
        SELECT u.id_usuario, u.nombre, u.apellido, u.correo,
               u.hash_contrasena, u.telefono, u.estado_cuenta,
               u.id_rol, r.nombre_rol
        FROM Usuarios u
        INNER JOIN Roles r ON u.id_rol = r.id_rol
        WHERE u.correo = @correo
      `);
    return result.recordset[0] || null;
  },

  /** ¿Ya existe un usuario con ese correo? */
  async correoExiste(correo) {
    const pool = await getPool();
    const result = await pool.request()
      .input('correo', sql.NVarChar(150), correo)
      .query('SELECT COUNT(*) AS total FROM Usuarios WHERE correo = @correo');
    return result.recordset[0].total > 0;
  },

  /**
   * Crea un usuario nuevo. La contrasena llega en texto plano y se guarda
   * HASHEADA con bcrypt.
   */
  async crear(datos) {
    const hash = await bcrypt.hash(datos.contrasena, 10);
    const pool = await getPool();
    await pool.request()
      .input('nombre',   sql.NVarChar(100), datos.nombre)
      .input('apellido', sql.NVarChar(100), datos.apellido)
      .input('correo',   sql.NVarChar(150), datos.correo)
      .input('hash',     sql.NVarChar(255), hash)
      .input('telefono', sql.NVarChar(20),  datos.telefono || null)
      .input('id_rol',   sql.Int,           datos.id_rol)
      .query(`
        INSERT INTO Usuarios
          (nombre, apellido, correo, hash_contrasena, telefono,
           fecha_registro, estado_cuenta, id_rol)
        VALUES
          (@nombre, @apellido, @correo, @hash, @telefono,
           CAST(GETDATE() AS DATE), 'activo', @id_rol)
      `);
    return true;
  },

  /**
   * Verifica credenciales en el login.
   * Devuelve el usuario (sin el hash) si la contrasena es correcta, o null.
   */
  async verificarCredenciales(correo, contrasena) {
    const usuario = await this.buscarPorCorreo(correo);
    if (!usuario) return null;

    const ok = await bcrypt.compare(contrasena, usuario.hash_contrasena);
    if (!ok) return null;

    delete usuario.hash_contrasena; // no arrastramos el hash en la sesion
    return usuario;
  },
};

module.exports = Usuario;
