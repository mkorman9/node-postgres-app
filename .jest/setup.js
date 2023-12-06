const {GenericContainer, Wait} = require('testcontainers');
const {join} = require('path');

module.exports = async function() {
  const dbName = 'test_db';
  const dbUser = 'test_user';
  const dbPassword = 'test_password';

  const postgresContainer = await new GenericContainer('postgres:15')
    .withExposedPorts(5432)
    .withEnvironment({
      POSTGRES_DB: dbName,
      POSTGRES_USER: dbUser,
      POSTGRES_PASSWORD: dbPassword
    })
    .withBindMounts([
      {
        source: join(__dirname, 'migrations'),
        target: '/docker-entrypoint-initdb.d',
        mode: 'ro'
      }
    ])
    .withWaitStrategy(Wait.forLogMessage(/.*database system is ready to accept connections.*/, 2))
    .start();

  process.env.DB_HOST = postgresContainer.getHost();
  process.env.DB_PORT = postgresContainer.getMappedPort(5432);
  process.env.DB_NAME = dbName;
  process.env.DB_USER = dbUser;
  process.env.DB_PASSWORD = dbPassword;

  global.postgresContainer = postgresContainer;
};
