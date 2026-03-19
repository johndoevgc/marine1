const sql = require('mssql');

let pool;

async function getPool() {
  if (pool) {
    try {
      // Verify connection is still alive
      await pool.request().query('SELECT 1');
      return pool;
    } catch {
      pool = null;
    }
  }
  const connectionString = process.env.SQL_CONNECTION_STRING;
  if (!connectionString) {
    throw new Error('SQL_CONNECTION_STRING environment variable is not set');
  }
  pool = await sql.connect(connectionString);
  return pool;
}

module.exports = { getPool, sql };
