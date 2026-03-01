const authService = require('../services/authService');

function handleAuthError(fastify, reply, error, logLabel, clientMessage, statusCode) {
  fastify.log.error({ err: error, message: error?.message, stack: error?.stack }, logLabel);
  reply.code(statusCode).send({ error: clientMessage });
}

async function register(fastify, req, reply) {
  try {
    const registerResponse = await authService.register(fastify, req);
    if (registerResponse === 'ExistsEmail') {
      return reply.code(400).send({ error: 'Email already in use' });
    }
    if (registerResponse === 'ExistsName') {
      return reply.code(400).send({ error: 'Name already in use' });
    }
    reply.code(201).send({ token: registerResponse });
  } catch (error) {
    handleAuthError(fastify, reply, error, 'User registration failed', 'User registration failed', 400);
  }
}

async function login(fastify, req, reply) {
  try {
    const loginResponse = await authService.login(fastify, req);
    if (loginResponse === 'InValid') {
      return reply.code(401).send({ error: 'Invalid email or password' });
    }
    reply.send({ token: loginResponse });
  } catch (error) {
    handleAuthError(fastify, reply, error, 'Login failed', 'Login failed', 500);
  }
}

module.exports = {
  register,
  login
};