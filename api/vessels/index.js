const { getPool } = require('../shared/db');

module.exports = async function (context, req) {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT id, name, type, flag, status, speed, heading, mmsi, lat, lon
      FROM Vessels
      ORDER BY id
    `);
    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: result.recordset
    };
  } catch (err) {
    context.log.error('Error fetching vessels:', err.message);
    context.res = {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      body: { error: 'Failed to fetch vessels' }
    };
  }
};
