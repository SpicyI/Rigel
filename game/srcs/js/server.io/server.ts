import { Server as SocketIOServer } from 'socket.io';
const http = require('http');

// Create an HTTP server
const server = http.createServer();

// Initialize socket.io server with options
const options = {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
};

const io: SocketIOServer = new SocketIOServer(server, options)


const winScore: number = 5;

/**
 * A utility class for generating random numbers and directions.
 * @class
 
 */
class customRand {

    /**
     * Generates a random integer between the specified range.
     * @param {number} low - The lower bound of the range (inclusive).
     * @param {number} high - The upper bound of the range (inclusive).
     * @returns {number} The random integer.
     */
    static randInt(low: number = 0, high: number = 1000): number {
        return low + Math.floor(Math.random() * (high - low + 1));
    }

    /**
     * Generates a random floating-point number between the specified range.
     * @param {number} low - The lower bound of the range.
     * @param {number} high - The upper bound of the range.
     * @returns {number} The random floating-point number.
     */
    static randFloat(low: number, high: number): number {
        return low + Math.random() * (high - low);
    }

    /**
     * Generates a random direction vector within the specified range of angles.
     * @param {number} min - The minimum angle in radians.
     * @param {number} max - The maximum angle in radians.
     * @returns {number[]} The random direction vector as an array [x, y, z].
     */
    static randomDirection(min: number, max: number): number[] {
        let x: number = Math.cos(customRand.randFloat(min, max));
        let y: number = 0;
        let z: number = Math.sin(customRand.randFloat(min, max));
        return [x, y, z];
    }

    /**
     * Converts degrees to radians.
     * @param {number} deg - The angle in degrees.
     * @returns {number} The angle in radians.
     */
    static degToRad(deg: number): number {
        return deg * Math.PI / 180;
    }

    /**
     * Converts radians to degrees.
     * @param {number} rad - The angle in radians.
     * @returns {number} The angle in degrees.
     */
    static radToDeg(rad: number): number {
        return rad * 180 / Math.PI;
    }
}

/**
 * Represents a 3D vector.
 * @class
 */
class Vector3 {
    public x: number;
    public y: number;
    public z: number;

    /**
     * Creates a new Vector3 instance.
     * @constructor
     * @param {number} [x=0] - The x-coordinate of the vector.
     * @param {number} [y=0] - The y-coordinate of the vector.
     * @param {number} [z=0] - The z-coordinate of the vector.
     */
    constructor(x: number = 0, y: number = 0, z: number = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
     * Creates a new Vector3 instance with the same coordinates as the current vector.
     * @returns {Vector3} A new Vector3 instance.
     */
    public clone(): Vector3 {
        return new Vector3(this.x, this.y, this.z);
    }

    /**
     * Normalizes the vector, making its length equal to 1.
     * @returns {Vector3} The current vector.
     */
    public normalize(): Vector3 {
        let length: number = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z) || 1;
        this.x /= length;
        this.y /= length;
        this.z /= length;
        return this;
    }

    /**
     * Multiplies the vector by a scalar value.
     * @param {number} scalar - The scalar value to multiply the vector by.
     * @returns {Vector3} The current vector.
     */
    public multiplyScalar(scalar: number): Vector3 {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
        return this;
    }

    /**
     * Adds another vector to the current vector.
     * @param {Vector3} vec - The vector to add.
     * @returns {Vector3} The current vector.
     */
    public add(vec: Vector3): Vector3 {
        this.x += vec.x;
        this.y += vec.y;
        this.z += vec.z;
        return this;
    }

    /**
     * Copies the coordinates of another vector to the current vector.
     * @param {Vector3} vec - The vector to copy from.
     * @returns {Vector3} The current vector.
     */
    public copy(vec: Vector3): Vector3 {
        this.x = vec.x;
        this.y = vec.y;
        this.z = vec.z;
        return this;
    }

