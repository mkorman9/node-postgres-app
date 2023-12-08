import knex from 'knex';
import config from '../config';

const db = knex({
  client: 'pg',
  connection: {
    connectionString: config.DB_URL,
  },
  pool: {
    min: 0,
    max: 5,

    // to prevent process from hanging after jest tests are finished
    idleTimeoutMillis: (process.env.NODE_ENV === 'test') ? 500 : undefined
  }
});

export default db;
