import {uuidv7} from 'uuidv7';
import pool from './db/pool';

export async function getTodoItems() {
  const conn = await pool.connect();

  const result = await conn.query('SELECT id, content FROM todo_items');

  conn.release();
  return result.rows;
}

export async function addTodoItem(content: string) {
  const conn = await pool.connect();

  const id = uuidv7();
  await conn.query('INSERT INTO todo_items(id, content) VALUES ($1, $2)', [id, content]);

  conn.release();
  return id;
}

export async function deleteAllTodoItems() {
  const conn = await pool.connect();
  await conn.query('DELETE FROM todo_items');
  conn.release();
}
