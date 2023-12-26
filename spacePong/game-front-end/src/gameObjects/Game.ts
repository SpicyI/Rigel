
import {SceneIDE as Scene} from "./Scene";
import { Paddle, Arena , Controls, Ball} from "./objects";
import * as THREE from 'three';
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import {io} from "socket.io-client";
import { Socket } from 'socket.io-client';
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";

import {CSS2DRenderer, CSS2DObject} from "three/examples/jsm/renderers/CSS2DRenderer";


const skybox = new URL('../../assets/HDRs/nebula3.hdr', import.meta.url);
const spectatorGirl = new URL('../../assets/GLBs/spectator_girl.glb', import.meta.url);
const ost = new URL('../../assets/audio/ost.mp3', import.meta.url);
const ball = new URL('../../assets/GLBs/blackhole.glb', import.meta.url);
const floatingShip = new URL('../../assets/GLBs/floating_ship.glb', import.meta.url);
const panel = new URL('../../assets/GLBs/panel.glb', import.meta.url);
const spaceEnv = new URL('../../assets/GLBs/space_env.glb', import.meta.url);


export class ScoreBorad {

    private Renderer: CSS2DRenderer;
    private resizeEvent: EventListener;

    private player1Score: HTMLDivElement;
    private player2Score: HTMLDivElement;

    public label1: CSS2DObject;
    public label2: CSS2DObject;

