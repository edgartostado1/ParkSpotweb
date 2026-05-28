/**
 * config/db.js
 * ---------------------------------------------------------------------------
 * Conexion a SQL Server usando autenticacion SQL (usuario + contrasena).
 * El driver es "mssql" (tedious), puro JavaScript.
 *
 * Variables leidas de .env:
 *   DB_HOST       Servidor (ej: localhost  o  parkspot.database.windows.net)
 *   DB_PORT       Puerto (1433 por defecto)
 *   DB_NAME       Nombre de la base de datos
 *   DB_USER       Usuario SQL
 *   DB_PASS       Contrasena
 *   DB_INSTANCE   (opcional) Instancia con nombre, ej: SQLEXPRESS
 *   DB_ENCRYPT    "true" en la nube / "false" en local sin cifrado
 *   DB_TRUST_CERT "true" en local con cert. autofirmado
 * ---------------------------------------------------------------------------
 */

const sql = require('mssql');

const config = {
  server: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433', 10),
  database: process.env.DB_NAME || 'ParkSpot',
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_CERT !== 'false',
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

if (process.env.DB_INSTANCE) {
  config.options.instanceName = process.env.DB_INSTANCE;
}

let pool = null;

/** Devuelve el pool de conexiones, creandolo la primera vez. */
async function getPool() {
  if (pool) return pool;
  try {
    pool = await sql.connect(config);
    return pool;
  } catch (err) {
    console.error('Error de conexion a SQL Server:', err.message);
    throw err;
  }
}

module.exports = { getPool, sql };
