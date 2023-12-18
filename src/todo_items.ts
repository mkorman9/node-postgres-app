import {uuidv7} from 'uuidv7';
import knex from './db/knex';
import {isInvalidUuidError} from './db/helpers';

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
    .limit(pageSize);

  if (pageToken) {
    query.where('id', '>', pageToken);
  }

  try {
    const data = await query;
    return {
      data,
      pageSize,
      nextPageToken: data.length > 0 ? data[data.length - 1].id : undefined
    };
  } catch (e) {
    if (isInvalidUuidError(e)) {
      return {
        data: [],
        pageSize
      };
    }
    
    throw e;
  }
}

export async function findTodoItem(id: string): Promise<TodoItem | undefined> {
  try {
    return await knex<TodoItem>('todo_items')
      .select(['id', 'content'])
      .where('id', id)
      .first();
  } catch (e) {
    if (isInvalidUuidError(e)) {
      return undefined;
    }

    throw e;
  }
}

export async function addTodoItem(content: string): Promise<string> {
  const id = uuidv7();
  await knex<TodoItem>('todo_items')
    .insert({ id, content });
  return id;
}

export async function updateTodoItem(id: string, content: string): Promise<boolean> {
  try {
    const affectedRows = await knex<TodoItem>('todo_items')
      .where('id', id)
      .update({content});
    return affectedRows > 0;
  } catch (e) {
    if (isInvalidUuidError(e)) {
      return false;
    }

    throw e;
  }
}

export async function deleteTodoItem(id: string): Promise<boolean> {
  try {
    const affectedRows = await knex<TodoItem>('todo_items')
      .where('id', id)
      .delete();
    return affectedRows > 0;
  } catch (e) {
    if (isInvalidUuidError(e)) {
      return false;
    }

    throw e;
  }
}

export async function deleteAllTodoItems(): Promise<void> {
  await knex<TodoItem>('todo_items')
    .delete();
}
