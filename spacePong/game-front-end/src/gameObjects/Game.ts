
import * as THREE from 'three';
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import {io , Socket} from "socket.io-client";

import {SceneIDE as Scene} from "./Scene";
import { Paddle, Arena , Ball} from "./objects";
import { ScoreBorad, LoadingScreen } from './elements';



const skybox = new URL('../../assets/HDRs/nebula3.hdr', import.meta.url);
const spectator_bot = new URL('../../assets/GLBs/bot.glb', import.meta.url);
const ost = new URL('../../assets/audio/ost.mp3', import.meta.url);
const ball = new URL('../../assets/GLBs/blackhole.glb', import.meta.url);
const floatingShip = new URL('../../assets/GLBs/floating_ship.glb', import.meta.url);
const panel = new URL('../../assets/GLBs/panel.glb', import.meta.url);
const spaceEnv = new URL('../../assets/GLBs/space_env.glb', import.meta.url);
const avatar1 = new URL('../../assets/GLBs/avatar1.glb', import.meta.url);
const avatar2 = new URL('../../assets/GLBs/avatar2.glb', import.meta.url);


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
    private privateGameId: string = "none";
    private acces_token: string;
    private userId: string = "none";

    private isDisposed: boolean = false;

    constructor(container: HTMLElement, acces_token: string, userId: string, gameId: string = "none") {
        this.privateGameId = gameId;
        this.acces_token = acces_token;
        this.userId = userId;
        this.client = io("ws://127.0.0.1:3000", {
            transportOptions: {
                polling: {
                    extraHeaders: {
                        'Authorization': `Bearer ${this.acces_token}`
                    }
                }
            },
            query: {
                userId: this.userId
            }
        });

        this.client.on("connect_error", (err) => {
            console.log(err);
        });

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


    private gameLoop() {
        const delta = this.clock.getDelta();
        this.player.updateMoves(this.client);

        this.scoreBoard.render(this.scene.scene, this.scene.camera);
        

        
        this.modelsArr.forEach((mixer) => {
            mixer.mixer.update(delta);
        });
        this.scene.scene.rotation.y += 0.0005;
        this.scene.orbit.update();
        this.ball.rotate();
        this.scene.render();

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
    }

    private preMadeGame() {
        this.GameId = this.privateGameId;
        this.joinGame();
        this.setUp();
        this.start();
    }


    public dispose() {
        console.log(`disposing at ${Date.now()}`);
        this.isDisposed = true;
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

        this.HDRILoader.manager.onProgress = null;
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
        console.log("listening for ff");
        this.client.on("ff", () => {
            console.log("recived an ff");
            this.dispose();
            this.sceneContainer.innerHTML = "<h1>you won by forfeit</h1>";
        });


    }

    private receiveWin() {
        this.client.on("win", () => {
            this.dispose();
            this.sceneContainer.innerHTML = "<h1>you won</h1>";
        });
    }

    private receiveLose() {
        this.client.on("lose", () => {
            this.dispose();
            this.sceneContainer.innerHTML = "<h1>you lost</h1>";
        });
    }

    private initPlayer(){
        this.client.on("initPlayer", (data) => {
            this.player.setPos(data.pos.x, data.pos.y, data.pos.z);
            this.opponent.setPos(data.pos.x * -1 , data.pos.y, data.pos.z)
            let controlSet = data.side == "left" ? {up:'a', down: 'd'} : {up:'d', down: 'a'};
            this.player.setControlSet(controlSet);
            this.player.setSide(data.side);
            this.opponent.setSide(data.side == "left" ? "right" : "left");

            this.scoreBoard.label1.position.set(this.player.side == 'left' ? -110 : 120, 10, 0);
            this.scoreBoard.label2.position.set(this.player.side == 'left' ? 110 : -120, 10, 0);
            this.scene.scene.add(this.scoreBoard.label1, this.scoreBoard.label2);
        });
    }


    private start() {
        this.player.addControle(this.sceneContainer);
        this.client.on("startGame", () => {
            this.initPlayer();

            this.sceneContainer.appendChild(this.scoreBoard.getDomElement());
            this.opponent.receiveMoves(this.client);
            this.ball.receiveMoves(this.client);
            this.scene.scene.add(this.container);
            this.scene.renderer.setAnimationLoop(() => {
                this.gameLoop();
            });
        });
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

    // async private modelLoader(url: URL, callback:Function){

    // }

    private setLoader() {
        this.loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
            this.loadingScreen.updateProgress(itemsLoaded / itemsTotal * 100);
        };

        this.loadingManager.onLoad = () => {
            this.loadingScreen.hide();
            this.client.emit("playerReady", this.clientId);
        };

        this.HDRILoader.load(skybox.href, (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            if (this.isDisposed) return;
            this.scene.scene.background = texture;
            this.scene.scene.environment = texture;
            this.scene.scene.backgroundIntensity = 3;
            this.scene.render();
        });

        this.GlbLoader.load(floatingShip.href, (gltf) => {
            const paddle_model = gltf.scene;
            const bbox = new THREE.Box3().setFromObject(paddle_model);
            paddle_model.scale.set(0.0012, 0.0012, 24 / (bbox.max.z - bbox.min.z));
            
            paddle_model.rotateZ(Math.PI / 2);
            paddle_model.position.z += 8.23;
            paddle_model.position.y += 2;
            
            const cloned = paddle_model.clone();
            cloned.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.material.color.set(0xffffff); // Set the color to bright white
                    child.material.emissive.set(0xffffff); // Set the emissive color to white for a brighter effect
                    child.material.emissiveIntensity = 5; // Increase the emissive intensity for better visibility
                    child.material.metalness = 0.1; // Make the material more metallic looking
                }
            });
            if(this.player && this.opponent && this.scene){
            this.player.center.add(paddle_model);
            this.opponent.center.add(cloned.rotateZ(Math.PI));
            this.scene.render();
            }

        });

        this.GlbLoader.load(panel.href, (gltf) => {
            const arene_model = gltf.scene;
            const bbox = new THREE.Box3().setFromObject(arene_model);
            arene_model.scale.set(200 / (bbox.max.x - bbox.min.x), 0.1, 150 / (bbox.max.z - bbox.min.z));
            arene_model.rotateX(Math.PI / 2);
            arene_model.position.set(-100, -150 / 2, 0);
            // if(this.isDisposed) return;
            if (this.arena && this.scene){
            this.arena.body.add(arene_model);
            this.scene.render();
            }

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
            // if(this.isDisposed) return;
            if (this.scene){
                this.scene.scene.add(env_model);
                this.scene.render();
            }

        });

        this.GlbLoader.load(spectator_bot.href, (gltf) => {
            const spec_model = gltf.scene;
            const animation = gltf.animations[0];
            const mixer2 = new THREE.AnimationMixer(spec_model);
            const action = mixer2.clipAction(animation);
            action.play();
            this.modelsArr.push({ model: spec_model, mixer: mixer2 });
            spec_model.scale.set(0.2, 0.2, 0.2);
            spec_model.position.set(0, 0, -120);
            // if (this.isDisposed) return;
            if (this.scene){
            this.scene.scene.add(spec_model);
            this.scene.render();
            }

        });

        this.GlbLoader.load(ball.href, (gltf) => {
            const model = gltf.scene;
            model.scale.set(3, 3, 3);
            model.traverse((child)=>{
                if (child instanceof THREE.Mesh){
                    child.material.emissiveIntensity = 0.7;
                }
            });
            // if(this.isDisposed) return;
            if (this.ball)
                this.ball.body.add(model);
        });

        this.GlbLoader.load(avatar1.href,(gltf)=> {
            const vatar_model = gltf.scene;
            const bbox = new THREE.Box3().setFromObject(vatar_model);
            const animation = gltf.animations[0];
            const mixer3 = new THREE.AnimationMixer(vatar_model);
            const action = mixer3.clipAction(animation);
            action.play();
            vatar_model.scale.set(0.35, 0.35, 0.35);
            vatar_model.rotateY(Math.PI / 2);
            this.modelsArr.push({ model: vatar_model, mixer: mixer3 });
            // if(this.isDisposed) return;
            vatar_model.position.set(-170, 0, 0);
            if(this.scene)
                this.scene.scene.add(vatar_model);
        });

        this.GlbLoader.load(avatar2.href,(gltf)=> {
            const vatar_model2 = gltf.scene;
            const bbox = new THREE.Box3().setFromObject(vatar_model2);
            const animation = gltf.animations[0];
            const mixer4 = new THREE.AnimationMixer(vatar_model2);
            const action = mixer4.clipAction(animation);
            action.play();
            vatar_model2.scale.set(40, 40, 40);
            vatar_model2.rotateY(Math.PI / -2);
            this.modelsArr.push({ model: vatar_model2, mixer: mixer4 });
            vatar_model2.position.set(170, 0, 0);
            // if(this.isDisposed) return;
            if(this.scene)
                this.scene.scene.add(vatar_model2);
        });

        this.AudioLoader.load(ost.href, (buffer) => {
            this.audio.setBuffer(buffer);
            this.audio.setLoop(true);
            this.audio.setVolume(0.5);
            this.audio.play();
        });
    }

    private pushObjects() {
        this.container = new THREE.Object3D();
        this.container.position.set(0, 0, 0);
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



        this.setObjects();
        this.pushObjects();
        this.setLoader();

    }

    launch() {
        
        this.recieveForfeit();
        if (this.privateGameId == "none"){
            this.queueUp();
            this.receiveGameId();
        }
        else
            this.preMadeGame();
        this.receiveWin();
        this.receiveLose();
        this.receiveScore();
    }

}


export default {
    LoadingScreen,
    Game,
}

