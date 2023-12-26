import { Socket } from 'socket.io-client';
import * as THREE from 'three';

/**
 * Represents the game arena.
 */
export class Arena {
    public size: number;
    public aspect: number;
    public width: number;
    public height: number;
    public body: THREE.Object3D;
    public position: THREE.Vector3;

    /**
     * Creates a new instance of the Arena class.
     * @param {number} size - The size of the arena.
     * @param {number} aspect - The aspect ratio of the arena.
     */
    constructor(size: number = 200, aspect: number = 3/4) {
        this.size = size;
        this.aspect = aspect;
        this.width = size;
        this.height = size * aspect;

        this.body = new THREE.Object3D();
        this.body.rotation.x = (- Math.PI / 2);
        this.body.position.y = 0.001;
        this.body.receiveShadow = true;
        this.position = this.body.position;
    }

    public dispose(){
        this.position = null;
    
    }
}

const keyCodes = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    32: 'space',
    16: 'shift',
    13: 'enter',
    27: 'escape',
    65: 'a',
    68: 'd',
    87: 'w',
    83: 's'
};

const keyStates = {
    left: false,
    up: false,
    right: false,
    down: false,
    space: false,
    shift: false,
    enter: false,
    escape: false,
    a: false,
    d: false,
    w: false,
    s: false
};



/**
 * Represents the Controls class that handles keyboard input and state.
 * @class
 */
export class Controls {
    /**
     * A map that stores the key codes and their corresponding key names.
     */
    public keys: Map<number, string>;

    /**
     * A map that stores the key names and their corresponding state (true/false).
     */
    public state: Map<string, boolean>;

    /**
     * Constructs a new instance of the Controls class.
     */
    constructor() {
        this.keys = new Map();
        Object.entries(keyCodes).forEach(([key, value]) => {
            this.keys.set(parseInt(key), value);
        });

        // console.log(this.keys);

        this.state = new Map();
        Object.entries(keyStates).forEach(([key, value]) => {
            this.state.set(key, value);
        });
    }

    /**
     * Handles the key down event and updates the state of the corresponding key.
     * @param e The KeyboardEvent object representing the key down event.
     */
    public OnkeyDown(e: KeyboardEvent) {
        // console.log(e.key);
        if (this.state.has(e.key))
            this.state.set(e.key, true);
    }

    /**
     * Handles the key up event and updates the state of the corresponding key.
     * @param e The KeyboardEvent object representing the key up event.
     */
    public OnkeyUP(e: KeyboardEvent) {
        // console.log(e.key);
        if (this.state.has(e.key))
            this.state.set(e.key, false);
    }

    /**
     * Gets the state of a specific key.
     * @param key The key name.
     * @returns {boolean}The state of the key (true/false).
     */
    public getKeySatate(key: string): boolean {

        // console.log(`state for key ${key}: ${this.state.get(key)}`);
        return this.state.get(key);
    }

    public dispose(){
        this.keys.clear();
        this.state.clear();

        this.keys = null;
        this.state = null;
    }
}

export type extrudeSettings = {
    steps: number,
    depth: number,
    bevelEnabled: boolean,
    bevelThickness: number,
    bevelSize: number,
    bevelOffset: number,
    bevelSegments: number
}

function defaultExtrudeSettings(): extrudeSettings{
    const settings = {
        steps: 20,
        depth: 20,
        bevelEnabled: true,
        bevelThickness: 2,
        bevelSize: 1,
        bevelOffset: 0,
        bevelSegments: 200
    };
    return settings
}



/**
 * Represents a Paddle object in the game.
 * @class
 */
export class Paddle
{
    public extrudeSettings: extrudeSettings;
    public width: number;
    public length: number;
    public geometry: THREE.ExtrudeGeometry;
    public material: THREE.MeshStandardMaterial;
    public body: THREE.Mesh;
    public center: THREE.Object3D;
    public position: THREE.Vector3;
    public rotation: THREE.Euler;
    public depth: number;
    public controls: Controls;
    public shape: THREE.Shape;
    /**
     * The reference to the arena the paddle belongs to.
     */
    public arenaRef: Arena;
    /**
     * The side of the arena the paddle is on.
     */
    public side: string;
    /**
     * The control set for the paddle.
     */
    public controlSet: {up: string, down: string};

    /**
     * Creates a new Paddle object.
     * @param extrudeSettings The extrude settings for the paddle.
     * @param width The width of the paddle.
     * @param length The length of the paddle.
     * @param clr The color of the paddle.
     */
    constructor( extrudeSettings = defaultExtrudeSettings(), width = 1, length = 3, clr = 0xff00ff){

        this.shape = this.createPaddleShape(length, width);

        this.extrudeSettings = extrudeSettings;
        this.width = width;
        this.length = length;
        this.depth = extrudeSettings.depth / 2;
        this.controls = new Controls();
        
        
        // this.geometry = new THREE.ExtrudeGeometry(this.shape,  extrudeSettings);
        // this.material = new THREE.MeshStandardMaterial({color: clr});
        // this.body = new THREE.Mesh(this.geometry, this.material);
        
        // this.body.position.z = -(this.extrudeSettings.depth / 2);
        // this.body.position.y = this.extrudeSettings.bevelSize;
        // this.body.position.x =  -(this.length / 2)
        // this.body.castShadow = true;
        
        
        
        this.center = new THREE.Object3D();
        this.center.position.set(0, 0, 0);
        // this.center.add(this.body);

        
        this.position = this.center.position;
        this.rotation = this.center.rotation;
        
    }

