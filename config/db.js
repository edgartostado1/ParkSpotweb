/**
 * config/db.js
 * ---------------------------------------------------------------------------
 * Conexion a SQL Server usando AUTENTICACION DE WINDOWS (Trusted_Connection)
 * a traves del driver "msnodesqlv8". No requiere usuario ni contrasena:
 * usa la cuenta de Windows con la que inicias sesion (igual que en SSMS).
 *
 * El controlador ODBC se toma de DB_ODBC_DRIVER (.env) para que coincida con
 * el que tengas instalado. Valores tipicos:
 *   - "SQL Server"                  (viene incluido en todo Windows)
 *   - "ODBC Driver 17 for SQL Server"
 *   - "ODBC Driver 18 for SQL Server"
 * ---------------------------------------------------------------------------
 */

const sql = require('mssql/msnodesqlv8');

// Datos desde el .env
const host = process.env.DB_HOST || 'localhost';
const instance = process.env.DB_INSTANCE || '';
const dbName = process.env.DB_NAME || 'ParkSpot';
const odbcDriver = process.env.DB_ODBC_DRIVER || 'SQL Server';

// Nombre del servidor: host + instancia (ej: localhost\SQLEXPRESS)
const serverName = instance ? `${host}\\${instance}` : host;

// Cadena de conexion ODBC. "Trusted_Connection=yes" = autenticacion de Windows.
let connectionString =
  `Driver={${odbcDriver}};` +
  `Server=${serverName};` +
  `Database=${dbName};` +
  `Trusted_Connection=yes;`;

// TrustServerCertificate solo lo entienden los drivers "ODBC Driver 17/18".
if (/ODBC Driver/i.test(odbcDriver)) {
  connectionString += 'TrustServerCertificate=yes;';
}

const config = { connectionString };

let pool = null;

/** Devuelve el pool de conexiones, creandolo la primera vez. */
async function getPool() {
  if (pool) return pool;
  try {
    pool = await sql.connect(config);
    return pool;
  } catch (err) {
    console.error('Error de conexion a SQL Server:', err.message);
    console.error('Cadena usada:', connectionString);
    throw err;
  }
}

module.exports = { getPool, sql };
