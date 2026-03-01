require('dotenv').config();

const {
  DATABASE_URL,
  DATABASE_NAME,
  DATABASE_USER,
  DATABASE_PASSWORD,
  DATABASE_HOST = 'localhost',
  DATABASE_PORT = '3306',
} = process.env;

function getConfig() {
  if (DATABASE_URL) {
    return { use_env_variable: 'DATABASE_URL', dialect: 'mysql' };
  }
  if (!DATABASE_NAME || !DATABASE_USER || !DATABASE_PASSWORD) {
    throw new Error('Set DATABASE_URL or DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD');
  }
  return {
    dialect: 'mysql',
    host: DATABASE_HOST,
    port: Number(DATABASE_PORT) || 3306,
    database: DATABASE_NAME,
    username: DATABASE_USER,
    password: DATABASE_PASSWORD,
  };
}

module.exports = {
  development: getConfig(),
  test: getConfig(),
  production: getConfig(),
};