    /**
     * Sets the coordinates of the vector.
     * @param {number} [x=0] - The x-coordinate of the vector.
     * @param {number} [y=0] - The y-coordinate of the vector.
     * @param {number} [z=0] - The z-coordinate of the vector.
     */
    public set(x: number = 0, y: number = 0, z: number = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
     * Performs a quaternion rotation on the current vector.
     * @param {Quaternion} quaternion - The quaternion to rotate by.
     * @returns {Vector3} The current vector.
     */
    public applyQuaternion(quaternion: Quaternion): Vector3 {

        let qVec = quaternion.getVec();
        let temp = qVec.cross(this).multiplyScalar(2);
        let temp2 = qVec.cross(temp);

        this.add(temp.multiplyScalar(quaternion.getScalar()));
        this.add(temp2);

        return this;
    }
    /**
     * performs a cross product on the current vector and another vector.
     * @param {Vector3} vec the vector to perform the cross product with.
     * @returns {Vector3} the result of the cross product.
     */
    public cross(vec: Vector3): Vector3 {
        const x = vec.y * this.z - vec.z * this.y;
        const y = vec.z * this.x - vec.x * this.z;
        const z = vec.x * this.y - vec.y * this.x;
        return new Vector3(x, y, z);
    }
}


/**
 * Represents a quaternion.
 * @class
 */
class Quaternion {

    public vec: Vector3;
    public scalar: number;

    /**
     * Creates a new Quaternion instance.
     * @constructor
     * @param {number} [x=0] - The x-coordinate of the vector.
     * @param {number} [y=0] - The y-coordinate of the vector.
     * @param {number} [z=0] - The z-coordinate of the vector.
     * @param {number} [scalar=1] - The scalar value of the quaternion.
     */
    constructor(x: number = 0, y: number = 0, z: number = 0, scalar: number = 1) {
        this.vec = new Vector3(x, y, z);
        this.scalar = scalar;
    }

    /**
     * Sets the quaternion to the specified axis and angle.
     * @param {Vector3} axis - The axis of rotation.
     * @param {number} angle - The angle of rotation in radians.
     * @returns {Quaternion} The current quaternion.
     */
    public set(axis: Vector3, angle: number): Quaternion {
        let halfAngle = angle / 2;
        let s = Math.sin(halfAngle);

        this.vec.copy(axis).normalize().multiplyScalar(s);
        this.scalar = Math.cos(halfAngle);
        return this;
    }

    /**
     * Gets the vector part of the quaternion.
     * @returns {Vector3} The vector part of the quaternion.
     */
    public getVec(): Vector3 {
        return this.vec.clone();
    }


    /**
     * Gets the scalar part of the quaternion.
     * @returns {number} The scalar part of the quaternion.
     */
    public getScalar(): number {
        return this.scalar;
    }


}

/**
 * Represents a ball.
 * @class
 */
class ball {
    public position: Vector3;
    public speed: number;
    public radius: number;
    public direction: Vector3;
    public quaternion: Quaternion;
    public socket: any;
    public lobby: string;

    /** 
     * Creates a new ball instance.
     * @constructor
     * @param {Vector3} [position=new Vector3(0, 3, 0)] - The position of the ball.
     * @param {number} [speed=50] - The speed of the ball.
     * @param {number} [radius=2] - The radius of the ball.
     * */
    constructor(position: Vector3 = new Vector3(0, 3, 0), speed: number = 50, radius: number = 2) {
        this.position = position;
        this.speed = speed;
        this.radius = radius;
        this.direction = new Vector3(0, 0, 0);
        this.quaternion = new Quaternion();
        this.quaternion.set(new Vector3(0, 1, 0), customRand.degToRad(10));
    }

    /**
    * mount the socket to the ball and set the lobby name.
    * @param {any} socket - The socket to mount.
    * @param {string} lobby - The lobby name.
    */
    public mountSocket(socket: any, lobby: string): void {
        this.socket = socket;
        this.lobby = lobby;
    }

    /**
     * emmit the ball position to the all user in the lobby.
    */
    emitPOS(): void {
        if (this.socket === undefined)
            return;
        this.socket.to(this.lobby).emit('ballMove', { position: this.position });
    }

    /**
     * sets the ball speed.
     * @param {number} speed - The speed to set.
    */
    public setSpeed(speed: number) {
        this.speed = speed;
    }

    /**
     * increases the ball speed by 5 each time till it reaches 110.
     */
    public increseSpeed() {
        if (this.speed < 110)
            this.speed += 5;
    }

    /**
     * resets the ball position to 0,3,0 and speed to 50.
     */
    public reset() {
        this.position.set(0, 3, 0);
        this.speed = 50;
    }

