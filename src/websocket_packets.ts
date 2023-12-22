import {z} from 'zod';
import EventEmitter from 'node:events';

const JoinCommand = z.object({
  username: z.string()
});

const ChatMessage = z.object({
  text: z.string()
});

const LeaveCommand = z.object({});

export const Packets = {
  JOIN_COMMAND: JoinCommand,
  CHAT_MESSAGE: ChatMessage,
  LEAVE_COMMAND: LeaveCommand
};

export type PacketsDefinition = {
  [K in keyof typeof Packets]: z.TypeOf<typeof Packets[K]>;
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export interface PacketHandler {
  on<P extends keyof PacketsDefinition>(
    p: P,
    handler: (payload: PacketsDefinition[P]) => void | PromiseLike<void>
  ): this;
  emit<P extends keyof PacketsDefinition>(
    p: P,
    payload: PacketsDefinition[P]
  ): boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class PacketHandler extends EventEmitter {
  private disconnectHandler: (() => void | PromiseLike<void>) | undefined;

  onDisconnect(handler: () => void | PromiseLike<void>) {
    this.disconnectHandler = handler;
  }

  disconnect() {
    if (this.disconnectHandler) {
      this.disconnectHandler();
    }
  }
}
