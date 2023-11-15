import SceneIDE from "./scene";
import Paddle from "./paddles";
import * as THREE from 'three';
import * as dat from 'dat.gui';
import sky from  "../imgs/sky.jpg";
import Paddle from "./paddles";
import stars from "../imgs/stars.jpg"
import {RGBELoader} from "three/examples/jsm/loaders/RGBELoader.js";

const venice = new URL('../imgs/adt.hdr',import.meta.url);

const option = {
	showHelpers: true,
	lightINternsity: 0.75,

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


const progressBar = document.getElementById("progress-bar");
const progressBarContainer = document.querySelector(".loading-screen");
const loadManager = new THREE.LoadingManager();

loadManager.onProgress = (url, item, total)=>{
	progressBar.value = (item / total) * 100;
};

loadManager.onLoad = () =>{
	progressBarContainer.style.display = 'none';
};

const HDRILoader = new RGBELoader(loadManager);


const IDE= new SceneIDE();
const gui = new dat.GUI();


IDE.init(document.getElementById("scene-container"));


HDRILoader.load(venice, function(t){
	t.mapping = THREE.EquirectangularReflectionMapping;
	IDE.scene.background = t;

})
IDE.SetBackground([
	stars,
	stars,
	stars,
	stars,
	stars,
	stars,
], new THREE.CubeTextureLoader (loadManager));



IDE.addGui(gui, option)



//sphere 
const sphere_geo = new THREE.SphereGeometry(2,32,64); 
const sphere_mat = new THREE.MeshStandardMaterial( { 
	color: 0xffffff,
	map: new THREE.TextureLoader(loadManager).load(sky)
 } ); 
const sphere = new THREE.Mesh( sphere_geo, sphere_mat ); 

sphere.position.set(0,3,0);
sphere.castShadow = true;

IDE.add(sphere);



// game arena

const arena_geo = new THREE.PlaneGeometry(100,100);
const  arena_mat =  new THREE.MeshStandardMaterial({color : 0xFF0000});
const arena = new  THREE.Mesh(arena_geo, arena_mat);
// arena.geometry.scale(10,10);
arena.rotation.x = (- Math.PI / 2)
arena.position.y = 1 ;
arena.receiveShadow = true;
IDE.add(arena);



// ! players
const paddle_generator = new Paddle();
const palyer1 = paddle_generator.clone();
const palyer2 = paddle_generator.clone();

palyer1.setPos(-52, 2, -10);
palyer2.setPos(49, 2, -10);


palyer1.addGui(gui, "player1");
palyer2.addGui(gui, "player2");

IDE.add(palyer1.body , palyer2.body);








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

window.addEventListener("resize", ()=>{
	IDE.updateCanvas();
});



function Gameloop() {
	IDE.render();
}

IDE.renderer.setAnimationLoop(Gameloop);
	
