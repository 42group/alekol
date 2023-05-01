import { WsAdapter } from '@nestjs/platform-ws';
import { getIronSession } from 'iron-session';
import { ConfigService } from '@nestjs/config';
import { INestApplicationContext } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';

export class SessionWsAdapter extends WsAdapter {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    appOrHttpServer?: INestApplicationContext
  ) {
    super(appOrHttpServer);
  }

  bindClientConnect(
    server: WebSocketServer,
    callback: (socket: WebSocket, request: IncomingMessage) => void
  ): void {
    server.on('connection', async (ws, request) => {
      const session = await getIronSession(
        request,
        {} as Response,
        this.configService.getOrThrow('ironSession')
      );

      if (!session.user || !session.user.id) {
        ws.terminate();
        return;
      }

      const user = await this.prisma.user.findUnique({
        where: {
          id: session.user.id,
        },
      });

      if (!user) {
        ws.terminate();
        return;
      }

      ws.user = user;

      return callback(ws, request);
    });
  }
}
