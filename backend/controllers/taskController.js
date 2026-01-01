const taskService = require('../services/taskService');
const userService = require("../services/userService");

async function createTask(fastify, req, reply) {
  const newTask = await taskService.createTask(fastify, req.body);
  reply.code(201).send(newTask);
}

async function getTasks(fastify, req, reply){
  const tasks = await taskService.getTasks(fastify, req.query);
  reply.code(200).send(tasks);
}

module.exports = {
  createTask,
  getTasks,
};
