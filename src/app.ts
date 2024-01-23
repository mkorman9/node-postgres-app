import {Request, Response} from 'express';
import {createApp, attachDefaultHandlers} from './http/app_template';
import todoItemsAPI from './todo_items/api';
import config from './config';

const app = createApp({
  corsOrigin: config.HTTP_CORS_ORIGIN,
  trustProxies: config.HTTP_TRUST_PROXIES
});

app.get('/', async (req: Request, res: Response) => {
  res.json({
    content: 'hello world'
  });
});

app.use(todoItemsAPI);

export default attachDefaultHandlers(app);
