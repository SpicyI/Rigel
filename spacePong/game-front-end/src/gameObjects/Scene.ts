import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import { Controls } from './objects';


/**
 * 
 */
export class SceneIDE{

    public scene: THREE.Scene;
    public camera: THREE.PerspectiveCamera;
    public renderer: THREE.WebGLRenderer;	
    public orbit: OrbitControls;
    public light: THREE.SpotLight;
    public plane: THREE.Mesh;

    public onRender: boolean;
    public showHelpers: boolean;
    public windowScale: number;
    public helpersVisible: boolean;
	private controls: Controls;

    private resizeWindowListener: EventListener;

    /**
     * setup a environment for the game, sets the camera, renderer, scene, orbit, light.
     * 
     */
	constructor()
	{
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);
		this.scene.add(this.camera);
		this.renderer = new THREE.WebGLRenderer();
		this.controls = new Controls();


		// this.orbit = null;
		// this.light = undefined;
		// this.plane = undefined;

		this.helpersVisible = true;
		this.onRender = false;
		this.showHelpers = true;
		this.windowScale = 0;




		// this.IDESettings = undefined;

		// this.renderer.outputEncoding = THREE.sRGBEncoding;
		this.renderer.outputColorSpace = THREE.SRGBColorSpace;
		this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
		this.renderer.toneMappingExposure = 1.5;

