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
        // Set background gradient gelap untuk tema malam
        const canvas = document.createElement('canvas');
        canvas.width = 16384; // Canvas ultra ekstrem untuk area yang maksimal luas
        canvas.height = 16384;
        const context = canvas.getContext('2d');
        
        // Create gradient gelap dari atas ke bawah (dark theme)
        const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#0a0a15'); // Dark navy blue di atas
        gradient.addColorStop(0.3, '#1a1a2e'); // Dark purple
        gradient.addColorStop(0.6, '#16213e'); // Dark blue
        gradient.addColorStop(0.8, '#0f1419'); // Almost black
        gradient.addColorStop(1, '#000000'); // Black di bawah
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.mapping = THREE.EquirectangularReflectionMapping;
        this.scene.background = texture;
        
        // Tambahkan fog gelap untuk atmosfer yang lebih dramatis (lebih jauh agar tidak menutupi karakter)
        this.scene.fog = new THREE.Fog(0x0a0a15, 300, 5000); // Fog dimulai lebih jauh (300 instead of 100)

        // Ambient light ditingkatkan agar karakter terlihat
        const light = new THREE.AmbientLight(0x505070, 0.6); // Cahaya ambient lebih terang dengan tint biru
        this.scene.add(light);

        // Directional light (moonlight) yang lebih terang agar karakter terlihat
        this.moonLight = new THREE.DirectionalLight(0x9999dd, 0.8); // Cahaya bulan lebih terang
        this.moonLight.position.set(100, 200, 100);
        this.moonLight.castShadow = true;
        this.moonLight.shadow.mapSize.width = 4096;
        this.moonLight.shadow.mapSize.height = 4096;
        this.moonLight.shadow.camera.near = 0.1;
        this.moonLight.shadow.camera.far = 10000;
        this.moonLight.shadow.camera.left = -2000;
        this.moonLight.shadow.camera.right = 2000;
        this.moonLight.shadow.camera.top = 2000;
        this.moonLight.shadow.camera.bottom = -2000;
        this.scene.add(this.moonLight);

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
