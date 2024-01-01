import {ball , Player, arena} from './utils/gameObjects';
import { Vector3} from './utils/math'
import { Socket, Server } from 'socket.io';
import { GameService as Game } from './game.service';
import { Injectable } from '@nestjs/common';
export type playerInfo = {
    playerSocket: any,
    isReady: boolean,
    inGame: boolean
}

export type sideSet = {
    side: string,
    pos: Vector3
}

/**
 * Represents a lobby.
 */
@Injectable()
export class lobbyService{
    public id: string;
    public io: Server;
    public players: Map<playerInfo, Player | null>;
    public ball: ball;
    public arena: arena;
    public game: Game | null;
    public sides: sideSet[];
    public confiramtions: number;

    /**
     * Creates a new lobby instance.
     * @constructor
     * @param {string} id - The id of the lobby.
     * @param {Server} io - The socketIo server instance.
     */

    constructor(id: string, io: any) {
        this.id = id;
        this.io = io;
        this.players = new Map();
        this.ball = new ball();
        this.arena = new arena();
        this.game = null;
        this.players.clear();
        this.sides = [
            { side: 'left', pos: new Vector3((this.arena.width / -2), 0, 0) },
            { side: 'right', pos: new Vector3((this.arena.width / 2), 0, 0) }
        ];
        this.confiramtions = 0;
    }

    /**
     * adds a player to the lobby.
     * @param {Socket} clientToAdd - The socket of the player to add.
     * @throws {Error} Lobby is full.
     */

    public addPlayer(clientToAdd: Socket) {
        if (this.players.size == 2)
            throw new Error('lobby is full');

        this.players.set({ playerSocket: clientToAdd, isReady: false , inGame: false}, null);

        clientToAdd.on('playerReady', (socketID: string) => {
            this.setReady(socketID);
        });

        console.log(`player added to lobby: ${this.id} as ${clientToAdd.id}`); 
    }

    /**
     * sets up the game.
     */
    public setupGame() {
        // loop  over players and set their side
        if (this.game != null)
            return;
        console.log('setting up game');

        let i: number = 0;

        this.ball.mountSocket(this.io, this.id);

        this.players.forEach((player, key) => {
            let newPlayer: Player = new Player(this.sides[i].pos, this.sides[i]);
            newPlayer.mountSocket(key.playerSocket, this.id);
            this.players.set(key, newPlayer);
            key.playerSocket.join(this.id);
            key.inGame = true;
            i++;
        });

        let playerArr: Player[] | any = [...this.players.values()];

        this.game = new Game(playerArr, this.ball, this.arena, this.io, this.id);

        this.io.to(this.id).emit('startGame');
        this.game.start();

    }

    /**
     * sets a player as ready.
     * @param {string} playerSocketIdToSet - The socket id of the player to set.
     */
    public setReady(playerSocketIdToSet: string) {
        console.log(`confirmaion from ${playerSocketIdToSet}`)
        this.players.forEach((value, key) => {
            if (key.playerSocket && key.playerSocket.id == playerSocketIdToSet) {
                key.isReady = true;
                this.confiramtions++;
            }
        });

        // check if all players are ready
        if (this.confiramtions === 2) {
            console.log('confirmed - starting game ')
            this.setupGame();
        }

    }


    public dispose() {
        this.players.forEach((value, key) => {
            if (key.playerSocket) {
                this.io.to(key.playerSocket).emit('ff');
                key.playerSocket.leave(this.id);
                key.playerSocket.offAny();
                key.playerSocket.removeAllListeners();
                key.playerSocket._cleanup();
                key.playerSocket.disconnect(true);
            }
        });
        this.players.clear();
        if (this.game)
            this.game.dispose();
        this.game = null;
        delete this.sides;
        delete this.ball;
        delete this.arena;
    }

    /**
     * removes a player from the lobby.
     * @param {Socket} clientToRemove - The socket of the player to remove.
     */
    public removePlayer(clientToRemove: Socket) {

        console.log(`removing player ${clientToRemove.id} from lobby ${this.id} at ${Date.now()}`);
        if (!this.players)
            return;
        this.players.forEach((value, key) => {
            if (key.playerSocket && key.playerSocket.id == clientToRemove.id) {

                    // remove player from game and finish game
                    if (!this.game){
                        this.io.to(clientToRemove.id).emit('ff');
                        return;
                    }
                    this.game.forfeit(clientToRemove.id);
                    clientToRemove.offAny();
                    this.game.dispose();
                    delete this.game;
                    this.game = null
            }
        });

    }
}
