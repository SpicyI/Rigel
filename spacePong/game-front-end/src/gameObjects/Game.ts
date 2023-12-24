import { ball } from './../../../game-back-end/src/game_logic/gameObjects';

import {SceneIDE as Scene} from "./Scene";
import { Paddle, Arena , Controls, Ball} from "./objects";
import * as THREE from 'three';
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import {io} from "socket.io-client";
import { Socket } from 'socket.io-client';

const skybox = new URL('../../assets/HDRs/nebula3.hdr', import.meta.url);
const ballSkin = new URL('../../assets/imgs/sky.jpg', import.meta.url);
const ost = new URL('../../assets/audio/ost.mp3', import.meta.url);



export class LoadingScreen {

    private loadingScreen: HTMLDivElement;
    private label: HTMLLabelElement;
    private progressBar: HTMLProgressElement;

    constructor() {
        this.loadingScreen = document.createElement("div");
        this.loadingScreen.classList.add("loading-screen");

        this.label = document.createElement("label");
        this.label.id = "label1";
        this.label.htmlFor = "progress-bar";
        this.label.textContent = "Loading Assets...";
        this.loadingScreen.appendChild(this.label);

        this.progressBar = document.createElement("progress");
        this.progressBar.id = "progress-bar";
        this.progressBar.value = 0;
        this.progressBar.max = 100;
        this.loadingScreen.appendChild(this.progressBar);
    }

    updateProgress(progress: number) {
        this.progressBar.value = progress;
    }

    hide() {
        this.loadingScreen.style.display = "none";
        this.loadingScreen.remove();
    }

    show() {
        this.loadingScreen.style.display = "block";
    }

    remove() {
        this.loadingScreen.remove();
    }

    getLoadingScreen() {
        return this.loadingScreen;
    }
}

export class Game {

    /**
     * Socket.io Client
     */
    private client: Socket;
    private clientId: string;
    
    /**
     * Game Id
     */
    private GameId: string;

    private scene: Scene;
    private container: THREE.Object3D;

    /**
     * Game Objects
     */
    private arena: Arena;
    private ball: Ball;
    private player: Paddle;
    private opponent: Paddle;

    /**
     * HTML Elements
     */
    private sceneContainer: HTMLElement;

    private loadingScreen: LoadingScreen;

    private loadingManager: THREE.LoadingManager;

    private HDRILoader: RGBELoader;
    private AudioLoader: THREE.AudioLoader;
    private SkinLoader: THREE.TextureLoader;

    private audioListener: THREE.AudioListener;
    private audio: THREE.Audio;



    constructor(container: HTMLElement) {
        this.client = io("http://localhost:3000");
        this.client.on("connect", () => {
            this.clientId = this.client.id;
        });
        this.sceneContainer = container;
        this.loadingScreen = new LoadingScreen();
        this.loadingManager = new THREE.LoadingManager();

        this.HDRILoader = new RGBELoader(this.loadingManager);
        this.AudioLoader = new THREE.AudioLoader(this.loadingManager);
        this.SkinLoader = new THREE.TextureLoader(this.loadingManager);
        this.audioListener = new THREE.AudioListener();
        this.audio = new THREE.Audio(this.audioListener);

    }

    private joinGame() {
        this.sceneContainer.appendChild(this.loadingScreen.getLoadingScreen());
        this.client.emit("joinLobby", this.GameId);
    }


    private gameLoop() {
        this.scene.render();
        this.player.updateMoves(this.client);
        this.ball.rotate();

    }

    private queueUp() {
        this.client.emit("queueUp");
    }

    private receiveGameId() {
        this.client.on("gameId", (gameId: string) => {
            this.GameId = gameId;
            this.joinGame();
            this.setUp();
            this.start();
        });
        // this.GameId = "test";
        // this.joinGame();
        // this.setUp();
        // this.start();

    }

    public dispose() {

        this.container.children.forEach((child) => {
            this.container.remove(child);
        });
        this.container = null;

        this.arena.dispose();
        this.arena = null;

        this.player.dispose();
        this.player = null;

        this.opponent.dispose();
        this.opponent = null;

        this.ball.dispose();
        this.ball = null;

        this.loadingScreen.remove();

        this.HDRILoader = null;
        this.AudioLoader = null;
        this.SkinLoader = null;
        this.audioListener = null;

        this.audio.stop();
        this.audio.disconnect();
        this.audio = null;


        this.loadingManager.onProgress = null;
        this.loadingManager.onLoad = null;
        this.loadingManager = null;

        this.client.off("startGame");
        this.client.off("initPlayer");
        this.client.off("ff");
        this.client.off("gameId");
        this.client.off("connect");
        this.client.removeAllListeners();
        this.client.disconnect();
        this.client = null;

        this.scene.dispose();
        this.scene = null;
    }

