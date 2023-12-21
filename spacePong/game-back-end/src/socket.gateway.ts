import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer } from '@nestjs/websockets';
import { lobby } from './game_logic/gameSetter';
import { Socket } from 'socket.io';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class SocketGateway{
  private lobbies: Map<string,lobby> = new Map<string, lobby>();
  @WebSocketServer()
  private server: Server;


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