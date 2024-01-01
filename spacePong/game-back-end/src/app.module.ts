import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Socket } from 'socket.io';
import { SocketGateway } from './game/socket.gateway';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService,SocketGateway],
})
export class AppModule {}
