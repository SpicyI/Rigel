import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';



/**
 * 
 */
export class SceneIDE{

    public scene: THREE.Scene;
    public camera: THREE.PerspectiveCamera;
    public renderer: THREE.WebGLRenderer;	
    public orbit: OrbitControls;
    public light: THREE.DirectionalLight;
    public plane: THREE.Mesh;
    public grid: THREE.GridHelper;
    public axes: THREE.AxesHelper;
    public onRender: boolean;
    public showHelpers: boolean;
    public windowScale: number;
    public helpersVisible: boolean;


    private resizeWindowListener: EventListener;

    /**
     * setup a environment for the game, sets the camera, renderer, scene, orbit, light.
     * 
     */
	constructor()
	{
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
		this.renderer = new THREE.WebGLRenderer();
		this.grid = new THREE.GridHelper(100000,1000, 125, 0);
		this.axes = new THREE.AxesHelper(5);

		// this.orbit = null;
		// this.light = undefined;
		// this.plane = undefined;

		this.helpersVisible = true;
		this.onRender = false;
		this.showHelpers = true;
		this.windowScale = 0;


		this.scene.add(this.axes);
		this.scene.add(this.grid);

		// this.IDESettings = undefined;


		// this.scene.fog = new THREE.Fog( 0x888b8e, 0, 750 );
        this.resizeWindowListener = () => {
            this.updateCanvas();
        }
		window.addEventListener("resize", this.resizeWindowListener);


	}

    /**
     * toggle the visibility of the helpers
     */
	public activeHelpers(){
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

		this.activeHelpers();

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
		this.renderer.render(this.scene, this.camera);
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

		this.light = new THREE.DirectionalLight( 0xffffff, 0.75 );
		this.EnabledShadows();
		this.light.castShadow = true;
		this.light.position.set(100,100,0);

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

		this.grid.dispose();
		this.axes.dispose();
		
		this.renderer.domElement.parentNode?.removeChild(this.renderer.domElement);
		this.renderer.dispose();

	}
}

export default SceneIDE;
