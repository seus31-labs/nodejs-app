'use strict';

const exportService = require('../services/exportService');

/**
 * GET /api/v1/todos/export?format=json|csv のハンドラ
 */
async function exportTodos(fastify, req, reply) {
  try {
    const userId = req.user.id;
    const format = (req.query.format || 'json').toLowerCase();
    if (format === 'csv') {
      const csv = await exportService.exportTodosAsCSV(fastify, userId);
      reply
        .header('Content-Type', 'text/csv; charset=utf-8')
        .header('Content-Disposition', 'attachment; filename="todos.csv"')
        .send(csv);
    } else {
      const data = await exportService.exportTodosAsJSON(fastify, userId);
      reply.code(200).send(data);
    }
  } catch (error) {
    fastify.log.error({ err: error }, 'Export failed');
    reply.code(500).send({ error: 'Export failed' });
  }
}

module.exports = {
  exportTodos,
};
