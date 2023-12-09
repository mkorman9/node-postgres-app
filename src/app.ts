import {Request, Response} from 'express';
import z from 'zod';
import {appendErrorHandlers, createApp} from './http/app_template';
import {addTodoItem, deleteTodoItem, findAllTodoItems, findTodoItem, updateTodoItem} from './todo_items';
import {bindRequestBody, getRequestBody} from './http/request_binding';

const app = createApp();

const TodoItemPayload = z.object({
  content: z.string().min(1)
});

app.get('/', async (req: Request, res: Response) => {
  const items = await findAllTodoItems();
  return res.status(200).json(items);
});

app.get('/:id', async (req: Request, res: Response) => {
  const item = await findTodoItem(req.params.id);
  if (!item) {
    return res.status(404).json('Item not found');
  }

  return res.status(200).json(item);
});

app.post(
  '/',
  bindRequestBody(TodoItemPayload),
  async (req: Request, res: Response) => {
    const payload = getRequestBody(req, TodoItemPayload);
    const id = await addTodoItem(payload.content);
    return res.status(200).json(id);
  }
);

app.put(
  '/:id',
  bindRequestBody(TodoItemPayload),
  async (req: Request, res: Response) => {
    const payload = getRequestBody(req, TodoItemPayload);
    const updated = await updateTodoItem(req.params.id, payload.content);
    if (!updated) {
      return res.status(404).json('Item not found');
    }

    return res.status(200).json('ok');
  }
);

app.delete(
  '/:id',
  async (req: Request, res: Response) => {
    const deleted = await deleteTodoItem(req.params.id);
    if (!deleted) {
      return res.status(404).json('Item not found');
    }

    return res.status(200).json('ok');
  }
);

export default appendErrorHandlers(app);
