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
        // Create skybox dengan langit biru dan awan
        this.createSkyboxWithClouds();

        // Fog terang untuk atmosfer siang hari
        this.scene.fog = new THREE.Fog(0xE0F6FF, 500, 8000);

        // Ambient light terang untuk siang hari
        const light = new THREE.AmbientLight(0xFFFFFF, 1.2);
        this.scene.add(light);

        // Directional light (sunlight) yang sangat terang
        this.sunLight = new THREE.DirectionalLight(0xFFFFDD, 2.0);
        this.sunLight.position.set(100, 300, 100);
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

        // Tambahan hemisphere light untuk cahaya langit yang natural
        this.hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0xF0F8FF, 0.8);
        this.scene.add(this.hemisphereLight);

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

    createSkyboxWithClouds() {
        // Create canvas untuk skybox dengan langit biru dan awan
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 2048;
        const context = canvas.getContext('2d');

        // Background gradient langit biru
        const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#4A90E2'); // Deep sky blue di atas
        gradient.addColorStop(0.4, '#87CEEB'); // Sky blue
        gradient.addColorStop(0.7, '#B0E0E6'); // Powder blue
        gradient.addColorStop(1, '#E0F6FF'); // Light cyan di horizon

        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Draw clouds (awan)
        this.drawClouds(context, canvas.width, canvas.height);

        // Create texture dari canvas
        this.cloudTexture = new THREE.CanvasTexture(canvas);
        this.cloudTexture.needsUpdate = true;

        // Create skybox sphere
        const skyGeometry = new THREE.SphereGeometry(50000, 60, 40);
        const skyMaterial = new THREE.MeshBasicMaterial({
            map: this.cloudTexture,
            side: THREE.BackSide,
            fog: false
        });

        this.skybox = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(this.skybox);

        // Store canvas and context for animation
        this.cloudCanvas = canvas;
        this.cloudContext = context;
        this.cloudOffset = 0;
    }

    drawClouds(context, width, height) {
        // Draw multiple fluffy clouds
        context.fillStyle = 'rgba(255, 255, 255, 0.7)';

        // Random clouds di berbagai posisi
        const cloudCount = 30;
        for (let i = 0; i < cloudCount; i++) {
            const x = (Math.random() * width);
            const y = (Math.random() * height * 0.6); // Clouds di bagian atas-tengah
            const size = 50 + Math.random() * 150;

            this.drawSingleCloud(context, x, y, size);
        }
    }

    drawSingleCloud(context, x, y, size) {
        // Draw fluffy cloud dengan multiple circles
        context.save();
        context.globalAlpha = 0.6 + Math.random() * 0.3;

        // Main cloud body
        context.beginPath();
        context.arc(x, y, size, 0, Math.PI * 2);
        context.arc(x + size * 0.6, y - size * 0.3, size * 0.8, 0, Math.PI * 2);
        context.arc(x - size * 0.6, y - size * 0.2, size * 0.7, 0, Math.PI * 2);
        context.arc(x + size * 0.3, y + size * 0.3, size * 0.6, 0, Math.PI * 2);
        context.arc(x - size * 0.3, y + size * 0.4, size * 0.5, 0, Math.PI * 2);
        context.fill();

        context.restore();
    }

    updateClouds() {
        // Slowly move clouds untuk efek animasi
        this.cloudOffset += 0.1;

        // Redraw background
        const gradient = this.cloudContext.createLinearGradient(0, 0, 0, this.cloudCanvas.height);
        gradient.addColorStop(0, '#4A90E2');
        gradient.addColorStop(0.4, '#87CEEB');
        gradient.addColorStop(0.7, '#B0E0E6');
        gradient.addColorStop(1, '#E0F6FF');

        this.cloudContext.fillStyle = gradient;
        this.cloudContext.fillRect(0, 0, this.cloudCanvas.width, this.cloudCanvas.height);

        // Redraw clouds dengan offset untuk animasi
        const cloudCount = 30;
        for (let i = 0; i < cloudCount; i++) {
            const x = ((i * 234 + this.cloudOffset) % this.cloudCanvas.width);
            const y = ((i * 123) % (this.cloudCanvas.height * 0.6));
            const size = 50 + ((i * 37) % 150);

            this.drawSingleCloud(this.cloudContext, x, y, size);
        }

        // Update texture
        this.cloudTexture.needsUpdate = true;
    }

    update() {
        // Update clouds animation setiap frame
        if (this.cloudTexture) {
            this.updateClouds();
        }
    }
}
