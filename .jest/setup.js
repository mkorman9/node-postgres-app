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
        source: join(__dirname, '..', 'migrations'),
        target: '/docker-entrypoint-initdb.d',
        mode: 'ro'
      }
    ])
    .withWaitStrategy(Wait.forLogMessage(/.*database system is ready to accept connections.*/, 2))
    .start();

  const host = postgresContainer.getHost();
  const port = postgresContainer.getMappedPort(5432);
  process.env.DB_URL = `postgresql://${dbUser}:${dbPassword}@${host}:${port}/${dbName}`

  global.postgresContainer = postgresContainer;
};
