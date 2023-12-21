import SceneIDE from "./scene";
import Paddle from "./paddles";
import Arena from "./arena";

import * as THREE from 'three';
import * as dat from 'dat.gui';

import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

import {io} from "socket.io-client";

import sky from "../imgs/sky.jpg";
import stars from "../imgs/stars.jpg";
import { Socket } from "socket.io";

const skybox = new URL('../imgs/nebula3.hdr', import.meta.url);
const ost = new URL('../audio/ost.mp3', import.meta.url);


function randomDirection(min, max){
	let x = Math.cos(THREE.MathUtils.randFloat(min, max));
	let y = 0;
	let z = Math.sin(THREE.MathUtils.randFloat(min, max));
	return [x,y,z];
}

const option = {
	showHelpers: true,
	lightINternsity: 0.75,
	axesScale: 10,
	
	extrudeSettings : {
		steps: 5,
		depth: 10,
		bevelEnabled: true,
		bevelThickness: 2,
		bevelSize: 1,
		bevelOffset: 0,
		bevelSegments: 2
	}
};

const arenaConfig = {
	width: 100,
	length: 100,
	height: 10
};

const socket = io("http://10.14.5.8:3000");
socket.on("connect", ()=>{
	console.log(`connected with id: ${socket.id}`);
});

// game starter
let startGame =  false;
const lobbyID = "6969";

socket.emit("joinLobby", lobbyID);


// !!!!!!!!!!!! Testing !!!!!!!!!!!!!
// const btn = document.getElementById("btn");
// const paragh = document.getElementById("par");
// paragh.textContent = "hello there";
// console.log(btn);


// socket.on("update", (data)=>{
// 	paragh.textContent += " - " + data + "\n";
// });

// btn.addEventListener("click", ()=>{
// 	socket.emit("update", "ma3loma");
// });

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!


const progressBar = document.getElementById("progress-bar");
const progressBarContainer = document.querySelector(".loading-screen");
const loadManager = new THREE.LoadingManager();
loadManager.onProgress = (url, item, total)=>{
	progressBar.value = (item / total) * 100;
};

loadManager.onLoad = () =>{
	// progressBarContainer.style.display = 'none';
	socket.emit("playerReady", socket.id);
};




// loaders
const HDRILoader = new RGBELoader(loadManager);
const audioLoader = new THREE.AudioLoader(loadManager);
const CubeTextureLoader = new THREE.CubeTextureLoader(loadManager);
const TextureLoader = new THREE.TextureLoader(loadManager);



const IDE= new SceneIDE();
const gui = new dat.GUI();

IDE.init(document.getElementById("scene-container"));
IDE.addGui(gui, option);


const GameSetGroup = new THREE.Object3D();
GameSetGroup.position.set(0,0,0);

HDRILoader.load(skybox, function(t){
	t.mapping = THREE.EquirectangularReflectionMapping;
	IDE.scene.background = t;
});



// IDE.SetBackground([
// 	stars,
// 	stars,
// 	stars,
// 	stars,
// 	stars,
// 	stars,
// ], CubeTextureLoader);






//ball 
const ballReduis = 2;
const ball_geo = new THREE.SphereGeometry(ballReduis,32,64); 
const ball_mat = new THREE.MeshStandardMaterial( { 
	color: 0xffffff,
	map: TextureLoader.load(sky)
 } ); 
const ball = new THREE.Mesh( ball_geo, ball_mat ); 

ball.position.set(0,3,0);
ball.castShadow = true;

GameSetGroup.add(ball);


// game arena
const Arena_size = 200;
const Arena_aspect = 3/4;
const game_arena = new Arena(Arena_size, Arena_aspect);

GameSetGroup.add(game_arena.body);



// ! players
const paddle_generator = new Paddle(undefined, 1 ,  3);
const player = paddle_generator.clone(0x00ff00);
const opponent = paddle_generator.clone(0xff0000);

player.addGui(gui, "player");
player.addArena(game_arena);
opponent.addGui(gui, "opponent");
GameSetGroup.add(player.center, opponent.center);

IDE.add(GameSetGroup);



// add ost

const audioListener = new THREE.AudioListener();


IDE.camera.add(audioListener);

const sound = new THREE.Audio(audioListener);

audioLoader.load(ost, function(buffer){
	sound.setBuffer(buffer);
	sound.setLoop(true);
	sound.setVolume(0.5);
	sound.pause();
});

IDE.add(sound);

const gameSettings = {
	speed: 50
};

gui.add(gameSettings, "speed", 0, 200).onChange((e) => {
	speed = e;
});


socket.on("startGame", (data)=>{
	startGame = true;

	progressBarContainer.style.display = 'none';
	socket.on("initPlayer", (pos)=>{
		player.setPos(pos.x, pos.y, pos.z);
	});
	player.addControle(document);
	opponent.receiveMoves(socket);
	IDE.add(GameSetGroup);
});
// direction = new THREE.Vector3(...randomDirection(- Math.PI / 6, Math.PI / 6)).normalize();

let axis = new THREE.Vector3(0,1,0);
const quaternion = new THREE.Quaternion().setFromAxisAngle(axis, THREE.MathUtils.degToRad(10));

let clock = new THREE.Clock();


socket.on('ballMove', (data)=>{
	ball.position.copy(data.position);
});


function Gameloop() {
	IDE.render();
	if (startGame){	
		player.updateMoves(socket);	
		// totate the ball
		ball.rotation.x += 0.01;
		ball.rotation.y += 0.01;
	}
}



IDE.renderer.setAnimationLoop(Gameloop);