    private recieveForfeit() {
        this.client.on("ff", () => {
            this.dispose();
            console.log("opponent left so you won");
            this.sceneContainer.innerHTML = "<h1>you won by forfiet</h1>";
        });


    }

    private receiveWin() {
        this.client.on("win", () => {
            this.dispose();
            console.log("you won");
            this.sceneContainer.innerHTML = "<h1>you won</h1>";
        });
    }

    private receiveLose() {
        this.client.on("lose", () => {
            this.dispose();
            console.log("you lost");
            this.sceneContainer.innerHTML = "<h1>you lost</h1>";
        });
    }


    private start() {
        this.client.on("startGame", () => {
            this.loadingScreen.hide();
            this.client.on("initPlayer", (position) => {
                this.player.setPos(position.x, position.y, position.z);
            });
            this.player.addControle(this.sceneContainer);
            this.opponent.receiveMoves(this.client);
            this.ball.receiveMoves(this.client);
            this.scene.scene.add(this.container);
            console.log(this.audio.isPlaying);
            this.scene.renderer.setAnimationLoop(() => {
                this.gameLoop();
            });
        });
        // this.loadingScreen.hide();

        // this.player.setPos(-100, 0, 0);
        // this.opponent.setPos(100, 0, 0);
        // this.player.addControle(this.sceneContainer);
        // this.opponent.receiveMoves(this.client);
        // this.ball.receiveMoves(this.client);
        // this.scene.scene.add(this.container);
        // this.scene.renderer.setAnimationLoop(() => {
        //     this.gameLoop(); 
        // });

    }


    private setObjects() {
        // arena
        this.arena = new Arena(200, 3/4);

        // ball
        this.ball = new Ball(2, 0xffffff);
        this.ball.setPos(0, 3, 0);

        // paddles
        this.player = new Paddle(undefined, 1, 3,0x00ff00);
        this.opponent = new Paddle(undefined, 1, 3, 0x0000ff);
        this.player.addArena(this.arena);

    }

    private setLoader() {
        this.loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
            this.loadingScreen.updateProgress(itemsLoaded / itemsTotal * 100);
        };

        this.loadingManager.onLoad = () => {
            console.log(`player ready with id [${this.clientId}]`);
            this.client.emit("playerReady", this.clientId);
        };

        this.HDRILoader.load(skybox.href, (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            this.scene.scene.background = texture;
        });

        this.AudioLoader.load(ost.href, (buffer) => {
            this.audio.setBuffer(buffer);
            this.audio.setLoop(true);
            this.audio.setVolume(0.5);
        });

    }

    private pushObjects() {
        this.container.add(this.arena.body, this.ball.body, this.player.center, this.opponent.center);
    }




    private setUp() {
        this.scene = new Scene();
        this.scene.init(this.sceneContainer);
        this.scene.scene.add(this.audioListener);

        this.container = new THREE.Object3D();
        this.container.position.set(0, 0, 0);

        this.setObjects();
        this.pushObjects();
        // this.sceneContainer.appendChild(this.loadingScreen.getLoadingScreen());
        this.setLoader();

    }

    launch() {
        this.queueUp();
        this.receiveGameId();
        this.recieveForfeit();
        this.receiveWin();
        this.receiveLose();
    }

}


// ! main fn is for test proposes only
// export function main(Element: HTMLElement) {

//     let prog = new LoadingScreen();
//     Element.appendChild(prog.getLoadingScreen());
//     const loadmanager = new THREE.LoadingManager();
//     loadmanager.onProgress = (url, itemsLoaded, itemsTotal) => {
//         prog.updateProgress(itemsLoaded / itemsTotal * 100);
//     };

//     loadmanager.onLoad = () => {
//         prog.hide();
//     }

//     let scene = new Scene();
//     const HDRI = new RGBELoader(loadmanager);

//     HDRI.load("../../assets/HDRS/nebula3.hdr", (texture) => {
//         texture.mapping = THREE.EquirectangularReflectionMapping;
//         scene.scene.background = texture;
//     });

//     scene.init(Element);
//     let container = new THREE.Object3D();
//     container.position.set(0, 0, 0);

//     let ball = new Ball(2, 0xffffff);
//     ball.setPos(0, 3, 0);

//     let arena = new Arena(200, 3/4);
//     let player = new Paddle(undefined, 1, 3,0x00ff00);
//     let opponent = new Paddle(undefined, 1, 3, 0x0000ff);

//     player.addArena(arena);

//     player.center.position.set(-100,0,0 );
//     opponent.setPos(100, 0, 0);
//     container.add(arena.body, player.center, opponent.center, ball.body);
    
//     player.addControle(Element);
//     scene.scene.add(container);

//     scene.renderer.setAnimationLoop(() => {
//         scene.render();
//         player.testMoves();
//         ball.rotate();
//     });



// }



export default {
    // main,
    LoadingScreen,
    Game,
}

