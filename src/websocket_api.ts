import {Request} from 'express';
import expressWs from 'express-ws';
import ws from 'ws';
import {ZodError} from 'zod';
import {PacketHandler, Packets, PacketsDefinition} from './websocket_packets';
import {
  registerSocketUser,
  WebsocketUser,
  unregisterSocketUser,
  broadcastSocketMessageToJoined
} from './websocket_users';

function createPacketHandler(user: WebsocketUser) {
  const packetHandler = new PacketHandler();

  packetHandler.on('JOIN_COMMAND', command => {
    console.log(`${command.username} joined`);
    user.username = command.username;

    broadcastSocketMessageToJoined('USER_JOINED', {
      username: user.username
    });

    user.joined = true;
  });

  packetHandler.on('CHAT_MESSAGE', message => {
    console.log(`[${user.username}] ${message.text}`);

    broadcastSocketMessageToJoined('USER_MESSAGE', {
      username: user.username,
      text: message.text
    });
  });

  packetHandler.on('LEAVE_COMMAND', command => {
    console.log(`${user.username} left: ${command.reason}`);
    user.joined = false;

    broadcastSocketMessageToJoined('USER_LEFT', {
      username: user.username
    });
  });

  return packetHandler;
}

export function mountWebsocketAPI(app: expressWs.Application) {
  app.ws('/ws', async (socket: ws, req: Request) => {
    const user = registerSocketUser(socket);
    const packetHandler = createPacketHandler(user);

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
      unregisterSocketUser(user);
    });
  });
}
