import {Router} from 'express';
import z from 'zod';
import {addTodoItem, deleteTodoItem, findTodoItem, findTodoItemsPaged, updateTodoItem} from './model';
import {validate} from '../http/validation';

const api = Router();

api.get(
  '/api/items',
  validate({
    query: {
      pageSize: z.coerce.number()
        .int()
        .min(1)
        .max(100)
        .default(10),
      pageToken: z.string().optional()
    }
  }),
  async (req, res) => {
    const page = await findTodoItemsPaged(req.query.pageSize, req.query.pageToken);
    return res.json(page);
  }
);

api.get(
  '/api/items/:id',
  validate({
    params: {
      id: z.string().uuid()
    }
  }),
  async (req, res) => {
    const item = await findTodoItem(req.params.id);
    if (!item) {
      return res.status(404).json({
        title: 'Item with given ID was not found',
        type: 'ItemNotFound'
      });
    }

    return res.json(item);
  }
);

api.post(
  '/api/items',
  validate({
    body: {
      content: z.string().min(1)
    }
  }),
  async (req, res) => {
    const id = await addTodoItem(req.body);
    return res.json({
      id
    });
  }
);

api.put(
  '/api/items/:id',
  validate({
    params: {
      id: z.string().uuid()
    },
    body: {
      content: z.string().min(1)
    }
  }),
  async (req, res) => {
    const updated = await updateTodoItem(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({
        title: 'Item with given ID was not found',
        type: 'ItemNotFound'
      });
    }

    return res.json({
      status: 'ok'
    });
  }
);

api.delete(
  '/api/items/:id',
  validate({
    params: {
      id: z.string().uuid()
    }
  }),
  async (req, res) => {
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
  }
);

export default api;
