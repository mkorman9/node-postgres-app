import {uuidv7} from 'uuidv7';
import knex from './db/knex';
import z from 'zod';

export type TodoItem = {
  id: string;
  content: string;
};

export async function getTodoItems(): Promise<TodoItem[]> {
  return knex<TodoItem>('todo_items')
    .select(['id', 'content']);
}

export async function findTodoItem(id: string): Promise<TodoItem | undefined> {
  if (!z.string().uuid().safeParse(id).success) {
    return undefined;
  }

  return knex<TodoItem>('todo_items')
    .select(['id', 'content'])
    .where('id', id)
    .first();
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
