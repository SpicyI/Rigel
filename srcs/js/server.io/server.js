const socketIO = require('socket.io')(3000, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }

});


const winScore = 5;

/**
 * A utility class for generating random numbers and directions.
 */
class customRand {

    /**
     * Generates a random integer between the specified range.
     * @param {number} low - The lower bound of the range (inclusive).
     * @param {number} high - The upper bound of the range (inclusive).
     * @returns {number} The random integer.
     */
    static randInt(low = 0, high = 1000) {
        return low + Math.floor(Math.random() * (high - low + 1));
    }

    /**
     * Generates a random floating-point number between the specified range.
     * @param {number} low - The lower bound of the range.
     * @param {number} high - The upper bound of the range.
     * @returns {number} The random floating-point number.
     */
    static randFloat(low, high) {
        return low + Math.random() * (high - low);
    }

    /**
     * Generates a random direction vector within the specified range of angles.
     * @param {number} min - The minimum angle in radians.
     * @param {number} max - The maximum angle in radians.
     * @returns {number[]} The random direction vector as an array [x, y, z].
     */
    static randomDirection(min, max) {
        let x = Math.cos(customRand.randFloat(min, max));
        let y = 0;
        let z = Math.sin(customRand.randFloat(min, max));
        return [x, y, z];
    }

    /**
     * Converts degrees to radians.
     * @param {number} deg - The angle in degrees.
     * @returns {number} The angle in radians.
     */
    static degToRad(deg) {
        return deg * Math.PI / 180;
    }

    /**
     * Converts radians to degrees.
     * @param {number} rad - The angle in radians.
     * @returns {number} The angle in degrees.
     */
    static radToDeg(rad) {
        return rad * 180 / Math.PI;
    }
}

/**
 * Represents a 3D vector.
 * @class
 */
class Vector3 {
    /**
     * Creates a new Vector3 instance.
     * @constructor
     * @param {number} [x=0] - The x-coordinate of the vector.
     * @param {number} [y=0] - The y-coordinate of the vector.
     * @param {number} [z=0] - The z-coordinate of the vector.
     */
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
     * Creates a new Vector3 instance with the same coordinates as the current vector.
     * @returns {Vector3} A new Vector3 instance.
     */
    clone() {
        return new Vector3(this.x, this.y, this.z);
    }

