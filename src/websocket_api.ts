import {Request} from 'express';
import ws from 'ws';
import {ZodError} from 'zod';
import {Packets, PacketsType, WebsocketProtocol} from './websocket_protocol';
import {
  joinWebsocketUser,
  getWebsocketUser,
  listWebsocketUsers,
  createWebsocketSession,
  sendWebsocketMessage,
  closeWebsocketSession
} from './websocket_session';

export default function websocketAPI(socket: ws, req: Request) {
  const session = createWebsocketSession(socket);
  const protocol = new WebsocketProtocol();

  socket.on('message', (data: ws.RawData) => {
    try {
      const packet = JSON.parse(data.toString());
      if (Object.hasOwn(Packets, packet.type)) {
        const payload = Packets[packet.type as keyof PacketsType].parse(packet.data);
        protocol.emit(packet.type, payload);
      }
    } catch (e) {
      if (e instanceof SyntaxError || e instanceof ZodError) {
        // ignore message
        return;
      }

      throw e;
    }
  });

  socket.on('close', () => {
    const user = getWebsocketUser(session);
    if (user) {
      console.log(`${user.username} left`);

      listWebsocketUsers()
        .filter(u => u.session.id !== session.id)
        .forEach(u => sendWebsocketMessage(u.session, 'USER_LEFT', {
          id: session.id,
          username: user.username
        }));
    }

    closeWebsocketSession(session);
  });

  protocol.on('JOIN_REQUEST', request => {
    const user = joinWebsocketUser(session, request.username);
    if (!user) {
      return;
    }

    console.log(`${user.username} joined`);

    sendWebsocketMessage(session, 'JOIN_CONFIRMATION', {
      id: session.id,
      username: user.username,
      users: listWebsocketUsers()
        .map(u => ({
          username: u.username
        }))
    });

    listWebsocketUsers()
      .filter(u => u.session.id !== session.id)
      .forEach(u => sendWebsocketMessage(u.session, 'USER_JOINED', {
        username: user.username
      }));
  });

  protocol.on('CHAT_MESSAGE', message => {
    const user = getWebsocketUser(session);
    if (!user) {
      return;
    }

    console.log(`[${user.username}] ${message.text}`);

    listWebsocketUsers()
      .forEach(u => sendWebsocketMessage(u.session, 'CHAT_MESSAGE', {
        username: user.username,
        text: message.text
      }));
  });

  protocol.on('LEAVE_REQUEST', () => {
    session.socket.close();
  });
}