    /**
     * Creates the shape of the paddle.
     * @param length The length of the paddle.
     * @param width The width of the paddle.
     * @returns The shape of the paddle.
     */
    private createPaddleShape(length: number, width: number){
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(0, width);
        shape.lineTo(length, width);
        shape.lineTo(length, 0);
        shape.lineTo(0, 0);
        
        return shape;
    }

    /**
     * Clones the paddle with a new color.
     * @param color The color of the cloned paddle.
     * @returns} The cloned paddle.
     */
    public clone(color: number = 0xff00ff): Paddle
    {
        return new Paddle(this.extrudeSettings, this.width , this.length, color);
    }

    /**
     * Sets the position of the paddle.
     * @param x The x-coordinate of the position.
     * @param y The y-coordinate of the position.
     * @param z The z-coordinate of the position.
     */
    public setPos(x: number = 0, y: number = 0 , z: number = 0){
        this.center.position.set(x, y, z);
    }

    /**
        update the extrude settings of the paddle, and update the paddle gemoetry according to the new 
        extrude settings. 
        @param extrudeSettings The new extrude settings.
    */
    public updateExtrude(extrudeSettings: extrudeSettings)
    {
        if (extrudeSettings)
        {
            this.extrudeSettings = extrudeSettings;
            this.depth = extrudeSettings.depth / 2;
            // this.body.position.z = -(this.extrudeSettings.depth / 2);

            // this.body.geometry.dispose();
            // this.geometry.dispose();

            // this.shape = this.createPaddleShape(this.length,this.width);
            // this.geometry = new THREE.ExtrudeGeometry(this.shape,  extrudeSettings);
            // this.body.geometry = this.geometry;
        }
    }

    /**
     * Sets the shadows of the paddle.
     * @param cast Whether the paddle should cast shadows.
     * @param receive Whether the paddle should receive shadows.
     */

    public setShadows(cast: boolean = false, receive: boolean = false)
    {
        // this.body.castShadow = cast;
        // this.body.receiveShadow = receive;
    }


    private extrudeFolder: any;
    /**
     * deprecated gui function
     * add a gui to the paddle to control the extrude settings from UI.
     * @param newGui
     * @param name
     * @deprecated
     * 
     */
    addGui(newGui: any, name: string = 'Paddle')
    {
        if (this.extrudeFolder)
            return ;
        this.extrudeFolder = newGui.addFolder(`[${name}]: Extrude Settings`);
        this.extrudeFolder.add(this.extrudeSettings, 'steps', 0, 10, 1).onChange(e => { this.updateExtrude(this.extrudeSettings)});
        this.extrudeFolder.add(this.extrudeSettings, 'depth', 1, 200).onChange(e => { this.updateExtrude(this.extrudeSettings)});
        this.extrudeFolder.add(this.extrudeSettings, 'bevelEnabled').onChange(e => { this.updateExtrude(this.extrudeSettings)});
        this.extrudeFolder.add(this.extrudeSettings, 'bevelThickness', 1, 5).onChange(e => { this.updateExtrude(this.extrudeSettings)});
        this.extrudeFolder.add(this.extrudeSettings, 'bevelSize', 0, 5).onChange(e => { this.updateExtrude(this.extrudeSettings)});
        this.extrudeFolder.add(this.extrudeSettings, 'bevelOffset', -4, 5).onChange(e => { this.updateExtrude(this.extrudeSettings)});
        this.extrudeFolder.add(this.extrudeSettings, 'bevelSegments', 0, 20, 1).onChange(e => { this.updateExtrude(this.extrudeSettings)});
        // delete extrudeFolder;
        
    }

    /**
     * add a reference to the arena the paddle belongs to.
     * @param arena The arena the paddle belongs to.
     */
    public addArena(arena: Arena){
        this.arenaRef = arena;
    }

    /**
     * set the side of the arena the paddle is on.
     * @param side The side of the arena the paddle is on.
     * @deprecated
     */
    public setSide(side: string = 'right'){

        // const  x: number =  arena.position.x + (side === 'left' ? -arena.size / 2 : arena.size / 2); 
        // const  z: number = arena.position.z;
        // const  y: number = arena.position.y;

        // this.center.position.set(x, y, z);
        this.side = side;
        // this.addArena(arena);
    }

    private keydownListener: EventListener;
    private keyupListener: EventListener;

    /**
     * add keyboard controls to the paddle.
     * @param element The element to add the keyboard controls to.
     * @param controlSet The control set to use for the paddle.
     */
    public addControle(element: HTMLElement, controlSet = {up: 'd', down: 'a'}) {
        this.controlSet = controlSet;

        this.keydownListener = (e) => { this.controls.OnkeyDown(e as KeyboardEvent) };
        this.keyupListener = (e) => { this.controls.OnkeyUP(e as KeyboardEvent) };

        document.addEventListener('keydown', this.keydownListener);
        document.addEventListener('keyup', this.keyupListener);
    }

