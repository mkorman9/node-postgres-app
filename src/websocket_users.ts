import ws from 'ws';
import {uuidv4} from 'uuidv7';

export type WebsocketUser = {
  id: string;
  socket: ws;
  joined: boolean;
  username: string;
};

const users = new Map<string, WebsocketUser>();

export function registerSocketUser(socket: ws): WebsocketUser {
  const id = uuidv4();
  const user = {
    id,
    socket,
    joined: false,
    username: ''
  };

  users.set(id, user);

  return user;
}

export function unregisterSocketUser(user: WebsocketUser) {
  users.delete(user.id);
}

export function sendSocketMessage(user: WebsocketUser, type: string, data: unknown) {
  user.socket.send(JSON.stringify({
    type,
    data
  }));
}

export function broadcastSocketMessageToJoined(type: string, data: unknown) {
  [...users.values()]
    .filter(user => user.joined)
    .forEach(user => sendSocketMessage(user, type, data));
}
