const { getPool } = require('../shared/db');

module.exports = async function (context, req) {
  try {
    const pool = await getPool();

    const threats = await pool.request().query(`
      SELECT category, percentage FROM ThreatDistribution ORDER BY percentage DESC
    `);

    const score = await pool.request().query(`
      SELECT TOP 1 score, threat_level FROM SecurityScore ORDER BY recorded_at DESC
    `);

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: {
        threatDistribution: threats.recordset,
        securityScore: score.recordset[0] || { score: 0, threat_level: 'UNKNOWN' }
      }
    };
  } catch (err) {
    context.log.error('Error fetching analytics:', err.message);
    context.res = {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      body: { error: 'Failed to fetch analytics data' }
    };
  }
};
