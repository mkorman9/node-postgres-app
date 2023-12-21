import {appendErrorHandlers, createApp} from './http/app_template';
import todoItemsAPI from './todo_items_api';
import {mountWebsocketAPI} from './websocket_api';
import {Request, Response} from 'express';

const app = createApp();

//app.use('/', express.static('./public'));

app.get('/', async (req: Request, res: Response) => {
  res.json({
    content: 'hello world'
  });
});

app.use(todoItemsAPI);
mountWebsocketAPI(app);

export default appendErrorHandlers(app);
