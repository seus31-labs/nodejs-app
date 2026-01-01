const fp = require('fastify-plugin');
const jwt = require('jsonwebtoken');

async function authPlugin(fastify, options) {
  fastify.decorate('authenticate', async (request, reply) => {
    try {
      const token = request.headers.authorization.split(' ')[1];
      request.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized' });
    }
  });
}

module.exports = fp(authPlugin);
