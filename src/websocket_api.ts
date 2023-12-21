import {Request} from 'express';
import expressWs from 'express-ws';
import ws from 'ws';

export function mountWebsocketApi(app: expressWs.Application) {
  app.ws('/ws', (ws: ws, req: Request) => {
    console.log('websocket connected');

    ws.on('message', (message: ws.RawData) => {
      console.log('websocket message', message);
    });

    ws.on('close', () => {
      console.log('websocket disconnected');
    });
  });
}
