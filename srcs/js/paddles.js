import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';


class Controls{
    constructor(){
        this.keys = {
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

        this.state = {
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
        this.mouse = {
            x: 0,
            y: 0
        };
        this.mouseClick = false;
    }


    OnkeyDown(e){
        if (this.keys[e.keyCode])
            this.state[this.keys[e.keyCode]] = true;
    }

    OnkeyUP(e){
        if (this.keys[e.keyCode])
            this.state[this.keys[e.keyCode]] = false;
    }
    
    OnMouseMove(e){
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
    }

    OnMouseClick(e){
        this.mouseClick = true;
    }


    getKeySatate(key){
        return this.state[key];
    }

};

class Paddle
{

    constructor( extrudeSettings = this.#defaultExtrudeSettings(), width = 1, length = 3, clr = 0xff00ff){

        let shape = this.#createPaddleShape(length, width);

        this.extrudeSettings = extrudeSettings;
        this.width = width;
        this.length = length;
        
        
        this.geometry = new THREE.ExtrudeGeometry(shape,  extrudeSettings);
        this.material = new THREE.MeshStandardMaterial({color: clr});
        this.body = new THREE.Mesh(this.geometry, this.material);
        
        this.body.castShadow = true;
        
        
        this.controls = new Controls();
        

        
        let g = new THREE.BoxGeometry(1,1,1);
        let m = new THREE.MeshStandardMaterial({color: 0x00ff00});
        this.vis = new THREE.Mesh(g, m);
        
        this.center = new THREE.Object3D();
        this.center.add(this.body, this.vis);

        this.body.position.z = -(this.extrudeSettings.depth / 2);
        this.body.position.y = this.extrudeSettings.bevelSize;
        this.body.position.x =  -(this.length / 2)
        this.vis.position.y = 4;
        
        this.position = this.center.position;
        this.rotation = this.center.rotation;
        this.depth = extrudeSettings.depth / 2;
        
        console.log(this.depth + this.extrudeSettings.bevelThickness);
        console.log(this.length / 2);
    }

    #defaultExtrudeSettings(){
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

    #createPaddleShape(length, width){
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(0, width);
        shape.lineTo(length, width);
        shape.lineTo(length, 0);
        shape.lineTo(0, 0);
        
        return shape;
    }


    clone(color)
    {
        return new Paddle(this.extrudeSettings, this.width , this.length, color);
    }

    setPos(x = 0, y = 0 , z = 0){
        this.center.position.set(x, y, z);
    }

    updateExtrude(extrudeSettings)
    {
        if (extrudeSettings)
        {
            delete this.body.geometry;
            delete this.geometry;
            delete this.shape;

            this.shape = this.#createPaddleShape(this.length,this.width);
            this.geometry = new THREE.ExtrudeGeometry(this.shape,  extrudeSettings);

            this.body.geometry = this.geometry;
            this.extrudeSettings = extrudeSettings;

            this.depth = extrudeSettings.depth / 2;
            this.body.position.z = -(this.extrudeSettings.depth / 2);

        }
    }

    setShadows(cast = false, receive = false)
    {
        this.body.castShadow = cast;
        this.body.receiveShadow = receive;
    }

    addGui(newGui, name = 'Paddle')
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

    addArena(arena){
        this.arenaRef = arena;
    }

    setSide(arena, side = 'right'){

        const  x =  arena.position.x + (side === 'left' ? -arena.size / 2 : arena.size / 2); 
        const  z = arena.position.z;
        const  y = arena.position.y;

        this.center.position.set(x, y, z);
        this.side = side;
        this.arenaRef = arena;
    }

    addControle(element, controlSet = {up: 'd', down: 'a'}){
        
        this.controlSet = controlSet;

        element.addEventListener('keydown', (e) => {this.controls.OnkeyDown(e)});
        element.addEventListener('keyup', (e) => {this.controls.OnkeyUP(e)});
        element.addEventListener('mousemove', (e) => {this.controls.OnMouseMove(e)});
        element.addEventListener('click', (e) => {this.controls.OnMouseClick(e)});
    }

    updateMoves(socket){
        const speed = 2;

        let up  = this.controls.getKeySatate(this.controlSet.up);
        let down = this.controls.getKeySatate(this.controlSet.down);

        if (up === undefined || down === undefined)
            return ;
        else if (up){
            let upperEdge = this.center.position.z - this.extrudeSettings.depth / 2;
            if (upperEdge - speed >= this.arenaRef.height / -2){
                this.center.position.z -= speed;
                socket.emit('playerMove', {position: this.center.position, rotation: this.center.rotation});
            }
        }
        else if (down)
        {
            let lowerEdge = this.center.position.z + this.extrudeSettings.depth / 2;
            if (lowerEdge + speed <= (this.arenaRef.height / 2)){
                this.center.position.z += speed;
                socket.emit('playerMove', {position: this.center.position, rotation: this.center.rotation});
            }
        }
    }

    receiveMoves(socket){
        socket.on('playerMove', (data)=>{
            this.center.position.set(data.position.x, data.position.y, data.position.z);
        });
    }
    checkCollision(ball){
        let minX = this.center.position.x - this.length / 2;
        let minZ = this.center.position.z - this.depth - this.extrudeSettings.bevelThickness;

        let maxX = this.center.position.x + this.length / 2;
        let maxZ = this.center.position.z + this.depth + this.extrudeSettings.bevelThickness;
        
        let ballX = ball.position.x;
        let ballZ = ball.position.z;

        if (ballX > minX && ballX < maxX && ballZ > minZ && ballZ < maxZ)
            return true;
        return false;
    }
    

}

export default Paddle;