const { checkNullStringValue } = require("../utils/variableUtil");

async function getUsers(fastify, queryData) {
  const page = parseInt(queryData.page, 10) || 1;
  const limit = parseInt(queryData.limit, 10) || 10;
  const offset = (page - 1) * limit;
  const { count, rows } = await fastify.models.User.findAndCountAll({
    limit: limit,
    offset: offset,
    order: [['createdAt', 'ASC']]
  });

  return {
    users: rows,
    totalItems: count,
    currentPage: page,
    limit: limit,
    totalPages: Math.ceil(count / limit)
  };
}

async function getUserById(fastify, id) {
  return await fastify.models.User.findByPk(id);
}

async function updateUser(fastify, id, userData) {
  const user =  await fastify.models.User.findByPk(id);
  if (checkNullStringValue(userData.name)) {
    user.name = userData.name;
  }

  if (checkNullStringValue(userData.email)) {
    user.email = userData.email;
  }

  await user.save();
  return user;
}

async function deleteUser(fastify, id) {
  const user = await fastify.models.User.findByPk(id);
  return await user.destroy();
}

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
