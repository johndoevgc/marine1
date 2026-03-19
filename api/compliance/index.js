const { getPool, sql } = require('../shared/db');

module.exports = async function (context, req) {
  try {
    const pool = await getPool();

    if (req.method === 'GET') {
      const result = await pool.request().query(`
        SELECT id, category, label, done
        FROM ComplianceItems
        ORDER BY category, id
      `);

      const grouped = {};
      for (const row of result.recordset) {
        if (!grouped[row.category]) grouped[row.category] = [];
        grouped[row.category].push({
          id: row.id,
          label: row.label,
          done: row.done
        });
      }

      context.res = {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: grouped
      };
    } else if (req.method === 'PUT') {
      const id = context.bindingData.id;
      const { done } = req.body;

      if (!id || typeof done !== 'boolean') {
        context.res = {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
          body: { error: 'Missing id parameter or done boolean in body' }
        };
        return;
      }

      await pool.request()
        .input('id', sql.NVarChar, id)
        .input('done', sql.Bit, done ? 1 : 0)
        .query('UPDATE ComplianceItems SET done = @done WHERE id = @id');

      context.res = {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: { id, done }
      };
    }
  } catch (err) {
    context.log.error('Error in compliance API:', err.message);
    context.res = {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      body: { error: 'Failed to process compliance request' }
    };
  }
};
