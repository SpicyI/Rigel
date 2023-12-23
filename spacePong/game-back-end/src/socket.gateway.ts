import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer } from '@nestjs/websockets';
import { lobby } from './game_logic/gameSetter';
import { Socket } from 'socket.io';
import { Server } from 'socket.io';
import { subscribe } from 'diagnostics_channel';
import {v4 as uuidv4} from 'uuid'


@WebSocketGateway({ cors: true })
export class SocketGateway{
  private lobbies: Map<string,lobby> = new Map<string, lobby>();
  private queue: Map<string,Socket> = new Map<string, Socket>();
  @WebSocketServer()
  private server: Server;


  @SubscribeMessage('queueUp')
  public handleQueueUp(@ConnectedSocket() client: Socket): void {
    console.log(`${client.id} is queueing up`);
    this.queue.set(client.id, client);

    if (this.queue.size >= 2) {
        console.log(`queue is full with ${this.queue.size} players`);
        let gameId: string = uuidv4();
        console.log(`creating new game with id ${gameId}`);
        this.queue.forEach((client, id) => {
            client.emit('gameId', gameId);
            this.queue.delete(id);
        });
    }
    
  }

  @SubscribeMessage('joinLobby')
  public handleJoin(@MessageBody() lobbyId: string, @ConnectedSocket() client: Socket): void {
    if (this.lobbies.has(lobbyId)) {
      console.log(`${client.id} is joining existing lobby: ${lobbyId}`);
      const lobby = this.lobbies.get(lobbyId);
      if (lobby == undefined)
          return;
      lobby.addPlayer(client);
  }
  else {
      console.log('creating new lobby');
      let newLobby: lobby = new lobby(lobbyId, this.server);
      this.lobbies.set(lobbyId, newLobby);
      newLobby.addPlayer(client);
  }
  }

}