		// this.scene.fog = new THREE.Fog( 0x888b8e, 0, 750 );
        this.resizeWindowListener = () => {
            this.updateCanvas();
        }
		window.addEventListener("resize", this.resizeWindowListener);


	}

    /**
     * toggle the visibility of the helpers
     */

    /**
     * add objects to the scene as children
     * @param objects
     */
	public add(...objects: THREE.Object3D[]) {
		objects.forEach(object => {
			this.scene.add(object);
		});
	}

    /**
     * remove objects from the scene
     * @param backgroundPath path to the background image (jpg, png, etc)
	 * @param loader texture loader
     */
	public SetBackground(backgroundPath: string, loader: THREE.TextureLoader | null = null) {
		if(loader)
			this.scene.background = loader.load(backgroundPath);
		else
		{
			loader = new THREE.TextureLoader();
			this.scene.background = loader.load(backgroundPath);
		}
	}
    /**
     *  enable shadows in the scene environment
     */
	public EnabledShadows(){
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
	}

	/**
	 * 	initalize the render of the scene and add it to the element container
	 * @param element 
	 * @param ViewPointPercentage 
	 */
	private init_render(element: HTMLElement , ViewPointPercentage:number = 100){
		
		if (this.onRender)
			return ;

		if (ViewPointPercentage > 100)
			ViewPointPercentage = 100;
		else if (ViewPointPercentage < 0)
			ViewPointPercentage = 0;

		const height: number = window.innerHeight - (window.innerHeight * (100 - ViewPointPercentage)/ 100);
		const width: number = window.innerWidth - (window.innerWidth * (100 - ViewPointPercentage)/ 100);


		this.renderer.setSize(width, height);
		element.appendChild(this.renderer.domElement);
		this.renderer.render(this.scene, this.camera);

		this.onRender = true;

		this.windowScale = (100 - ViewPointPercentage) / 100;
	}

    
    /**
     * render the scene to the canvas
    */
	render(){
		// this.activeHelpers();
		this.updatePov();
		this.renderer.render(this.scene, this.camera);
	}


	updatePov(){
		// console.log(this.controls.getKeySatate("1"));
		if (this.controls.getKeySatate('1')){
			this.camera.position.set(0, 80, 150);
			this.camera.lookAt(new THREE.Vector3(0, 0, 0));
			this.orbit.update();
		}
		else if (this.controls.getKeySatate('2')){
			this.camera.position.set(0, 80, -150);
			this.camera.lookAt(new THREE.Vector3(0, 0, 0));
			this.orbit.update();
		}
		else if (this.controls.getKeySatate('3')){
			this.camera.position.set(0, 150, 0);
			this.camera.lookAt(new THREE.Vector3(0, 0, 0));
			this.orbit.update();
		}
		
	}

	private keyDownListener: EventListener;
	private keyUpListener: EventListener;
	/**
	 * initailize the controls
	 */
	initControls(){
		this.keyDownListener = (e) => { this.controls.OnkeyDown(e as KeyboardEvent) };
        this.keyUpListener = (e) => { this.controls.OnkeyUP(e as KeyboardEvent) };
		document.addEventListener("keydown", this.keyDownListener);
		document.addEventListener("keyup", this.keyUpListener);
	}


	private plane_geometry: THREE.PlaneGeometry;
	private plane_material: THREE.MeshStandardMaterial;
	/**
	 * initailize the scene environment
	 * @param element element to add the canvas
	 * @param scale scale of the canvas
	 */
	init(element: HTMLElement , scale: number = 100){

		this.SetBackground("../../assets/sky.jpg");

		this.orbit = new OrbitControls(this.camera,this.renderer.domElement);

		this.light = new THREE.SpotLight( 0xffffff, 2);
		this.light.position.set( 2.5, 500, 2.5 );
		this.light.angle = Math.PI / 6;
		this.light.penumbra = 1;
		this.light.decay = 0;
		this.light.distance = 0;

		this.light.castShadow = true;
		this.light.shadow.mapSize.width = 10024;
		this.light.shadow.mapSize.height = 10024;
		this.light.shadow.camera.near = 1;
		this.light.shadow.camera.far = 10000;
		this.light.shadow.focus = 1;

		let lighthelper = new THREE.SpotLightHelper( this.light );
		this.scene.add( lighthelper );

		let cube = new THREE.Mesh( new THREE.BoxGeometry( 1, 1, 1 ), new THREE.MeshStandardMaterial( { color: 0x0000ff } ) );
		cube.position.set(0,3,0);
		cube.castShadow = true;
		cube.receiveShadow = true;
		this.scene.add( cube );
		
		this.EnabledShadows();

		this.plane_geometry = new THREE.PlaneGeometry(1000,1000);
		this.plane_material = new THREE.MeshStandardMaterial(
			{
				color: 0x00FFff
			});
		this.plane = new THREE.Mesh(this.plane_geometry,this.plane_material);
		this.plane.rotation.x = (-Math.PI / 2) ;
		this.plane.receiveShadow = true;

		this.camera.position.set(0, 50, 150);
		this.camera.lookAt(new THREE.Vector3(0, 0, 0));

		this.add(this.light);
		this.initControls();
		this.init_render(element, scale);
				
		}

	// addGui(newGui, options)
    // {
    //     this.IDESettings = newGui.addFolder("IDE Settings");

    //     this.IDESettings.add(options,'showHelpers').onChange(e => {
    //         this.showHelpers = e;
    //     });
        
    //     this.IDESettings.add(options,'lightINternsity', 0 , 10).onChange(e => {
    //         this.light.intensity = e;
    //     });

	// 	this.IDESettings.add(options,'axesScale').onChange(e => {
	// 		this.axes.scale.set(e,e,e);
	// 	});

    // }

    /**
     * update the canvas size
     * @param scale sacale of the canvas
     */
	public updateCanvas(scale:number = 100) {


		this.windowScale  = (100 - scale) / 100;

		const width: number = window.innerWidth - (window.innerWidth * this.windowScale);
		const height: number = window.innerHeight - (window.innerHeight * this.windowScale);
		
	
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		
		this.renderer.setSize(width, height);
	}

	/**
	 * dispose the scene
	 */
	public dispose(){
		window.removeEventListener("resize", this.resizeWindowListener);

		this.scene.children.forEach(child => {
			this.scene.remove(child);
		});
		this.orbit.dispose();
		this.light.dispose();
		
		this.plane_geometry.dispose();
		this.plane_material.dispose();

		
		this.renderer.domElement.parentNode?.removeChild(this.renderer.domElement);
		this.renderer.dispose();
		document.removeEventListener("keydown", this.keyDownListener);
		document.removeEventListener("keyup", this.keyUpListener);

	}
}

export default SceneIDE;
