"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var socket_io_1 = require("socket.io");
var http = require('http');
// Create an HTTP server
var server = http.createServer();
// Initialize socket.io server with options
var options = {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
};
var io = new socket_io_1.Server(server, options);
var winScore = 5;
/**
 * A utility class for generating random numbers and directions.
 * @class
 
 */
var customRand = /** @class */ (function () {
    function customRand() {
    }
    /**
     * Generates a random integer between the specified range.
     * @param {number} low - The lower bound of the range (inclusive).
     * @param {number} high - The upper bound of the range (inclusive).
     * @returns {number} The random integer.
     */
    customRand.randInt = function (low, high) {
        if (low === void 0) { low = 0; }
        if (high === void 0) { high = 1000; }
        return low + Math.floor(Math.random() * (high - low + 1));
    };
    /**
     * Generates a random floating-point number between the specified range.
     * @param {number} low - The lower bound of the range.
     * @param {number} high - The upper bound of the range.
     * @returns {number} The random floating-point number.
     */
    customRand.randFloat = function (low, high) {
        return low + Math.random() * (high - low);
    };
    /**
     * Generates a random direction vector within the specified range of angles.
     * @param {number} min - The minimum angle in radians.
     * @param {number} max - The maximum angle in radians.
     * @returns {number[]} The random direction vector as an array [x, y, z].
     */
    customRand.randomDirection = function (min, max) {
        var x = Math.cos(customRand.randFloat(min, max));
        var y = 0;
        var z = Math.sin(customRand.randFloat(min, max));
        return [x, y, z];
    };
    /**
     * Converts degrees to radians.
     * @param {number} deg - The angle in degrees.
     * @returns {number} The angle in radians.
     */
    customRand.degToRad = function (deg) {
        return deg * Math.PI / 180;
    };
    /**
     * Converts radians to degrees.
     * @param {number} rad - The angle in radians.
     * @returns {number} The angle in degrees.
     */
    customRand.radToDeg = function (rad) {
        return rad * 180 / Math.PI;
    };
    return customRand;
}());
/**
 * Represents a 3D vector.
 * @class
 */
var Vector3 = /** @class */ (function () {
    /**
     * Creates a new Vector3 instance.
     * @constructor
     * @param {number} [x=0] - The x-coordinate of the vector.
     * @param {number} [y=0] - The y-coordinate of the vector.
     * @param {number} [z=0] - The z-coordinate of the vector.
     */
    function Vector3(x, y, z) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (z === void 0) { z = 0; }
        this.x = x;
        this.y = y;
        this.z = z;
    }
    /**
     * Creates a new Vector3 instance with the same coordinates as the current vector.
     * @returns {Vector3} A new Vector3 instance.
     */
    Vector3.prototype.clone = function () {
        return new Vector3(this.x, this.y, this.z);
    };
    /**
     * Normalizes the vector, making its length equal to 1.
     * @returns {Vector3} The current vector.
     */
    Vector3.prototype.normalize = function () {
        var length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z) || 1;
        this.x /= length;
        this.y /= length;
        this.z /= length;
        return this;
    };
    /**
     * Multiplies the vector by a scalar value.
     * @param {number} scalar - The scalar value to multiply the vector by.
     * @returns {Vector3} The current vector.
     */
    Vector3.prototype.multiplyScalar = function (scalar) {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
        return this;
    };
    /**
     * Adds another vector to the current vector.
     * @param {Vector3} vec - The vector to add.
     * @returns {Vector3} The current vector.
     */
    Vector3.prototype.add = function (vec) {
        this.x += vec.x;
        this.y += vec.y;
        this.z += vec.z;
        return this;
    };
    /**
     * Copies the coordinates of another vector to the current vector.
     * @param {Vector3} vec - The vector to copy from.
     * @returns {Vector3} The current vector.
     */
    Vector3.prototype.copy = function (vec) {
        this.x = vec.x;
        this.y = vec.y;
        this.z = vec.z;
        return this;
    };
    /**
     * Sets the coordinates of the vector.
     * @param {number} [x=0] - The x-coordinate of the vector.
     * @param {number} [y=0] - The y-coordinate of the vector.
     * @param {number} [z=0] - The z-coordinate of the vector.
     */
    Vector3.prototype.set = function (x, y, z) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (z === void 0) { z = 0; }
        this.x = x;
        this.y = y;
        this.z = z;
    };
    /**
     * Performs a quaternion rotation on the current vector.
     * @param {Quaternion} quaternion - The quaternion to rotate by.
     * @returns {Vector3} The current vector.
     */
    Vector3.prototype.applyQuaternion = function (quaternion) {
        var qVec = quaternion.getVec();
        var temp = qVec.cross(this).multiplyScalar(2);
        var temp2 = qVec.cross(temp);
        this.add(temp.multiplyScalar(quaternion.getScalar()));
        this.add(temp2);
        return this;
    };
    /**
     * performs a cross product on the current vector and another vector.
     * @param {Vector3} vec the vector to perform the cross product with.
     * @returns {Vector3} the result of the cross product.
     */
    Vector3.prototype.cross = function (vec) {
        var x = vec.y * this.z - vec.z * this.y;
        var y = vec.z * this.x - vec.x * this.z;
        var z = vec.x * this.y - vec.y * this.x;
        return new Vector3(x, y, z);
    };
    return Vector3;
}());
/**
 * Represents a quaternion.
 * @class
 */
