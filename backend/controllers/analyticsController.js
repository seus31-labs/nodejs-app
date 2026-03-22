'use strict';

const analyticsService = require('../services/analyticsService');

function handleAnalyticsError(fastify, reply, error, clientMessage, statusCode = 500) {
  fastify.log.error({ err: error, message: error?.message, stack: error?.stack }, clientMessage);
  reply.code(statusCode).send({ error: clientMessage });
}

async function getCompletionRate(fastify, req, reply) {
  try {
    const userId = req.user.id;
    const period = req.query.period;
    const data = await analyticsService.getCompletionRate(fastify, userId, period);
    reply.code(200).send(data);
  } catch (error) {
    handleAnalyticsError(fastify, reply, error, 'Failed to get completion rate');
  }
}

async function getTodosByPriority(fastify, req, reply) {
  try {
    const userId = req.user.id;
    const data = await analyticsService.getTodosByPriority(fastify, userId);
    reply.code(200).send(data);
  } catch (error) {
    handleAnalyticsError(fastify, reply, error, 'Failed to get todos by priority');
  }
}

async function getTodosByTag(fastify, req, reply) {
  try {
    const userId = req.user.id;
    const data = await analyticsService.getTodosByTag(fastify, userId);
    reply.code(200).send(data);
  } catch (error) {
    handleAnalyticsError(fastify, reply, error, 'Failed to get todos by tag');
  }
}

async function getTodosByProject(fastify, req, reply) {
  try {
    const userId = req.user.id;
    const data = await analyticsService.getTodosByProject(fastify, userId);
    reply.code(200).send(data);
  } catch (error) {
    handleAnalyticsError(fastify, reply, error, 'Failed to get todos by project');
  }
}

async function getWeeklyStats(fastify, req, reply) {
  try {
    const userId = req.user.id;
    const data = await analyticsService.getWeeklyStats(fastify, userId);
    reply.code(200).send(data);
  } catch (error) {
    handleAnalyticsError(fastify, reply, error, 'Failed to get weekly stats');
  }
}

module.exports = {
  getCompletionRate,
  getTodosByPriority,
  getTodosByTag,
  getTodosByProject,
  getWeeklyStats,
};
