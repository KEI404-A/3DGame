import * as THREE from "three";
import Experience from "./Experience.js";

export default class Renderer {
    constructor() {
        this.experience = new Experience();
        this.sizes = this.experience.sizes;
        this.scene = this.experience.scene;
        this.canvas = this.experience.canvas;
        this.camera = this.experience.camera;

        this.setRenderer();
    }

    setRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            logarithmicDepthBuffer: true, // Get rid of z-fighting
            preserveDrawingBuffer: true
        });
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        // ACESFilmic tone mapping untuk kontras yang lebih dramatis (cocok untuk dark theme)
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.4; // Exposure ditingkatkan agar karakter terlihat jelas
        this.renderer.setSize(this.sizes.width, this.sizes.height);
        this.renderer.setPixelRatio(this.sizes.pixelRatio);
        
        // Enable shadows dengan soft shadows untuk atmosfer yang lebih cinematic
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Optimize rendering untuk model besar dan menghindari z-fighting
        this.renderer.sortObjects = true; // Enable sorting untuk rendering yang benar
        this.renderer.physicallyCorrectLights = true;
        
        // Settings untuk menghindari lubang-lubang pada model
        this.renderer.localClippingEnabled = false;
        this.renderer.gammaFactor = 2.2;
    }

    onResize() {
        this.renderer.setSize(this.sizes.width, this.sizes.height);
        this.renderer.setPixelRatio(this.sizes.pixelRatio);
    }

    update() {
        this.renderer.render(this.scene, this.camera.perspectiveCamera);
    }
}
