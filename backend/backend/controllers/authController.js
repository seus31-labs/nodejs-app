const authService = require('../services/authService');
const jwt = require('jsonwebtoken');

async function register(fastify, req, reply) {
  try {
    const registerResponse = await authService.register(fastify, req);
    if (registerResponse === 'ExistsEmail') {
      return reply.code(400).send({ error: 'Email already in use' });
    } else if (registerResponse === 'ExistsName') {
      return reply.code(400).send({ error: 'Name already in use' });
    }
    reply.code(201).send({ token: registerResponse });
  } catch (error) {
    reply.code(400).send({ error: 'User registration failed' });
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
    reply.code(500).send({ error: 'Login failed' });
  }
}

module.exports = {
  register,
  login
};