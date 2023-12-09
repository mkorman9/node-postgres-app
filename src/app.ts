import {NextFunction, Request, Response} from 'express';
import z from 'zod';
import {appendErrorHandlers, createApp} from './http/app_template';
import {addTodoItem, findTodoItem, findAllTodoItems, updateTodoItem, deleteTodoItem} from './todo_items';
import {bindRequestBody, getRequestBody} from './http/request_binding';

const app = createApp();

const TodoItemPayload = z.object({
  content: z.string().min(1)
});

app.get('/', (req: Request, res: Response, next: NextFunction) => {
  findAllTodoItems()
    .then(items => res.status(200).json(items))
    .catch(e => next(e));
});

app.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  findTodoItem(req.params.id)
    .then(item => {
      if (!item) {
        return res.status(404).json('Item not found');
      }

      res.status(200).json(item);
    })
    .catch(e => next(e));
});

app.post(
  '/',
  bindRequestBody(TodoItemPayload),
  (req: Request, res: Response, next: NextFunction) => {
    const payload = getRequestBody(req, TodoItemPayload);
    addTodoItem(payload.content)
      .then(id => res.status(200).json(id))
      .catch(e => next(e));
  }
);

app.put(
  '/:id',
  bindRequestBody(TodoItemPayload),
  (req: Request, res: Response, next: NextFunction) => {
    const payload = getRequestBody(req, TodoItemPayload);
    updateTodoItem(req.params.id, payload.content)
      .then(updated => {
        if (!updated) {
          return res.status(404).json('Item not found');
        }

        res.status(200).json('ok');
      })
      .catch(e => next(e));
  }
);

app.delete(
  '/:id',
  (req: Request, res: Response, next: NextFunction) => {
    deleteTodoItem(req.params.id)
      .then(deleted => {
        if (!deleted) {
          return res.status(404).json('Item not found');
        }

        res.status(200).json('ok');
      })
      .catch(e => next(e));
  }
);

export default appendErrorHandlers(app);