    constructor() {
        this.Renderer = new CSS2DRenderer();
        this.Renderer.setSize(window.innerWidth, window.innerHeight);
        this.Renderer.domElement.style.position = 'absolute';
        this.Renderer.domElement.style.top = '0px';
        this.Renderer.domElement.style.pointerEvents = 'none';

        this.resizeEvent = () => {
            this.Renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', this.resizeEvent, false);

        this.player1Score = document.createElement("p");
        this.player1Score.textContent = "0";
        this.player1Score.style.color = "white";
        this.player1Score.style.fontSize = "20px";

        this.player2Score = document.createElement("p");
        this.player2Score.textContent = "0";
        this.player2Score.style.color = "white";
        this.player2Score.style.fontSize = "20px";

        this.label1 = new CSS2DObject(this.player1Score);
        this.label2 = new CSS2DObject(this.player2Score);
        
    }


    updateScore(player1Score: number, player2Score: number) {
        this.label1.element.textContent = player1Score.toString();
        this.label2.element.textContent = player2Score.toString();

        // delete this.label1;
        // delete this.label2;

        // this.label1 = new CSS2DObject(this.player1Score);
        // this.label2 = new CSS2DObject(this.player2Score);
    }


    


    getDomElement() {
        return this.Renderer.domElement;
    }

    render(scene: THREE.Scene, camera: THREE.Camera) {
        this.Renderer.render(scene, camera);
    }

    dispose() {
        window.removeEventListener('resize', this.resizeEvent);
        this.Renderer.domElement.remove();
        delete this.Renderer;
        removeEventListener('resize', this.resizeEvent);
        delete this.resizeEvent;
        this.player1Score.remove();
        this.player2Score.remove();
        delete this.player1Score;
        delete this.player2Score;
        this.label1.element.remove();
        this.label2.element.remove();
        delete this.label1;
        delete this.label2;
    }


}

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


type modelContainer = {
    model: THREE.Group<THREE.Object3DEventMap>,
    mixer: THREE.AnimationMixer
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
    private scoreBoard: ScoreBorad;

    private GlbLoader: GLTFLoader;


    private clock: THREE.Clock = new THREE.Clock();
    private modelsArr: modelContainer[]; 



    constructor(container: HTMLElement) {
        this.client = io("http://10.14.5.8:3000");
        this.client.on("connect", () => {
            this.clientId = this.client.id;
        });
        this.sceneContainer = container;
        this.loadingScreen = new LoadingScreen();
        this.loadingManager = new THREE.LoadingManager();

        this.GlbLoader = new GLTFLoader(this.loadingManager);
        this.HDRILoader = new RGBELoader(this.loadingManager);
        this.AudioLoader = new THREE.AudioLoader(this.loadingManager);
        this.SkinLoader = new THREE.TextureLoader(this.loadingManager);
        this.audioListener = new THREE.AudioListener();
        this.audio = new THREE.Audio(this.audioListener);

        this.scoreBoard = new ScoreBorad();
        this.modelsArr = new Array();

    }

    private joinGame() {
        this.sceneContainer.appendChild(this.loadingScreen.getLoadingScreen());
        this.client.emit("joinLobby", this.GameId);
    }


    n: number = 0;
    private gameLoop() {
        const delta = this.clock.getDelta();
        this.player.updateMoves(this.client);
        // this.ball.rotate();
        this.scoreBoard.render(this.scene.scene, this.scene.camera);
        
        if (this.modelsArr.length == 2 && this.n == 0){
            console.log(this.modelsArr);
            this.n = 1;
        }
        
        this.modelsArr.forEach((mixer) => {
            mixer.mixer.update(delta);
        });
        this.scene.scene.rotation.y += 0.0005;
        this.ball.rotate();
        this.scene.render();
        // if (this.n == 0 ){
        //     console.log(this.modelsArr);
        //     this.n = 1;
        // }

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

        this.scoreBoard.dispose();
        delete this.scoreBoard;

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
        this.GlbLoader = null;

        this.modelsArr.forEach((model) => {
            model.model.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.material.dispose();
                }
            });
            model.mixer.stopAllAction();
            model.model.remove();
            model.mixer = null;
            model.model = null;
        });

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
        this.player.addControle(this.sceneContainer);
        this.client.on("startGame", () => {
            // this.loadingScreen.hide();
            this.client.on("initPlayer", (data) => {
                this.player.setPos(data.pos.x, data.pos.y, data.pos.z);
                let controlSet = data.side == "left" ? {up:'a', down: 'd'} : {up:'d', down: 'a'};
                this.player.setControlSet(controlSet);
                this.player.setSide(data.side);
                this.opponent.setSide(data.side == "left" ? "right" : "left");

                this.scoreBoard.label1.position.set(this.player.side == 'left' ? -110 : 110, 0, 0);
                this.scoreBoard.label2.position.set(this.player.side == 'left' ? 110 : -110, 0, 0);
                this.scene.scene.add(this.scoreBoard.label1, this.scoreBoard.label2);
            });
            this.sceneContainer.appendChild(this.scoreBoard.getDomElement());
            this.opponent.receiveMoves(this.client);
            this.ball.receiveMoves(this.client);
            this.scene.scene.add(this.container);
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
            this.loadingScreen.hide();
            this.client.emit("playerReady", this.clientId);
        };

        this.HDRILoader.load(skybox.href, (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            this.scene.scene.background = texture;
            this.scene.scene.environment = texture;
        });

        this.GlbLoader.load(floatingShip.href, (gltf) => {
            const paddle_model = gltf.scene;
            const bbox = new THREE.Box3().setFromObject(paddle_model);
            paddle_model.scale.set(0.0012, 0.0012, 24 / (bbox.max.z - bbox.min.z));
            paddle_model.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.material.emissiveIntensity = 5;
                }
            });
            paddle_model.rotateZ(Math.PI / 2);
            paddle_model.position.z += 8.23;
            paddle_model.position.y += 2;
            this.player.center.add(paddle_model);
            this.opponent.center.add(paddle_model.clone().rotateZ(Math.PI));
        });

        this.GlbLoader.load(panel.href, (gltf) => {
            const arene_model = gltf.scene;
            const bbox = new THREE.Box3().setFromObject(arene_model);
            arene_model.scale.set(200 / (bbox.max.x - bbox.min.x), 0.1, 150 / (bbox.max.z - bbox.min.z));
            arene_model.rotateX(Math.PI / 2);
            arene_model.position.set(-100, -150 / 2, 0);
            this.arena.body.add(arene_model);
        });

        this.GlbLoader.load(spaceEnv.href, (gltf) => {
            const env_model = gltf.scene;
            env_model.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.material.emissiveIntensity = 2;
                }
            });
            const animation = gltf.animations[0];
            const mixer1 = new THREE.AnimationMixer(env_model);
            const action = mixer1.clipAction(animation);
            action.play();
            this.modelsArr.push({ model: env_model, mixer: mixer1 });
            env_model.scale.set(200, 200, 200);
            env_model.position.set(100, 0, -3000);
            this.scene.scene.add(env_model);
        });

        this.GlbLoader.load(spectatorGirl.href, (gltf) => {
            const spec_model = gltf.scene;
            const animation = gltf.animations[0];
            const mixer2 = new THREE.AnimationMixer(spec_model);
            const action = mixer2.clipAction(animation);
            action.play();
            this.modelsArr.push({ model: spec_model, mixer: mixer2 });
            spec_model.scale.set(10, 10, 10);
            spec_model.position.set(0, 0, -90);
            this.scene.scene.add(spec_model);
        });

        this.GlbLoader.load(ball.href, (gltf) => {
            const model = gltf.scene;
            model.scale.set(3, 3, 3);
            model.traverse((child)=>{
                if (child instanceof THREE.Mesh){
                    child.material.emissiveIntensity = 0.7;
                }
            });
            this.ball.body.add(model);
        }, undefined, (error) => {
            console.error(error);
        });

        this.AudioLoader.load(ost.href, (buffer) => {
            this.audio.setBuffer(buffer);
            this.audio.setLoop(true);
            this.audio.setVolume(0.5);
            this.audio.play();
        });
    }

    private pushObjects() {
        this.container.add(this.arena.body, this.ball.body, this.player.center, this.opponent.center);
    }


    private receiveScore() {
        this.client.on("score", (score) => {
            let playerScore = score[this.player.side];
            let opponentScore = score[this.opponent.side];
            this.scoreBoard.updateScore(playerScore, opponentScore);
        });
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
        this.receiveScore();
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