    /**
     * sets the ball direction.
     * @param {Vector3} direction - The direction to set.
     */
    public setDirection(direction: Vector3) {
        this.direction.copy(direction);
    }

    /**
     * rotates the ball direction by quaternion.
     */
    public slide() {
        this.direction.applyQuaternion(this.quaternion);
    }


}

/**
 * Represents a player and a paddle in the game.
 * @class
 */
class Player {

    public position: Vector3;
    public side: string;
    public length: number;
    public width: number;
    public speed: number;
    public Score: number;
    public socket: any;
    public lobby: string;

    /**
     * Creates a new Player instance.
     * @constructor
     * @param {Vector3} [position=new Vector3(0, 0, 0)] - The position of the player.
     * @param {object} set - The settings of the player.
     * @param {string} set.side - The side of the player.
     * @param {number} set.length - The length of the player.
     * @param {number} set.width - The width of the player.
     * @param {number} set.speed - The speed of the player.
     */

    constructor(position: Vector3 = new Vector3(0, 0, 0), set: any = {}) {

        this.position = position;

        this.side = set.side || 'left';
        this.length = set.length || 12;
        this.width = set.width || 1.5;
        this.speed = set.speed || 2;

        this.Score = 0;
    }

    /**
     * mount the socket to the player and set the lobby name.
     * @param {any} socket - The socket to mount.
     * @param {string} lobby - The lobby name.
     */

    public mountSocket(socket: any, lobby: string): void {
        this.socket = socket;
        this.lobby = lobby;
    }

    /**
     *  listens to the player socket for position updates.
     *  @event playerMove 
     */

    public updateMoves() {
        if (this.socket === undefined)
            return;

        this.socket.on('playerMove', (data: any) => {
            // console.log("recived data:", data, "END OF TRANSFER");
            this.position.copy(data.position);
        });
    }

    /**
     * emmit the player position to the oppenent in the lobby.
     */

    public emitPOS() {
        if (this.socket === undefined)
            return;
        // console.log(`emiting data to ${this.lobby} with ${this.socket.id}:`, this.position, "END OF TRANSFER");
        this.socket.to(this.lobby).emit('playerMove', { position: this.position });
    }

    /**
     * emmit the innitial player position to the player.
     */
    public echoPos() {
        if (this.socket === undefined)
            return;
        this.socket.emit('initPlayer', this.position);
    }

    /**
     * checks if the ball collides with the player.
     * @param {ball} ball - The ball to check collision with.
     * @returns {boolean} true if the ball collides with the player.
     */
    public checkCollision(ball: ball): boolean {

        let botCorner = {
            x: this.position.x - this.width,
            z: this.position.z - this.length
        }

        let topCorner = {
            x: this.position.x + this.width,
            z: this.position.z + this.length
        }

        if (ball.position.x > botCorner.x && ball.position.x < topCorner.x
            && ball.position.z > botCorner.z && ball.position.z < topCorner.z)
            return true;
        return false;
    }

    /**
     * adds a score to the player.
     * @returns {boolean} true if the player wins.
     */
    public addScore(): boolean {
        this.Score++;
        if (this.Score == winScore)
            return true;
        return false;
    }
    /**
     * resets the player position to the middle of the arena.
     * @param {arena} arena - The arena to reset the player in.
     */
    public reset(arena: arena) {
        if (this.side == 'left')
            this.position.set(arena.width / -2, 0, 0);
        else if (this.side == 'right')
            this.position.set(arena.width / 2, 0, 0);
    }

}

/**
 * Represents the arena.
 * @class
 */
class arena {
    public hieght: number;
    public width: number;

    /**
     * Creates a new arena instance.
     * @constructor
     * @param {number} [hieght=150] - The hieght of the arena.
     * @param {number} [width=200] - The width of the arena.
     */

    constructor(hieght: number = 150, width: number = 200) {
        this.hieght = hieght;
        this.width = width;
    }

    /**
     * checks if the ball collides with the arena.
     * @param {ball} ball - The ball to check collision with.
     * @returns {string} 'bounce' if the ball collides with the arena hieght, 'goal' if the ball collides with the arena width, 'none' if no collision detected.
     */
    public checkCollision(ball: ball): string {
        if (ball.position.z > this.hieght / 2 || ball.position.z < - this.hieght / 2)
            return 'bounce';
        else if (ball.position.x > this.width / 2 || ball.position.x < - this.width / 2)
            return 'goal';
        return 'none';
    }
}

/**
 * Represents a game.
 * @class
 */

class Game {

