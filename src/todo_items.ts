import {uuidv7} from 'uuidv7';
import knex from './db/knex';

export type TodoItem = {
  id: string;
  content: string;
};

export async function getTodoItems() {
  return knex<TodoItem>('todo_items')
    .select(['id', 'content']);
}

export async function addTodoItem(content: string) {
  const id = uuidv7();
  await knex('todo_items')
    .insert({ id, content });
  return id;
}

export async function deleteAllTodoItems() {
  await knex('todo_items')
    .delete();
}
