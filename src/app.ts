import express, {Request, Response} from 'express';
import z from 'zod';
import {appendErrorHandlers, createApp} from './http/app_template';
import {validateRequestBody} from './http/validation';
import {addTodoItem, deleteTodoItem, findAllTodoItems, findTodoItem, updateTodoItem} from './todo_items';

const app = createApp();

const TodoItemPayload = z.object({
  content: z.string().min(1)
});

app.use('/', express.static('./public'));

app.get('/api/items', async (req: Request, res: Response) => {
  const items = await findAllTodoItems();
  return res.json(items);
});

app.get('/api/items/:id', async (req: Request, res: Response) => {
  const item = await findTodoItem(req.params.id);
  if (!item) {
    return res.status(404).json({
      title: 'Item with given ID was not found',
      type: 'ItemNotFound'
    });
  }

  return res.json(item);
});

app.post('/api/items', async (req: Request, res: Response) => {
  const payload = await validateRequestBody(req, TodoItemPayload);
  const id = await addTodoItem(payload.content);
  return res.json({
    id
  });
});

app.put('/api/items/:id', async (req: Request, res: Response) => {
  const payload = await validateRequestBody(req, TodoItemPayload);
  const updated = await updateTodoItem(req.params.id, payload.content);
  if (!updated) {
    return res.status(404).json({
      title: 'Item with given ID was not found',
      type: 'ItemNotFound'
    });
  }

  return res.json({
    status: 'ok'
  });
});

app.delete('/api/items/:id', async (req: Request, res: Response) => {
  const deleted = await deleteTodoItem(req.params.id);
  if (!deleted) {
    return res.status(404).json({
      title: 'Item with given ID was not found',
      type: 'ItemNotFound'
    });
  }

  return res.json({
    status: 'ok'
  });
});

export default appendErrorHandlers(app);
