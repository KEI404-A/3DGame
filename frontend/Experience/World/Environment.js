import Experience from "../Experience.js";
import * as THREE from "three";

export default class Environment {
    constructor() {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;

        this.setEnvironment();
    }

    setEnvironment() {
        // Set background gradient yang sangat luas dan natural
        const canvas = document.createElement('canvas');
        canvas.width = 16384; // Canvas ultra ekstrem untuk area yang maksimal luas
        canvas.height = 16384;
        const context = canvas.getContext('2d');
        
        // Create gradient yang sangat halus dari atas ke bawah
        const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#87ceeb'); // Sky blue di atas
        gradient.addColorStop(0.3, '#b0e0e6'); // Powder blue
        gradient.addColorStop(0.6, '#e0f6ff'); // Alice blue
        gradient.addColorStop(0.8, '#ffffff'); // Putih
        gradient.addColorStop(1, '#f5f5f5'); // White smoke di bawah
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.mapping = THREE.EquirectangularReflectionMapping;
        this.scene.background = texture;
        
        // Remove any fog that might obstruct view
        this.scene.fog = null;

        // Add strong ambient light untuk visibility yang baik
        const light = new THREE.AmbientLight(0xffffff, 1.0);
        this.scene.add(light);

        // Add directional light (sun) 
        this.sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
        this.sunLight.position.set(100, 200, 100);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 4096;
        this.sunLight.shadow.mapSize.height = 4096;
        this.sunLight.shadow.camera.near = 0.1;
        this.sunLight.shadow.camera.far = 10000;
        this.sunLight.shadow.camera.left = -2000;
        this.sunLight.shadow.camera.right = 2000;
        this.sunLight.shadow.camera.top = 2000;
        this.sunLight.shadow.camera.bottom = -2000;
        this.scene.add(this.sunLight);

        // this.scene.environment = this.environmentMap.texture;

        // console.log(this.scene);

        // this.environmentMap.updateMaterials = () => {
        //     this.scene.children.forEach((child) => {
        //         if (child instanceof THREE.Group) {
        //             console.log(child.children[0]);
        //             if (
        //                 child.children[0] instanceof THREE.Mesh &&
        //                 child.children[0].material instanceof
        //                     THREE.MeshPhysicalMaterial
        //             ) {
        //                 child.children[0].material.envMap =
        //                     this.environmentMap.texture;
        //                 child.children[0].material.envMapIntensity =
        //                     this.environmentMap.intensity;
        //                 child.children[0].material.needsUpdate = true;
        //             }
        //         }
        //     });
        // };
        // this.environmentMap.updateMaterials();
    }

    update() {}
}
