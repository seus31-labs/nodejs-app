const userService = require('../services/userService');

async function getUsers(fastify, req, reply) {
  const users = await userService.getUsers(fastify, req.query);
  reply.code(200).send(users);
}

async function getUser(fastify, req, reply) {
  const user = await userService.getUserById(fastify, req.params.id);
  reply.code(200).send(user);
}

async function updateUser(fastify, req, reply) {
  const user = await userService.updateUser(fastify, req.params.id, req.body);
  reply.code(200).send(user);
}

async function deleteUser(fastify, req, reply) {
  await userService.deleteUser(fastify, req.params.id);
  reply.code(204).send();
}

module.exports = {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};
