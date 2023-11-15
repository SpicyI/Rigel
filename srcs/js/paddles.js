import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui'

class Paddle
{
    constructor( extrudeSettings = this.#defaultExtrudeSettings(), width = 1, length = 3){

        let shape = this.#createPaddleShape(length, width);

        let extrudeFolder = undefined;

        this.extrudeSettings = extrudeSettings;
        this.width = width;
        this.length = length;


        this.geometry = new THREE.ExtrudeGeometry(shape,  extrudeSettings);
        this.material = new THREE.MeshStandardMaterial({color: 0xff00ff});
        this.body = new THREE.Mesh(this.geometry, this.material);

        this.body.castShadow = true;

    }

    #defaultExtrudeSettings(){
        const settings = {
            steps: 20,
            depth: 20,
            bevelEnabled: true,
            bevelThickness: 2,
            bevelSize: 1,
            bevelOffset: 0,
            bevelSegments: 2
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


    clone()
    {
        return new Paddle(this.extrudeSettings, this.width , this.length);
    }

    setPos(x = 0, y = 0 , z = 0){
        this.body.position.set(x, y, z);
    }

    updateExtrude(extrudeSettings)
    {
        if (extrudeSettings)
        {
            delete this.body.geometry;
            this.body.geometry = new THREE.ExtrudeGeometry(this.shape,  extrudeSettings);
            this.extrudeSettings = extrudeSettings;
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

}

export default Paddle;