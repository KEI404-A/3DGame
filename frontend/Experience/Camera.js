import * as THREE from "three";
import Experience from "./Experience.js";
import { OrbitControls } from "../Experience/Utils/CustomOrbitControls.js";

export default class Camera {
    constructor() {
        this.experience = new Experience();
        this.sizes = this.experience.sizes;
        this.scene = this.experience.scene;
        this.canvas = this.experience.canvas;
        this.params = {
            fov: 90, // FOV normal untuk menghilangkan distorsi ultrawide
            aspect: this.sizes.aspect,
            near: 0.01, // Near plane sangat dekat
            far: 100000, // Far plane ultra jauh untuk skybox luas
        };
        this.controls = null;

        this.setPerspectiveCamera();
        this.setOrbitControls();
    }

    setPerspectiveCamera() {
        this.perspectiveCamera = new THREE.PerspectiveCamera(
            this.params.fov,
            this.params.aspect,
            this.params.near,
            this.params.far
        );

        // Posisi camera untuk melihat karakter raksasa 80x di spawn point
        this.perspectiveCamera.position.set(180, 120, -20);
        this.perspectiveCamera.lookAt(100, 2, -100);

        this.scene.add(this.perspectiveCamera);
    }

    setOrbitControls() {
        this.controls = new OrbitControls(this.perspectiveCamera, this.canvas);
        this.controls.enableDamping = true;
        this.controls.enableZoom = true;
        this.controls.enablePan = true;
        this.controls.maxPolarAngle = Math.PI; // Rotasi bebas 180° vertikal
        this.controls.minDistance = 40; // Min distance untuk karakter raksasa 80x
        this.controls.maxDistance = 50000; // Bisa zoom out maksimal jauh
        this.controls.target.set(100, 2, -100); // Fokus ke posisi spawn serong kanan belakang
        this.controls.dampingFactor = 0.05;
        
        // Enable orbit controls for camera movement
        this.controls.enabled = true;
        
        // Allow rotation with left mouse button for easier control
        this.controls.mouseButtons = {
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN
        };
    }

    enableOrbitControls() {
        this.controls.enabled = true;
    }

    disableOrbitControls() {
        this.controls.enabled = false;
    }

    onResize() {
        this.perspectiveCamera.aspect = this.sizes.aspect;
        this.perspectiveCamera.updateProjectionMatrix();
    }

    update() {
        if (!this.controls) return;
        if (this.controls.enabled === true) {
            this.controls.update();
        }
    }
}
