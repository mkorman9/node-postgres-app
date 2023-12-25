import ws from 'ws';
import {uuidv4} from 'uuidv7';

export type WebsocketSession = {
  id: string;
  socket: ws;
};

export type WebsocketUser = {
  session: WebsocketSession;
  username: string;
};

const sessions = new Map<string, WebsocketSession>();
const users = new Map<string, WebsocketUser>();

export function createWebsocketSession(socket: ws): WebsocketSession {
  let id = '';
  do {
    id = uuidv4();
  } while (sessions.has(id));

  const session = {
    id,
    socket
  };
  sessions.set(id, session);
  return session;
}

export function closeWebsocketSession(session: WebsocketSession) {
  sessions.delete(session.id);
  users.delete(session.id);
}

export function joinWebsocketUser(
  session: WebsocketSession,
  username: string
): WebsocketUser | undefined {
  if (users.has(session.id)) {
    return undefined;
  }

  const user: WebsocketUser = {
    session,
    username
  };
  users.set(session.id, user);
  return user;
}

export function listWebsocketUsers() {
  return [...users.values()];
}

export function getWebsocketUser(session: WebsocketSession): WebsocketUser | undefined {
  return users.get(session.id);
}

export function sendWebsocketMessage(session: WebsocketSession, type: string, data: unknown) {
  session.socket.send(JSON.stringify({
    type,
    data
  }));
}
