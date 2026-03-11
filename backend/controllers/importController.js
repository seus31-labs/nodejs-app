'use strict';

const importService = require('../services/importService');

/**
 * POST /api/v1/todos/import のハンドラ
 * body: { format: 'json'|'csv', data: object|string }
 */
async function importTodos(fastify, req, reply) {
  try {
    const userId = req.user.id;
    const format = (req.body?.format || 'json').toLowerCase();
    const payload = req.body?.data;
    if (payload === undefined) {
      return reply.code(400).send({ error: 'Missing data' });
    }
    if (format === 'csv') {
      const result = await importService.importTodosFromCSV(fastify, userId, typeof payload === 'string' ? payload : String(payload));
      return reply.code(200).send(result);
    }
    if (format === 'json') {
      const data = typeof payload === 'object' && payload !== null ? payload : {};
      const result = await importService.importTodosFromJSON(fastify, userId, data);
      return reply.code(200).send(result);
    }
    return reply.code(400).send({ error: 'Invalid format. Use json or csv' });
  } catch (error) {
    fastify.log.error({ err: error }, 'Import failed');
    reply.code(500).send({ error: 'Import failed' });
  }
}

module.exports = {
  importTodos,
};
