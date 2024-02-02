import knex from 'knex';
import config from './config';

export default knex({
  client: 'pg',
  connection: {
    connectionString: config.DB_URL,
  },
  pool: {
    min: config.DB_POOL_MIN,
    max: config.DB_POOL_MAX,

    // to prevent process from hanging after jest tests are finished
    idleTimeoutMillis: (process.env.NODE_ENV === 'test') ? 500 : undefined
  }
});