    public playerL: Player;
    public playerR: Player;
    public ball: ball;
    public arena: arena;
    public interval: any;

    /**
     * Creates a new Game instance.
     * @constructor
     * @param {Player[]} players - The players in the game.
     * @param {ball} ball - The ball in the game.
     * @param {arena} arena - The arena in the game.
     * @throws {Error} Invalid number of players.
     */

    constructor(players: Player[], ball: ball, arena: arena) {

        if (players.length != 2)
            throw new Error('invalid number of players');

        this.playerL = players[0]; // left player
        this.playerR = players[1]; // right player
        this.ball = ball;
        this.arena = arena;

        this.interval = null;
    }

    /**
     * handles a score in the game and resets the ball and the players.
     * if a player wins the game is finished.
     */

    public Score() {
        let isWinner: boolean = this.ball.position.x > 0 ? this.playerL.addScore() : this.playerR.addScore();
        if (isWinner) {
            this.finish();
        }

        this.playerL.reset(this.arena);
        this.playerR.reset(this.arena);
        this.ball.reset();
        this.ball.setDirection(new Vector3(this.ball.position.x > 0 ? 1 : -1, 0, 0).normalize());
    }

    /**
     * checks if the ball collides with a player and handles the collision.
     */
    public checkplayersCollision() {
        if (this.playerL.checkCollision(this.ball)) {

            if (this.ball.position.z > this.playerL.position.z) {
                this.ball.direction.x *= -1;
                this.ball.slide();
            }
            else if (this.ball.position.z < this.playerL.position.z) {
                this.ball.slide();
                this.ball.direction.x *= -1;
            }
            else {
                this.ball.direction.x *= -1;
            }
            this.ball.increseSpeed();
        }
        else if (this.playerR.checkCollision(this.ball)) {

            if (this.ball.position.z > this.playerR.position.z) {
                this.ball.slide();
                this.ball.direction.x *= -1;
            }
            else if (this.ball.position.z < this.playerR.position.z) {
                this.ball.direction.x *= -1;
                this.ball.slide();
            }
            else {
                this.ball.direction.x *= -1;
            }
            this.ball.increseSpeed();
        }
    }

    /**
     * checks if the ball collides with the arena or a player and handles the collision.
     * in case of a goal the score is handled.
     */
    public checkCollision() {
        let arenaCollision = this.arena.checkCollision(this.ball);
        switch (arenaCollision) {
            case 'bounce':
                this.ball.direction.z *= -1;
                break;
            case 'goal':
                this.Score();
                break;
            default:
                this.checkplayersCollision();
                break;
        }

    }

    /**
     * starts the game loop.
     */

    public start() {
        this.ball.setDirection(new Vector3(customRand.randInt() % 2 ? 1 : -1, 0, 0).normalize());

        this.playerL.echoPos();
        this.playerR.echoPos();

        this.playerL.emitPOS();
        this.playerR.emitPOS();

        this.playerL.updateMoves();
        this.playerR.updateMoves();

        this.ball.emitPOS();

        this.gameLoop();
    }

    /**
     * the game loop.
     */
    gameLoop() {
        let lastTime: number = Date.now();

        this.interval = setInterval(() => {
            const currentTime: number = Date.now();
            const deltaTime: number = (currentTime - lastTime) / 1000; // Convert to seconds

            // wait 5 sec before start

            this.playerR.emitPOS();
            this.playerL.emitPOS();
            this.ball.emitPOS();
            this.checkCollision();
            this.ball.position.add(this.ball.direction.clone().multiplyScalar(this.ball.speed * deltaTime));
            // this.ball.emitPOS();

            lastTime = currentTime;
        }, 1000 / 120);

    }
    /**
    * finishes the game.
    */
    finish() {
        console.log('game finished');
    }


}

type playerInfo = {
    playerSocket: any,
    isReady: boolean
}

/**
 * Represents a lobby.
 */
class lobby {
    public id: string;
    public io: any;
    public players: Map<playerInfo, Player | null>;
    public ball: ball;
    public arena: arena;
    public game: Game | null;
    public sides: any[];
    public confiramtions: number;