    public setControlSet(controlSet: {up: string, down: string}){
        this.controlSet = controlSet;
    }

    /**
     * remove the keyboard controls from the paddle.
    */
    public removeControle() {
        document.removeEventListener('keydown', this.keydownListener);
        document.removeEventListener('keyup', this.keyupListener);
    }

    /**
     * update the position of the paddle according to the keyboard input.
     * emit the new position to the server.
     * @param socket The socket to emit the new position to.
     */
    public updateMoves(socket: Socket){
        const speed: number = 2;


        let up: boolean = this.controls.getKeySatate(this.controlSet.up);
        let down: boolean = this.controls.getKeySatate(this.controlSet.down);

        if (up === undefined || down === undefined)
            return ;
        else if (up){
            let upperEdge: number = this.center.position.z - this.extrudeSettings.depth / 2;
            if (upperEdge - speed >= this.arenaRef.height / -2){
                this.center.position.z -= speed;
                socket.emit('playerMove', {position: this.center.position, rotation: this.center.rotation});
            }
        }
        else if (down)
        {
            let lowerEdge: number = this.center.position.z + this.extrudeSettings.depth / 2;
            if (lowerEdge + speed <= (this.arenaRef.height / 2)){
                this.center.position.z += speed;
                socket.emit('playerMove', {position: this.center.position, rotation: this.center.rotation});
            }
        }
    }
    
    /**
     * test the moves of the paddle without emitting the new position to the server.
     * this is used for testing purposes only.
     */
    public testMoves(){
        const speed: number = 2;
        // console.log(this.controlSet.up, this.controlSet.down);
        
        let up: boolean = this.controls.getKeySatate(this.controlSet.up);
        let down: boolean = this.controls.getKeySatate(this.controlSet.down);

        // console.log(up, down);
        if (up === undefined || down === undefined)
            return ;

        else if (up){
            let upperEdge: number = this.center.position.z - this.extrudeSettings.depth / 2;
            if (upperEdge - speed >= this.arenaRef.height / -2){
                this.center.position.z -= speed;
            }
        }
        else if (down)
        {
            let lowerEdge: number = this.center.position.z + this.extrudeSettings.depth / 2;
            if (lowerEdge + speed <= (this.arenaRef.height / 2)){
                this.center.position.z += speed;
            }
        }      
    }


    /**
     * receive the new position of the paddle from the server and updates it accordinly.
     * @param socket The socket to receive the new position from.
     */
    public receiveMoves(socket: Socket){
        socket.on('playerMove', (data)=>{
            // this.center.position.set(data.position.x, data.position.y, data.position.z);
            this.center.position.lerp(new THREE.Vector3(data.position.x, data.position.y, data.position.z), 0.05);
        });
    }

    public dispose(){
        this.removeControle();
        // this.geometry.dispose();
        // this.material.dispose();
        // this.center.remove(this.body);
        this.controls.dispose();

        this.extrudeSettings = null;
        this.rotation = null;
        this.center = null;
        // this.body = null;
        this.controls = null;
        this.shape = null;
        this.arenaRef = null;
        this.controlSet = null;
    }

    // checkCollision(ball){
    //     let minX = this.center.position.x - this.length / 2;
    //     let minZ = this.center.position.z - this.depth - this.extrudeSettings.bevelThickness;

    //     let maxX = this.center.position.x + this.length / 2;
    //     let maxZ = this.center.position.z + this.depth + this.extrudeSettings.bevelThickness;
        
    //     let ballX = ball.position.x;
    //     let ballZ = ball.position.z;

    //     if (ballX > minX && ballX < maxX && ballZ > minZ && ballZ < maxZ)
    //         return true;
    //     return false;
    // }

}

export class Ball {
    private reduis: number;
    // private geometry: THREE.SphereGeometry;
    // private material: THREE.MeshStandardMaterial;
    public body : THREE.Object3D;

    constructor(reduis: number = 1, color: number = 0xff0000){
        this.reduis = reduis;
        // this.geometry = new THREE.SphereGeometry(this.reduis, 32, 64);
        // this.material = new THREE.MeshStandardMaterial({color: color});
        // this.body = new THREE.Mesh(this.geometry, this.material);
        this.body = new THREE.Object3D();
        this.body.castShadow = true;
    }

    public setPos(x: number = 0, y: number = 0, z: number = 0){
        this.body.position.set(x, y, z);
    }

    public  receiveMoves(socket: Socket){
        socket.on('ballMove', (data)=>{
            // this.body.position.copy(data.position);
            this.body.position.lerp(new THREE.Vector3(data.position.x,data.position.y,data.position.z),0.05);
        });
    }

    public rotate(){
        // this.body.rotation.x += 0.01;
        this.body.rotation.y += 0.01;
    }

    public dispose(){
        // this.geometry.dispose();
        // this.material.dispose();
        this.body = null;
    }

}

export default{
    Arena,
    Paddle,
    Ball,
    Controls
}