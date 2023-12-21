import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui'


class Arena{
    size: number;
    aspect: number;
    width: number;
    height: number;
    geometry: THREE.PlaneGeometry;
    material: THREE.MeshStandardMaterial;
    body: THREE.Mesh;
    position: THREE.Vector3;

    constructor(size: number = 200, aspect: number = 3/4){
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