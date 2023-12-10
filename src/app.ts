import {Request, Response} from 'express';
import z from 'zod';
import {appendErrorHandlers, createApp} from './http/app_template';
import {validateRequestBody} from './http/validation';
import {addTodoItem, deleteTodoItem, findAllTodoItems, findTodoItem, updateTodoItem} from './todo_items';

const app = createApp();

const TodoItemPayload = z.object({
  content: z.string().min(1)
});

app.get('/', async (req: Request, res: Response) => {
  const items = await findAllTodoItems();
  return res.json(items);
});

app.get('/:id', async (req: Request, res: Response) => {
  const item = await findTodoItem(req.params.id);
  if (!item) {
    return res.status(404).json('Item not found');
  }

  return res.json(item);
});

app.post('/', async (req: Request, res: Response) => {
  const payload = await validateRequestBody(req, TodoItemPayload);
  const id = await addTodoItem(payload.content);
  return res.json(id);
});

app.put('/:id', async (req: Request, res: Response) => {
  const payload = await validateRequestBody(req, TodoItemPayload);
  const updated = await updateTodoItem(req.params.id, payload.content);
  if (!updated) {
    return res.status(404).json('Item not found');
  }

  return res.json('ok');
});

app.delete('/:id', async (req: Request, res: Response) => {
  const deleted = await deleteTodoItem(req.params.id);
  if (!deleted) {
    return res.status(404).json('Item not found');
  }

  return res.json('ok');
});

export default appendErrorHandlers(app);
