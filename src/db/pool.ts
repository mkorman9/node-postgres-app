import pg from 'pg';
import config from '../config';

const pool = new pg.Pool({
  host: config.DB_HOST,
  port: config.DB_PORT,
  database: config.DB_NAME,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  max: 5
});

// this is to prevent Jest from throwing an error when the test container is exiting after tests,
// and some pool connections are still open
if (process.env.NODE_ENV === 'test') {
  pool.on('error', () => {
  });
}

export default pool;
