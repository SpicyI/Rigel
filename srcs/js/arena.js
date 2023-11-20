import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui'


class Arena{
    constructor(size = 200, aspect = 3/4){

        this.size = size;
        this.aspect = aspect;
        this.width = size;
        this.height = size * aspect;

        this.geometry = new THREE.PlaneGeometry(this.width, this.height);
        this.material = new THREE.MeshStandardMaterial({color : 0xFF0000});
        this.body = new THREE.Mesh(this.geometry, this.material);
        this.body.rotation.x = (- Math.PI / 2);
        this.body.position.y = 0.001;
        this.body.receiveShadow = true;
        this.position = this.body.position;
    }
}

export default Arena;