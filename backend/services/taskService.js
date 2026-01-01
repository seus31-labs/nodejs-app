async function createTask(fastify, taskData) {
  return fastify.models.Task.create(taskData);
}

async function getTasks(fastify, queryData) {
  const page = parseInt(queryData.page, 10) || 1;
  const limit = parseInt(queryData.limit, 10) || 10;
  const offset = (page - 1) * limit;
  const { count, rows } = await fastify.models.Task.findAndCountAll({
    limit: limit,
    offset: offset,
    order: [['createdAt', 'ASC']]
  });

  return {
    tasks: rows,
    totalItems: count,
    currentPage: page,
    limit: limit,
    totalPages: Math.ceil(count / limit)
  };
}

module.exports = {
  createTask,
  getTasks
};
