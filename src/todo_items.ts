import {uuidv7} from 'uuidv7';
import knex from './db/knex';
import {isUUID} from './util';

export type TodoItem = {
  id: string;
  content: string;
};

export type TodoItemsPage = {
  data: TodoItem[];
  pageSize: number;
  nextPageToken?: string;
};

export async function findTodoItemsPaged(pageSize: number, pageToken?: string): Promise<TodoItemsPage> {
  const query = knex<TodoItem>('todo_items')
    .select(['id', 'content'])
    .orderBy('id')
    .limit(pageSize);

  if (pageToken && isUUID(pageToken)) {
    query.where('id', '>', pageToken);
  }

  const data = await query;
  return {
    data,
    pageSize,
    nextPageToken: data.length > 0 ? data[data.length - 1].id : undefined
  };
}

export async function findTodoItem(id: string): Promise<TodoItem | undefined> {
  if (!isUUID(id)) {
    return undefined;
  }

  return knex<TodoItem>('todo_items')
    .select(['id', 'content'])
    .where('id', '=', id)
    .first();
}

export async function addTodoItem(content: string): Promise<string> {
  const id = uuidv7();
  await knex<TodoItem>('todo_items')
    .insert({ id, content });
  return id;
}

export async function updateTodoItem(id: string, content: string): Promise<boolean> {
  if (!isUUID(id)) {
    return false;
  }

  const affectedRows = await knex<TodoItem>('todo_items')
    .where('id', '=', id)
    .update({content});
  return affectedRows > 0;
}

export async function deleteTodoItem(id: string): Promise<boolean> {
  if (!isUUID(id)) {
    return false;
  }

  const affectedRows = await knex<TodoItem>('todo_items')
    .where('id', '=', id)
    .delete();
  return affectedRows > 0;
}

export async function deleteAllTodoItems(): Promise<void> {
  await knex<TodoItem>('todo_items')
    .delete();
}