    /**
     * Creates a new lobby instance.
     * @constructor
     * @param {string} id - The id of the lobby.
     * @param {any} io - The socket io instance.
     */

    constructor(id: string, io: any) {
        this.id = id;
        this.io = io;
        this.players = new Map();
        this.ball = new ball();
        this.arena = new arena();
        this.game = null;
        this.sides = [
            { side: 'left', pos: new Vector3((this.arena.width / -2), 0, 0) },
            { side: 'right', pos: new Vector3((this.arena.width / 2), 0, 0) }
        ];
        this.confiramtions = 0;
    }

    /**
     * adds a player to the lobby.
     * @param {any} AddedplayerSocket - The socket of the player to add.
     * @throws {Error} Lobby is full.
     */

    public addPlayer(AddedplayerSocket: any) {
        if (this.players.size == 2)
            throw new Error('lobby is full');

        this.players.set({ playerSocket: AddedplayerSocket, isReady: false }, null);

        AddedplayerSocket.on('playerReady', (socketID: string) => {
            this.setReady(socketID);
        });

        console.log(`player added to lobby: ${this.id} as ${AddedplayerSocket.id}`);
        if (this.players.size == 2)
            this.setupGame();
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
            i++;
        });

        let playerArr: Player[] | any = [...this.players.values()];

        this.game = new Game(playerArr, this.ball, this.arena);

        this.io.to(this.id).emit('startGame');
        this.game.start();

    }

    /**
     * sets a player as ready.
     * @param {string} playerSocketIdToSet - The socket id of the player to set.
     */
    public setReady(playerSocketIdToSet: string) {
        console.log(`consfirmaion from ${playerSocketIdToSet}`)
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
}

/**
 * Represents a lobby manager.
 * @class
 */
class lobbyManager {

    public io: any;
    public lobbies: Map<string, lobby>;
    /**
     * Creates a new lobbyManager instance.
     * @constructor
     * @param {any} io - The socket io instance.
     */
    constructor(io: any) {
        this.io = io;
        this.lobbies = new Map();
    }

    /** 
     * map the player socket to the lobby. if the lobby doesn't exist create a new one.
     * @param {any} socket - The socket of the player to add.
     * @param {string} lobbyID - The id of the lobby to join.
    */
    public joinLobby(socket: any, lobbyID: string) {

        if (this.lobbies.has(lobbyID)) {
            console.log(`${socket.id} is joining existing lobby: ${lobbyID}`);
            const lobby = this.lobbies.get(lobbyID);
            if (lobby == undefined)
                return;
            lobby.addPlayer(socket);
        }
        else {
            console.log('creating new lobby');
            let newLobby: lobby = new lobby(lobbyID, this.io);
            this.lobbies.set(lobbyID, newLobby);
            newLobby.addPlayer(socket);
        }
    }
}

let manager: lobbyManager = new lobbyManager(io);

// class handler{
//     public sockets: any[];
//     public io: any;
//     public room: string;

//     constructor(io: any, room: string = "6969"){
//         this.sockets = [];
//         this.io = io;
//         this.room = room;
//     }

//     public listen(socket: any){
//         socket.on("msg", (message: string)=>{
//             console.log(`message recived from ${socket.id}:`, message, "END OF INFO");
//             socket.to(this.room).emit("msg", message);
//         });
//     }

//     public addclient(socket: any){
//         this.sockets.push(socket);
//         this.listen(socket);
//     }

//     public notifyAll(){
//         this.io.to(this.room).emit("start");
//     }
// }

// let h: handler = new handler(io);
// io.on('connection', (socket: any) => {

//     socket.on('join', () => {
//         h.addclient(socket);
//     });
// });



// let l;
io.on('connection', (socket: any) => {
    
    console.log(`connected with id: ${socket.id}`);
    socket.on('joinLobby', (lobbyID: string) => {
            manager.joinLobby(socket, lobbyID);
        });
        // !!!!!!!!!!!! Testing !!!!!!!!!!!!!
        // socket.on('joinLobby', (lobbyID) => {
            //     l = lobbyID;
            //     socket.join(lobbyID);
            // });
        
        
            // socket.on("update", (messsage)=>{
                //     console.log(`message recived from ${socket.id}:`, messsage, "END OF INFO");
                //     socket.to(l).emit("update", messsage);
                // });
                // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
});
                
                
                
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});