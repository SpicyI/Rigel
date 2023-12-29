import { WebSocketGateway,
   SubscribeMessage,
    MessageBody,
     ConnectedSocket,
      WebSocketServer,
       OnGatewayConnection,
        OnGatewayDisconnect } from '@nestjs/websockets';
import { lobby } from './game_logic/gameWizzard';
import { Socket } from 'socket.io';
import { Server } from 'socket.io';
import { v4 as uuidv4} from 'uuid'


@WebSocketGateway({ cors: true })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect{
  /**
   * Map of lobbies, key is lobbyId
   */
  private lobbies: Map<string,lobby> = new Map<string, lobby>();
  /**
   * Map of clients waiting to be matched, key is client id
   */
  private queue: Map<string,Socket> = new Map<string, Socket>();

  /**
   * Map of players in lobby, key is client id
   */
  private playersLobby: Map<string,lobby> = new Map<string, lobby>();


  @WebSocketServer()
  private server: Server;


  private removeFromGame(client: Socket) {

    // remove from queue
    if (this.queue.delete(client.id)) {
        console.log(`removing ${client.id} from queue`);
        // cleanup client
        client.offAny();
        client._cleanup();
        client.removeAllListeners();
        // distroy socket
        client.disconnect(true);
    } 
    // remove from lobby
    else {
      if (this.playersLobby.has(client.id)) {
        console.log(`removing ${client.id} from lobby`);
        const lobby = this.playersLobby.get(client.id);
        if (lobby == undefined)
            return;
        lobby.removePlayer(client);
        this.lobbies.delete(lobby.id);
        lobby.dispose();
        this.playersLobby.delete(client.id);

        // cleanup client
        client.offAny();
        client._cleanup();
        client.removeAllListeners();
        // distroy socket
        client.disconnect(true);
      }

    }

  }
 
  handleConnection(client: Socket) {
    console.log('\x1b[32m',`new connection from ${client.id}`,'\x1b[37m');
    this.server.sockets.sockets.forEach((value, key) => {
      console.log('\x1b[33m',`connected clients: ${key}`,'\x1b[37m');
    });
  }

  handleDisconnect(client: Socket) {
    this.removeFromGame(client);
    // list all connected clients
    this.server.sockets.sockets.forEach((value, key) => {
      console.log('\x1b[31m',`connected clients: ${key}`,'\x1b[37m');
    });

    // list all lobbies
    console.log('\x1b[35m',`lobbies: `,'\x1b[37m');
    this.lobbies.forEach((value, key) => {
      console.log('\x1b[35m',`lobby: ${key}`,'\x1b[37m');
    });
    
  }

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
      this.playersLobby.set(client.id, lobby);
      lobby.addPlayer(client);
  }
  else {
      console.log('creating new lobby');
      let newLobby: lobby = new lobby(lobbyId, this.server);
      this.lobbies.set(lobbyId, newLobby);
      this.playersLobby.set(client.id, newLobby);
      newLobby.addPlayer(client);
  }
  }

}