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

export function listSocketUsers() {
  return [...users.values()];
}

export function sendSocketMessage(user: WebsocketUser, type: string, data: unknown) {
  user.socket.send(JSON.stringify({
    type,
    data
  }));
}

export function broadcastSocketMessage(predicate: (user: WebsocketUser) => void, type: string, data: unknown) {
  listSocketUsers()
    .filter(predicate)
    .forEach(user => sendSocketMessage(user, type, data));
}
