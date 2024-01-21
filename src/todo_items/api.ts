import {Request, Response, Router} from 'express';
import z from 'zod';
import {addTodoItem, deleteTodoItem, findTodoItem, findTodoItemsPaged, updateTodoItem} from './model';
import {validateRequestBody, validateRequestQuery} from '../http/validation';

const api = Router();

api.get('/api/items', async (req: Request, res: Response) => {
  const query = await validateRequestQuery(req, z.object({
    pageSize: z.coerce.number()
      .int()
      .min(1)
      .max(100)
      .default(10),
    pageToken: z.string().optional()
  }));

  const page = await findTodoItemsPaged(query.pageSize, query.pageToken);
  return res.json(page);
});

api.get('/api/items/:id', async (req: Request, res: Response) => {
  const item = await findTodoItem(req.params.id);
  if (!item) {
    return res.status(404).json({
      title: 'Item with given ID was not found',
      type: 'ItemNotFound'
    });
  }

  return res.json(item);
});

api.post('/api/items', async (req: Request, res: Response) => {
  const payload = await validateRequestBody(req, z.object({
    content: z.string().min(1)
  }));
  const id = await addTodoItem(payload);
  return res.json({
    id
  });
});

api.put('/api/items/:id', async (req: Request, res: Response) => {
  const payload = await validateRequestBody(req, z.object({
    content: z.string().min(1)
  }));
  const updated = await updateTodoItem(req.params.id, payload);
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

api.delete('/api/items/:id', async (req: Request, res: Response) => {
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

export default api;
