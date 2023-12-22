import {Request} from 'express';
import expressWs from 'express-ws';
import ws from 'ws';
import {ZodError} from 'zod';
import {PacketHandler, Packets, PacketsDefinition} from './websocket_packets';
import {
  broadcastSocketMessage,
  listSocketUsers,
  registerSocketUser,
  sendSocketMessage,
  unregisterSocketUser
} from './websocket_users';

function createPacketHandler(socket: ws) {
  const user = registerSocketUser(socket);
  const packetHandler = new PacketHandler();

  packetHandler.onDisconnect(() => {
    console.log(`${user.username} left`);

    unregisterSocketUser(user);

    broadcastSocketMessage(
      () => true,
      'USER_LEFT',
      {
        id: user.id,
        username: user.username
      }
    );
  });

  packetHandler.on('JOIN_COMMAND', command => {
    console.log(`${command.username} joined`);
    user.username = command.username;
    user.joined = true;

    sendSocketMessage(user, 'JOIN_CONFIRMATION', {
      id: user.id,
      username: user.username,
      users: listSocketUsers()
        .filter(u => u.joined)
        .map(u => ({
          id: u.id,
          username: u.username
        }))
    });

    broadcastSocketMessage(
      u => u.joined && u.id !== user.id,
      'USER_JOINED',
      {
        id: user.id,
        username: user.username
      }
    );
  });

  packetHandler.on('CHAT_MESSAGE', message => {
    console.log(`[${user.username}] ${message.text}`);

    broadcastSocketMessage(
      u => u.joined,
      'USER_MESSAGE',
      {
        id: user.id,
        username: user.username,
        text: message.text
      }
    );
  });

  packetHandler.on('LEAVE_COMMAND', () => {
    user.socket.close();
  });

  return packetHandler;
}

export function mountWebsocketAPI(app: expressWs.Application) {
  app.ws('/ws', async (socket: ws, req: Request) => {
    const packetHandler = createPacketHandler(socket);

    socket.on('message', (data: ws.RawData) => {
      try {
        const packet = JSON.parse(data.toString());
        if (Object.hasOwn(Packets, packet.type)) {
          const payload = Packets[packet.type as keyof PacketsDefinition].parse(packet.data);
          packetHandler.emit(packet.type, payload);
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
      packetHandler.disconnect();
    });
  });
}
