/**
 * config/db.js
 * ---------------------------------------------------------------------------
 * Conexion a SQL Server usando autenticacion SQL (usuario + contrasena).
 * Sirve tanto para local (SQL Server / SQL Express) como para la nube
 * (Azure SQL Database). El driver es "mssql" (tedious), 100% JavaScript:
 * no requiere ODBC ni binarios nativos, asi que tambien funciona en el
 * runner de GitHub Actions y en Azure App Service Linux.
 *
 * Los datos se leen de .env. Variables soportadas:
 *   DB_HOST       Servidor (ej: localhost  o  parkspot.database.windows.net)
 *   DB_PORT       Puerto (1433 por defecto)
 *   DB_NAME       Nombre de la base de datos
 *   DB_USER       Usuario SQL (ej: sa, parkspot, etc.)
 *   DB_PASS       Contrasena
 *   DB_INSTANCE   (opcional) Instancia con nombre, ej: SQLEXPRESS
 *   DB_ENCRYPT    "true" en Azure / "false" en local (por defecto: false)
 *   DB_TRUST_CERT "true" en local con cert. autofirmado (por defecto: true)
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

// Soporte opcional para instancia con nombre (ej: localhost\SQLEXPRESS).
// Si la usas, el servicio "SQL Server Browser" debe estar corriendo en Windows.
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
