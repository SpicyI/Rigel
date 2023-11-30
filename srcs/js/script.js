import SceneIDE from "./scene";
import Paddle from "./paddles";
import Arena from "./arena";

import * as THREE from 'three';
import * as dat from 'dat.gui';

import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

import sky from "../imgs/sky.jpg";
import stars from "../imgs/stars.jpg";

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


const progressBar = document.getElementById("progress-bar");
const progressBarContainer = document.querySelector(".loading-screen");

const loadManager = new THREE.LoadingManager();
loadManager.onProgress = (url, item, total)=>{
	progressBar.value = (item / total) * 100;
};
loadManager.onLoad = () =>{
	progressBarContainer.style.display = 'none';
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

// HDRILoader.load(skybox, function(t){
// 	t.mapping = THREE.EquirectangularReflectionMapping;
// 	IDE.scene.background = t;
// });


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
const player1 = paddle_generator.clone();
const player2 = paddle_generator.clone();


player1.setSide(game_arena, "left");
player2.setSide(game_arena, "right");

player1.addGui(gui, "player1");
player2.addGui(gui, "player2");

player1.addControle(document);
player2.addControle(document, {up: "left", down: "right"});

GameSetGroup.add(player1.center, player2.center);

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
	
	
// document.addEventListener("click", function(){
// 	if (sound.isPlaying){
// 		return;
// 	}
// 	else{
// 		sound.play();
// 	}
// });
				
let direction;

document.addEventListener("keydown", function(event){
	if (event.code == "KeyP")
	{
		console.log("pause");
		let pos = new THREE.Vector3(0,3,0);
		ball.position.copy(pos);
	}
});

const gameplay = {
	speed: 1
};

gui.add(gameplay, "speed", 0, 200).onChange((e) => {
	speed = e;
});


// direction = new THREE.Vector3(...randomDirection(- Math.PI / 6, Math.PI / 6)).normalize();
direction = new THREE.Vector3(2,0,0).normalize();

let axis = new THREE.Vector3(0,1,0);
const quaternion = new THREE.Quaternion().setFromAxisAngle(axis, THREE.MathUtils.degToRad(10));

let clock = new THREE.Clock();

function Gameloop() {
	IDE.render();
	player1.updateMoves();
	player2.updateMoves();

	// check if ball is out of the arena
	let raduisx = ballReduis * (direction.z / Math.abs(direction.z));
	let raduisz = ballReduis * (direction.x / Math.abs(direction.x));
	// bouncing on the walls
	if (ball.position.z + raduisx > game_arena.height / 2 || ball.position.z + raduisx < - game_arena.height / 2)
		direction.z *= -1;

	if (player1.checkCollision(ball)){
		if (ball.position.z > player1.center.position.z){
			direction.applyQuaternion(quaternion);
			direction.x *= -1;
		}
		else if (ball.position.z < player1.center.position.z){
			direction.x *= -1;
			direction.applyQuaternion(quaternion);
		}
		else{
			direction.x *= -1;
		}
	}
	else if (player2.checkCollision(ball)){
		if (ball.position.z > player2.center.position.z){
			direction.x *= -1;
			direction.applyQuaternion(quaternion);
		}
		else if (ball.position.z < player2.center.position.z){
			direction.applyQuaternion(quaternion);
			direction.x *= -1;
		}
		else{
			direction.x *= -1;
		}
	}
	// if ball is out of the arena
	if (ball.position.x  > game_arena.width / 2 || ball.position.x  < - game_arena.width / 2)
	{
		direction = new THREE.Vector3(...randomDirection(- Math.PI / 6, Math.PI / 6)).normalize();
		ball.position.set(0,3,0);
	}

	let deltaTime = clock.getDelta();
	ball.position.add(direction.clone().multiplyScalar(gameplay.speed * deltaTime));
	// totate the ball
	ball.rotation.x += 0.01;
	ball.rotation.y += 0.01;
}

IDE.renderer.setAnimationLoop(Gameloop);
				
				