var Quaternion = /** @class */ (function () {
    /**
     * Creates a new Quaternion instance.
     * @constructor
     * @param {number} [x=0] - The x-coordinate of the vector.
     * @param {number} [y=0] - The y-coordinate of the vector.
     * @param {number} [z=0] - The z-coordinate of the vector.
     * @param {number} [scalar=1] - The scalar value of the quaternion.
     */
    function Quaternion(x, y, z, scalar) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (z === void 0) { z = 0; }
        if (scalar === void 0) { scalar = 1; }
        this.vec = new Vector3(x, y, z);
        this.scalar = scalar;
    }
    /**
     * Sets the quaternion to the specified axis and angle.
     * @param {Vector3} axis - The axis of rotation.
     * @param {number} angle - The angle of rotation in radians.
     * @returns {Quaternion} The current quaternion.
     */
    Quaternion.prototype.set = function (axis, angle) {
        var halfAngle = angle / 2;
        var s = Math.sin(halfAngle);
        this.vec.copy(axis).normalize().multiplyScalar(s);
        this.scalar = Math.cos(halfAngle);
        return this;
    };
    /**
     * Gets the vector part of the quaternion.
     * @returns {Vector3} The vector part of the quaternion.
     */
    Quaternion.prototype.getVec = function () {
        return this.vec.clone();
    };
    /**
     * Gets the scalar part of the quaternion.
     * @returns {number} The scalar part of the quaternion.
     */
    Quaternion.prototype.getScalar = function () {
        return this.scalar;
    };
    return Quaternion;
}());
/**
 * Represents a ball.
 * @class
 */
