const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function register(fastify, req) {
  const { name, email, password } = req.body;

  const existingUser = await fastify.models.User.findOne({
    where: { email }
  });
  if (existingUser) return 'ExistsEmail';

  const existingName = await fastify.models.User.findOne({
    where: { name }
  });
  if (existingName) return 'ExistsName';

  const user = await fastify.models.User.create({ name, email, password });
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

async function login(fastify, req) {
  const { email, password } = req.body;
  const user = await fastify.models.User.findOne({
    where: { email }
  });
  if (!user) return 'InValid';

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return 'InValid';

  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

module.exports = {
  register,
  login,
};
