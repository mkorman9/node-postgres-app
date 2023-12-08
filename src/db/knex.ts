import knex from 'knex';
import config from '../config';

export default knex({
  client: 'pg',
  connection: {
    connectionString: config.DB_URL,
  },
  pool: {
    min: 0,
    max: 5
  }
});
