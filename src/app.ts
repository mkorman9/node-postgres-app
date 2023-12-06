import {NextFunction, Request, Response} from 'express';
import z from 'zod';
import {appendErrorHandlers, createApp} from './http/app_template';
import {addTodoItem, getTodoItems} from './todo_items';
import {bindRequestBody, getRequestBody} from './http/request_binding';

const app = createApp();

const AddTodoItemPayload = z.object({
  content: z.string()
});

app.get('/', (req: Request, res: Response, next: NextFunction) => {
  getTodoItems()
    .then(result => res.status(200).json(result))
    .catch(e => next(e));
});

app.post(
  '/',
  bindRequestBody(AddTodoItemPayload),
  (req: Request, res: Response, next: NextFunction) => {
    const payload = getRequestBody(req, AddTodoItemPayload);
    addTodoItem(payload.content)
      .then(id => res.status(200).json(id))
      .catch(e => next(e));
  }
);

export default appendErrorHandlers(app);
