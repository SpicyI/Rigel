import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui'
import sky from  "../imgs/sky.jpg"



class SceneIDE{
	constructor()
	{
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
		this.renderer = new THREE.WebGLRenderer();
		this.grid = new THREE.GridHelper(100000,1000, 125, 0);
		this.axes = new THREE.AxesHelper(5);
		// set the axes size to 10
		this.axes.scale.set(10,10,10);
		this.orbit = undefined;
		this.light = undefined;
		this.plane = undefined;

		this.onRender = false;
		this.showHelpers = true;
		let helpersVisible = true;
		this.windowScale = 0;


		this.scene.add(this.axes);
		this.scene.add(this.grid);

		this.IDESettings = undefined;


	}


	activeHelpers(){
		if (this.showHelpers && !this.helpersVisible)
		{
			this.scene.add(this.axes);
			this.scene.add(this.grid);
			this.helpersVisible = true;
		}
		else if (!this.showHelpers && this.helpersVisible)
		{
			this.scene.remove(this.axes);
			this.scene.remove(this.grid);
			this.helpersVisible = false;
		}
	}

	add(...objects) {
		objects.forEach(object => {
			this.scene.add(object);
		});
	}

	SetBackground(background, loader = 0) {
		if(loader)
			this.scene.background = loader.load(background);
		else
			this.scene.background =  new THREE.TextureLoader().load(background);
	}

	EnabledShadows(){
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
	}

	init_render(element , ViewPointPercentage = 100){
		
		if (this.onRender)
			return ;

		if (ViewPointPercentage > 100)
			ViewPointPercentage = 100;
		else if (ViewPointPercentage < 0)
			ViewPointPercentage = 0;

		const height = window.innerHeight - (window.innerHeight * (100 - ViewPointPercentage)/ 100);
		const width = window.innerWidth - (window.innerWidth * (100 - ViewPointPercentage)/ 100);

		this.activeHelpers();

		this.renderer.setSize(width, height);
		element.appendChild(this.renderer.domElement);
		this.renderer.render(this.scene, this.camera);

		this.onRender = true;

		this.windowScale = (100 - ViewPointPercentage) / 100;
	}

	render(){
		this.activeHelpers();
		this.renderer.render(this.scene, this.camera);
	}

	init(element , scale = 100){

		this.SetBackground(sky);

		this.orbit = new OrbitControls(this.camera,this.renderer.domElement);

		this.light = new THREE.DirectionalLight( 0xffffff, 0.75 );
		this.EnabledShadows();
		this.light.castShadow = true;
		this.light.position.set(100,100);

		const plane_skeletone = new THREE.PlaneGeometry(1000,1000);
		const plane_skin = new THREE.MeshStandardMaterial(
			{
				color: 0x00FFff
			});
		this.plane = new THREE.Mesh(plane_skeletone,plane_skin);
		this.plane.rotation.x = (-Math.PI / 2) ;
		this.plane.receiveShadow = true;

		this.camera.position.set(0, 20,50);
		this.camera.lookAt(new THREE.Vector3(0, 0, 0));

		this.add(this.light);
		this.init_render(element, scale);
			
	}

	addGui(newGui, options)
    {
        this.IDESettings = newGui.addFolder("IDE Settings");

        this.IDESettings.add(options,'showHelpers').onChange(e => {
            this.showHelpers = e;
        });
        
        this.IDESettings.add(options,'lightINternsity', 0 , 10).onChange(e => {
            this.light.intensity = e;
        });

    }

	// Update canvas size based on window dimensions
	updateCanvas(scale = 100) {


		this.windowScale  = (100 - scale) / 100;

		const width = window.innerWidth - (window.innerWidth * this.windowScale);
		const height = window.innerHeight - (window.innerHeight * this.windowScale);
		
	
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		
		this.renderer.setSize(width, height);
	}

}

export default SceneIDE;

