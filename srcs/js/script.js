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






//sphere 
const sphere_geo = new THREE.SphereGeometry(2,32,64); 
const sphere_mat = new THREE.MeshStandardMaterial( { 
	color: 0xffffff,
	map: TextureLoader.load(sky)
 } ); 
const sphere = new THREE.Mesh( sphere_geo, sphere_mat ); 

sphere.position.set(0,3,0);
sphere.castShadow = true;

GameSetGroup.add(sphere);


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
// player2.addControle(document);

GameSetGroup.add(player1.body, player2.body);

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
	
	
	document.addEventListener("click", function(){
			if (sound.isPlaying){
		return;
	}
	else{
			sound.play();
		}
	});
	
	
	
	// const step = 2;
	
	// const canvas = document.getElementById("c");
	
	// document.addEventListener("keydown", function(event){
		// 	if (event.key == "ArrowUp")
		// 	{
			// 		paddle1.position.z -= step;
			// 	}
			// 	else if (event.key == "ArrowDown"){
				// 		paddle1.position.z += step;	
				// 	}
				// });
				
				
function Gameloop() {
	IDE.render();
	player1.updateMoves();
	player2.updateMoves();

	const movement = new THREE.Vector3(0.1, 0, 3);
	sphere.position.add(movement);
	
}

IDE.renderer.setAnimationLoop(Gameloop);
				
				