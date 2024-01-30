import {attachDefaultHandlers, createExpressApp} from './http/express_template';
import todoItemsAPI from './todo_items/api';
import config from './config';

const app = createExpressApp({
  corsOrigin: config.HTTP_CORS_ORIGIN,
  trustProxies: config.HTTP_TRUST_PROXIES
});

app.get('/', async (req, res) => {
  res.json({
    content: 'hello world'
  });
});

app.use(todoItemsAPI);

export default attachDefaultHandlers(app);
