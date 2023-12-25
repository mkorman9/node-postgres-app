import {Request} from 'express';
import ws from 'ws';
import {ZodError} from 'zod';
import {Packets, PacketsType, WebsocketProtocol} from './websocket_protocol';
import {
  generateWebsocketId,
  websocketSession,
  startWebsocketSession,
  websocketSessions,
  stopWebsocketSession,
  sendWebsocketMessage
} from './websocket_sessions';

export default function websocketAPI(socket: ws, req: Request) {
  const id = generateWebsocketId();
  const protocol = new WebsocketProtocol();

  socket.on('message', (data: ws.RawData) => {
    try {
      const packet = JSON.parse(data.toString());
      if (Object.hasOwn(Packets, packet.type)) {
        const payload = Packets[packet.type as keyof PacketsType].parse(packet.data);
        protocol.emit(packet.type, payload);
      }
    } catch (e) {
      if (e instanceof SyntaxError) {
        // ignore message
        return;
      } else if (e instanceof ZodError) {
        sendWebsocketMessage(socket, 'PACKET_VALIDATION_ERROR', {
          errors: e.errors
        });
        return;
      }

      throw e;
    }
  });

  socket.on('close', () => {
    const session = websocketSession(id);
    if (session) {
      console.log(`${session.username} left`);

      websocketSessions()
        .filter(s => s.id !== id)
        .forEach(s => sendWebsocketMessage(s.socket, 'USER_LEFT', {
          username: session.username
        }));
    }

    stopWebsocketSession(id);
  });

  protocol.on('JOIN_REQUEST', request => {
    const session = startWebsocketSession(id, socket, request.username);
    if (!session) {
      return;
    }

    console.log(`${session.username} joined`);

    sendWebsocketMessage(socket, 'JOIN_CONFIRMATION', {
      username: session.username,
      users: websocketSessions()
        .map(s => ({
          username: s.username
        }))
    });

    websocketSessions()
      .filter(s => s.id !== id)
      .forEach(s => sendWebsocketMessage(s.socket, 'USER_JOINED', {
        username: session.username
      }));
  });

  protocol.on('CHAT_MESSAGE', message => {
    const session = websocketSession(id);
    if (!session) {
      return;
    }

    console.log(`[${session.username}] ${message.text}`);

    websocketSessions()
      .forEach(s => sendWebsocketMessage(s.socket, 'CHAT_MESSAGE', {
        username: session.username,
        text: message.text
      }));
  });

  protocol.on('LEAVE_REQUEST', () => {
    socket.close();
  });
}