    /**
     * Normalizes the vector, making its length equal to 1.
     * @returns {Vector3} The current vector.
     */
    normalize() {
        let length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z) || 1;
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
    multiplyScalar(scalar) {
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
    add(vec) {
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
    copy(vec) {
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
    set(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    applyQuaternion(quaternion) {

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
    cross(vec) {
        const x = vec.y * this.z - vec.z * this.y;
        const y = vec.z * this.x - vec.x * this.z;
        const z = vec.x * this.y - vec.y * this.x;
        return new Vector3(x, y, z);
    }
}

class Quaternion {
    constructor(x = 0, y = 0, z = 0, scalar = 1) {
        this.vec = new Vector3(x, y, z);
        this.scalar = scalar;
    }

    set(axis, angle) {
        let halfAngle = angle / 2;
        let s = Math.sin(halfAngle);

        this.vec.copy(axis).normalize().multiplyScalar(s);
        this.scalar = Math.cos(halfAngle);
    }

    getVec() {
        return this.vec.clone();
    }

    getScalar() {
        return this.scalar;
    }


}

class ball {
    constructor(position = new Vector3(0, 3, 0), speed = 50, radius = 2) {
        this.position = position;
        this.speed = speed;
        this.radius = radius;
        this.direction = new Vector3(0, 0, 0);
        this.quaternion = new Quaternion();
        this.quaternion.set(new Vector3(0, 1, 0), customRand.degToRad(10));
    }

    mountSocket(socket, lobby) {
        this.socket = socket;
        this.lobby = lobby;
    }

    emitPOS() {
        if (this.socket === undefined)
            return;
        this.socket.to(this.lobby).emit('ballMove', { position: this.position });
    }

    setSpeed(speed) {
        this.speed = speed;
    }

    increseSpeed() {

        if (this.speed < 110)
            this.speed += 5;
    }

    reset() {
        this.position.set(0, 3, 0);
        this.speed = 50;
    }

    setDirection(direction) {
        console.log("setting direction");
        console.log(direction);
        this.direction.copy(direction);
    }

    slide() {
        this.direction.applyQuaternion(this.quaternion);
    }


}

class Player {
    constructor(position = new Vector3(0, 0, 0), set) {

        this.position = position;

        this.side = set.side || 'left';
        this.length = set.length || 12;
        this.width = set.width || 1.5;
        this.speed = set.speed || 2;

        this.Score = 0;
    }

    mountSocket(socket, lobby) {
        this.socket = socket;
        this.lobby = lobby;
    }

    updateMoves() {
        if (this.socket === undefined)
            return;
        this.socket.on('playerMove', (data) => {
            // console.log("recived data:", data, "END OF TRANSFER");
            this.position.copy(data.position);
        });
    }

    emitPOS() {
        if (this.socket === undefined)
            return;
        // console.log(`emiting data to ${this.lobby} with ${this.socket.id}:`, this.position, "END OF TRANSFER");
        this.socket.to(this.lobby).emit('playerMove', { position: this.position });
    }

    echoPos() {
        if (this.socket === undefined)
            return;
        this.socket.emit('initPlayer', this.position);
    }

    checkCollision(ball) {

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

    addScore() {
        this.Score++;
        if (this.Score == winScore)
            return true;
        return false;
    }

    reset(arena) {
        if (this.side === 'left')
            this.position.set(arena.width / -2, 0, 0);
        else if (this.side === 'right')
            this.position.set(arena.width / 2, 0, 0);
    }

}


class arena {
    constructor(hieght = 150, width = 200) {
        this.hieght = hieght;
        this.width = width;
    }

    checkCollision(ball) {
        if (ball.position.z > this.hieght / 2 || ball.position.z < - this.hieght / 2)
            return 'bounce';
        else if (ball.position.x > this.width / 2 || ball.position.x < - this.width / 2)
            return 'goal';
        return 'none';
    }
}

class Game {
    constructor(players, ball, arena) {

        if (players.length !== 2)
            throw new Error('invalid number of players');

        this.playerL = players[0]; // left player
        this.playerR = players[1]; // right player
        this.ball = ball;
        this.arena = arena;



        this.interval = null;
    }

    Score() {
        let isWinner = this.ball.position.x > 0 ? this.playerL.addScore() : this.playerR.addScore();
        if (isWinner) {
            this.finish();
        }

        this.ball.setDirection(new Vector3(this.ball.position.x > 0 ? 1 : -1, 0, 0).normalize());
        this.playerL.reset(this.arena);
        this.playerR.reset(this.arena);
        this.ball.reset();
    }

    checkplayersCollision() {
        if (this.playerL.checkCollision(this.ball)) {

            if (this.ball.position.z > this.playerL.position.z){
                this.ball.direction.x *= -1;
                this.ball.slide();
            }
            else if (this.ball.position.z < this.playerL.position.z){
                this.ball.slide();
                this.ball.direction.x *= -1;
            }
            else{
                this.ball.direction.x *= -1;
            }
            this.ball.increseSpeed();
        }
        else if (this.playerR.checkCollision(this.ball)){

            if (this.ball.position.z > this.playerR.position.z){
                this.ball.slide();
                this.ball.direction.x *= -1;
            }
            else if (this.ball.position.z < this.playerR.position.z){
                this.ball.direction.x *= -1;
                this.ball.slide();
            }
            else{
                this.ball.direction.x *= -1;
            }
            this.ball.increseSpeed();
        }
    }

    checkCollision() {
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

    start() {
        this.ball.setDirection(new Vector3(customRand.randInt() % 2 ? 1 : -1, 0 , 0).normalize());

        this.playerL.echoPos();
        this.playerR.echoPos();

        this.playerL.emitPOS();
        this.playerR.emitPOS();

        this.playerL.updateMoves();
        this.playerR.updateMoves();

        this.ball.emitPOS();

        this.gameLoop();
    }

    gameLoop() {
        let lastTime = Date.now();

        this.interval = setInterval(() => {
            const currentTime = Date.now();
            const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds

            // wait 5 sec before start

            this.playerR.emitPOS();
            this.playerL.emitPOS();
            this.ball.emitPOS();
            this.checkCollision();
            this.ball.position.add(this.ball.direction.clone().multiplyScalar(this.ball.speed * deltaTime));
            // this.ball.emitPOS();

            lastTime = currentTime;
        }, 1000 / 120);

        // // this.checkCollision();
    }

    finish() {
        console.log('game finished');
    }


}

class lobby {
    constructor(id, io) {
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

    addPlayer(AddedplayerSocket) {
        if (this.players.size === 2)
            throw new Error('lobby is full');
        this.players.set({ playerSocket: AddedplayerSocket, isReady: false }, null);
        AddedplayerSocket.on('playerReady', (socketID) => {
            this.setReady(socketID);
        });
        console.log(`player added to lobby: ${this.id} as ${AddedplayerSocket.id}`);
        if (this.players.size === 2)
            this.setupGame();
    }


    setupGame() {
        // loop  over players and set their side
        if (this.game !== null)
            return;
        console.log('setting up game');
        this.ball.mountSocket(this.io, this.id);
        let i = 0;
        this.players.forEach((player, key) => {
            let newPlayer = new Player(this.sides[i].pos, this.sides[i]);
            console.log
            newPlayer.mountSocket(key.playerSocket, this.id);
            this.players.set(key, newPlayer);
            key.playerSocket.join(this.id);
            i++;
        });

        this.game = new Game([...this.players.values()], this.ball, this.arena);
        this.io.to(this.id).emit('startGame');
        this.game.start();

    }

    setReady(playerSocketIdToSet) {
        console.log(`consfirmaion from ${playerSocketIdToSet}`)
        this.players.forEach((value, key) => {
            if (key.playerSocket && key.playerSocket.id === playerSocketIdToSet) {
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

class lobbyManager {

    constructor(io) {
        this.io = io;
        this.lobbies = new Map();
    }

    joinLobby(socket, lobbyID) {
        if (this.lobbies.has(lobbyID)) {
            console.log(`${socket.id} is joining existing lobby: ${lobbyID}`);
            this.lobbies.get(lobbyID).addPlayer(socket);
        }
        else {
            console.log('creating new lobby');
            let newLobby = new lobby(lobbyID, this.io);
            this.lobbies.set(lobbyID, newLobby);
            newLobby.addPlayer(socket);
        }
    }
}

let manager = new lobbyManager(socketIO);

let l;
socketIO.on('connection', (socket) => {

    console.log(`connected with id: ${socket.id}`);
    socket.on('joinLobby', (lobbyID) => {
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


console.log("server started");