var ball = /** @class */ (function () {
    /**
     * Creates a new ball instance.
     * @constructor
     * @param {Vector3} [position=new Vector3(0, 3, 0)] - The position of the ball.
     * @param {number} [speed=50] - The speed of the ball.
     * @param {number} [radius=2] - The radius of the ball.
     * */
    function ball(position, speed, radius) {
        if (position === void 0) { position = new Vector3(0, 3, 0); }
        if (speed === void 0) { speed = 50; }
        if (radius === void 0) { radius = 2; }
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
    ball.prototype.mountSocket = function (socket, lobby) {
        this.socket = socket;
        this.lobby = lobby;
    };
    /**
     * emmit the ball position to the all user in the lobby.
    */
    ball.prototype.emitPOS = function () {
        if (this.socket === undefined)
            return;
        this.socket.to(this.lobby).emit('ballMove', { position: this.position });
    };
    /**
     * sets the ball speed.
     * @param {number} speed - The speed to set.
    */
    ball.prototype.setSpeed = function (speed) {
        this.speed = speed;
    };
    /**
     * increases the ball speed by 5 each time till it reaches 110.
     */
    ball.prototype.increseSpeed = function () {
        if (this.speed < 110)
            this.speed += 5;
    };
    /**
     * resets the ball position to 0,3,0 and speed to 50.
     */
    ball.prototype.reset = function () {
        this.position.set(0, 3, 0);
        this.speed = 50;
    };
    /**
     * sets the ball direction.
     * @param {Vector3} direction - The direction to set.
     */
    ball.prototype.setDirection = function (direction) {
        this.direction.copy(direction);
    };
    /**
     * rotates the ball direction by quaternion.
     */
    ball.prototype.slide = function () {
        this.direction.applyQuaternion(this.quaternion);
    };
    return ball;
}());
/**
 * Represents a player and a paddle in the game.
 * @class
 */
var Player = /** @class */ (function () {
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
    function Player(position, set) {
        if (position === void 0) { position = new Vector3(0, 0, 0); }
        if (set === void 0) { set = {}; }
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
    Player.prototype.mountSocket = function (socket, lobby) {
        this.socket = socket;
        this.lobby = lobby;
    };
    /**
     *  listens to the player socket for position updates.
     *  @event playerMove
     */
    Player.prototype.updateMoves = function () {
        var _this = this;
        if (this.socket === undefined)
            return;
        this.socket.on('playerMove', function (data) {
            // console.log("recived data:", data, "END OF TRANSFER");
            _this.position.copy(data.position);
        });
    };
    /**
     * emmit the player position to the oppenent in the lobby.
     */
    Player.prototype.emitPOS = function () {
        if (this.socket === undefined)
            return;
        // console.log(`emiting data to ${this.lobby} with ${this.socket.id}:`, this.position, "END OF TRANSFER");
        this.socket.to(this.lobby).emit('playerMove', { position: this.position });
    };
    /**
     * emmit the innitial player position to the player.
     */
    Player.prototype.echoPos = function () {
        if (this.socket === undefined)
            return;
        this.socket.emit('initPlayer', this.position);
    };
    /**
     * checks if the ball collides with the player.
     * @param {ball} ball - The ball to check collision with.
     * @returns {boolean} true if the ball collides with the player.
     */
    Player.prototype.checkCollision = function (ball) {
        var botCorner = {
            x: this.position.x - this.width,
            z: this.position.z - this.length
        };
        var topCorner = {
            x: this.position.x + this.width,
            z: this.position.z + this.length
        };
        if (ball.position.x > botCorner.x && ball.position.x < topCorner.x
            && ball.position.z > botCorner.z && ball.position.z < topCorner.z)
            return true;
        return false;
    };
    /**
     * adds a score to the player.
     * @returns {boolean} true if the player wins.
     */
    Player.prototype.addScore = function () {
        this.Score++;
        if (this.Score == winScore)
            return true;
        return false;
    };
    /**
     * resets the player position to the middle of the arena.
     * @param {arena} arena - The arena to reset the player in.
     */
    Player.prototype.reset = function (arena) {
        if (this.side == 'left')
            this.position.set(arena.width / -2, 0, 0);
        else if (this.side == 'right')
            this.position.set(arena.width / 2, 0, 0);
    };
    return Player;
}());
/**
 * Represents the arena.
 * @class
 */
var arena = /** @class */ (function () {
    /**
     * Creates a new arena instance.
     * @constructor
     * @param {number} [hieght=150] - The hieght of the arena.
     * @param {number} [width=200] - The width of the arena.
     */
    function arena(hieght, width) {
        if (hieght === void 0) { hieght = 150; }
        if (width === void 0) { width = 200; }
        this.hieght = hieght;
        this.width = width;
    }
    /**
     * checks if the ball collides with the arena.
     * @param {ball} ball - The ball to check collision with.
     * @returns {string} 'bounce' if the ball collides with the arena hieght, 'goal' if the ball collides with the arena width, 'none' if no collision detected.
     */
    arena.prototype.checkCollision = function (ball) {
        if (ball.position.z > this.hieght / 2 || ball.position.z < -this.hieght / 2)
            return 'bounce';
        else if (ball.position.x > this.width / 2 || ball.position.x < -this.width / 2)
            return 'goal';
        return 'none';
    };
    return arena;
}());
/**
 * Represents a game.
 * @class
 */
var Game = /** @class */ (function () {
    /**
     * Creates a new Game instance.
     * @constructor
     * @param {Player[]} players - The players in the game.
     * @param {ball} ball - The ball in the game.
     * @param {arena} arena - The arena in the game.
     * @throws {Error} Invalid number of players.
     */
    function Game(players, ball, arena) {
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
    Game.prototype.Score = function () {
        var isWinner = this.ball.position.x > 0 ? this.playerL.addScore() : this.playerR.addScore();
        if (isWinner) {
            this.finish();
        }
        this.ball.setDirection(new Vector3(this.ball.position.x > 0 ? 1 : -1, 0, 0).normalize());
        this.playerL.reset(this.arena);
        this.playerR.reset(this.arena);
        this.ball.reset();
    };
    /**
     * checks if the ball collides with a player and handles the collision.
     */
    Game.prototype.checkplayersCollision = function () {
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
    };
    /**
     * checks if the ball collides with the arena or a player and handles the collision.
     * in case of a goal the score is handled.
     */
    Game.prototype.checkCollision = function () {
        var arenaCollision = this.arena.checkCollision(this.ball);
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
    };
    /**
     * starts the game loop.
     */
    Game.prototype.start = function () {
        this.ball.setDirection(new Vector3(customRand.randInt() % 2 ? 1 : -1, 0, 0).normalize());
        this.playerL.echoPos();
        this.playerR.echoPos();
        this.playerL.emitPOS();
        this.playerR.emitPOS();
        this.playerL.updateMoves();
        this.playerR.updateMoves();
        this.ball.emitPOS();
        this.gameLoop();
    };
    /**
     * the game loop.
     */
    Game.prototype.gameLoop = function () {
        var _this = this;
        var lastTime = Date.now();
        this.interval = setInterval(function () {
            var currentTime = Date.now();
            var deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
            // wait 5 sec before start
            _this.playerR.emitPOS();
            _this.playerL.emitPOS();
            _this.ball.emitPOS();
            _this.checkCollision();
            _this.ball.position.add(_this.ball.direction.clone().multiplyScalar(_this.ball.speed * deltaTime));
            // this.ball.emitPOS();
            lastTime = currentTime;
        }, 1000 / 120);
    };
    /**
    * finishes the game.
    */
    Game.prototype.finish = function () {
        console.log('game finished');
    };
    return Game;
}());
/**
 * Represents a lobby.
 */
var lobby = /** @class */ (function () {
    /**
     * Creates a new lobby instance.
     * @constructor
     * @param {string} id - The id of the lobby.
     * @param {any} io - The socket io instance.
     */
    function lobby(id, io) {
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
    lobby.prototype.addPlayer = function (AddedplayerSocket) {
        var _this = this;
        if (this.players.size == 2)
            throw new Error('lobby is full');
        this.players.set({ playerSocket: AddedplayerSocket, isReady: false }, null);
        AddedplayerSocket.on('playerReady', function (socketID) {
            _this.setReady(socketID);
        });
        console.log("player added to lobby: ".concat(this.id, " as ").concat(AddedplayerSocket.id));
        if (this.players.size == 2)
            this.setupGame();
    };
    /**
     * sets up the game.
     */
    lobby.prototype.setupGame = function () {
        var _this = this;
        // loop  over players and set their side
        if (this.game != null)
            return;
        console.log('setting up game');
        var i = 0;
        this.ball.mountSocket(this.io, this.id);
        this.players.forEach(function (player, key) {
            var newPlayer = new Player(_this.sides[i].pos, _this.sides[i]);
            newPlayer.mountSocket(key.playerSocket, _this.id);
            _this.players.set(key, newPlayer);
            key.playerSocket.join(_this.id);
            i++;
        });
        var playerArr = __spreadArray([], __read(this.players.values()), false);
        this.game = new Game(playerArr, this.ball, this.arena);
        this.io.to(this.id).emit('startGame');
        this.game.start();
    };
    /**
     * sets a player as ready.
     * @param {string} playerSocketIdToSet - The socket id of the player to set.
     */
    lobby.prototype.setReady = function (playerSocketIdToSet) {
        var _this = this;
        console.log("consfirmaion from ".concat(playerSocketIdToSet));
        this.players.forEach(function (value, key) {
            if (key.playerSocket && key.playerSocket.id == playerSocketIdToSet) {
                key.isReady = true;
                _this.confiramtions++;
            }
        });
        // check if all players are ready
        if (this.confiramtions === 2) {
            console.log('confirmed - starting game ');
            this.setupGame();
        }
    };
    return lobby;
}());
/**
 * Represents a lobby manager.
 * @class
 */
var lobbyManager = /** @class */ (function () {
    /**
     * Creates a new lobbyManager instance.
     * @constructor
     * @param {any} io - The socket io instance.
     */
    function lobbyManager(io) {
        this.io = io;
        this.lobbies = new Map();
    }
    /**
     * map the player socket to the lobby. if the lobby doesn't exist create a new one.
     * @param {any} socket - The socket of the player to add.
     * @param {string} lobbyID - The id of the lobby to join.
    */
    lobbyManager.prototype.joinLobby = function (socket, lobbyID) {
        if (this.lobbies.has(lobbyID)) {
            console.log("".concat(socket.id, " is joining existing lobby: ").concat(lobbyID));
            var lobby_1 = this.lobbies.get(lobbyID);
            if (lobby_1 == undefined)
                return;
            lobby_1.addPlayer(socket);
        }
        else {
            console.log('creating new lobby');
            var newLobby = new lobby(lobbyID, this.io);
            this.lobbies.set(lobbyID, newLobby);
            newLobby.addPlayer(socket);
        }
    };
    return lobbyManager;
}());
var manager = new lobbyManager(io);
// let l;
io.on('connection', function (socket) {
    console.log("connected with id: ".concat(socket.id));
    socket.on('joinLobby', function (lobbyID) {
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
var PORT = 3000;
server.listen(PORT, function () {
    console.log("Server running on port ".concat(PORT));
});
