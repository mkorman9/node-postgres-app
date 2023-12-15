import express from 'express';
import {appendErrorHandlers, createApp} from './http/app_template';
import todoItemsApi from './todo_items_api';

const app = createApp();

app.use('/', express.static('./public'));
app.use(todoItemsApi);

export default appendErrorHandlers(app);
