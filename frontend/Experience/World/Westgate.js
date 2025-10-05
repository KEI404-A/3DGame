import Experience from "../Experience.js";
import * as THREE from "three";

export default class Westgate {
    constructor() {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.octree = this.experience.world.octree;

        this.setWorld();
    }

    setWorld() {
        // Check if modern city block is loaded
        if (!this.resources.items.modernCityBlock) {
            console.error('Modern city block model failed to load');
            // Create a simple fallback geometry
            const geometry = new THREE.BoxGeometry(10, 5, 10);
            const material = new THREE.MeshStandardMaterial({ color: 0x888888 });
            this.modernCityBlock = new THREE.Mesh(geometry, material);
        } else {
            // Load the modern city block
            this.modernCityBlock = this.resources.items.modernCityBlock.scene;
        }
        
        // Set proper scale and position for city block
        this.modernCityBlock.scale.set(0.8, 0.8, 0.8);
        this.modernCityBlock.position.set(0, -5, 0);
        // Rotasi untuk memperbaiki orientasi model
        this.modernCityBlock.rotation.x = 0;
        this.modernCityBlock.rotation.y = 0;
        this.modernCityBlock.rotation.z = 0;
        
        // Clone the model to use for collision detection
        this.modernCityBlockClone = this.modernCityBlock.clone();
        this.modernCityBlockClone.scale.copy(this.modernCityBlock.scale);
        this.modernCityBlockClone.position.copy(this.modernCityBlock.position);
        this.modernCityBlockClone.rotation.copy(this.modernCityBlock.rotation);
        
        // Update matrix sebelum collision detection
        this.modernCityBlockClone.updateMatrixWorld(true);
        
        // Set up collision detection using the scaled model
        this.octree.fromGraphNode(this.modernCityBlockClone);
        console.log('Octree collision setup complete with model at position:', this.modernCityBlock.position);

        // Apply materials to the city block
        this.modernCityBlock.traverse((child) => {
            if (child.isMesh) {
                console.log('Processing mesh:', child.name, 'Position:', child.position);
                
                // Enable shadows
                child.castShadow = true;
                child.receiveShadow = true;
                
                // Disable frustum culling to ensure all parts render
                child.frustumCulled = false;
                
                // Force visible
                child.visible = true;
                
                // Normalize geometry
                if (child.geometry) {
                    child.geometry.computeBoundingBox();
                    child.geometry.computeBoundingSphere();
                    child.geometry.computeVertexNormals();
                }
                
                // Fix materials untuk menghilangkan lubang-lubang
                if (child.material) {
                    // Pastikan material tidak transparent dan render kedua sisi
                    if (Array.isArray(child.material)) {
                        // Handle multiple materials
                        child.material.forEach(mat => {
                            mat.side = THREE.DoubleSide; // Render kedua sisi
                            mat.transparent = false;
                            mat.opacity = 1.0;
                            mat.wireframe = false;
                            mat.alphaTest = 0;
                            mat.depthWrite = true;
                            mat.depthTest = true;
                            mat.needsUpdate = true;
                        });
                    } else {
                        // Handle single material
                        child.material.side = THREE.DoubleSide; // Render kedua sisi
                        child.material.transparent = false;
                        child.material.opacity = 1.0;
                        child.material.wireframe = false;
                        child.material.alphaTest = 0;
                        child.material.depthWrite = true;
                        child.material.depthTest = true;
                        
                        if (child.material.map) {
                            child.material.map.colorSpace = THREE.SRGBColorSpace;
                            child.material.map.flipY = false;
                            child.material.map.wrapS = THREE.RepeatWrapping;
                            child.material.map.wrapT = THREE.RepeatWrapping;
                        }
                        
                        child.material.needsUpdate = true;
                    }
                }
            }
        });

        // Debug: Check model dimensions after final scaling
        const box = new THREE.Box3().setFromObject(this.modernCityBlock);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        console.log('Model loaded!');
        console.log('Model size (WxHxD):', size.x.toFixed(2), 'x', size.y.toFixed(2), 'x', size.z.toFixed(2));
        console.log('Model center:', center);
        console.log('Model bounds min:', box.min);
        console.log('Model bounds max:', box.max);
        
        // Count and log all meshes
        let meshCount = 0;
        this.modernCityBlock.traverse((child) => {
            if (child.isMesh) meshCount++;
        });
        console.log('Total meshes in model:', meshCount);
        
        // Debug material info
        let transparentCount = 0;
        this.modernCityBlock.traverse((child) => {
            if (child.isMesh && child.material) {
                if (child.material.transparent) transparentCount++;
            }
        });
        console.log('Transparent materials found:', transparentCount);
        
        // Tambahkan ground plane yang sangat luas sesuai skybox
        this.createUltraWideGroundPlane();

        // Add small axes helper untuk orientasi (optional, bisa dihapus nanti)
        const axesHelper = new THREE.AxesHelper(5);
        this.scene.add(axesHelper);

        // Add the modern city block to the scene
        this.scene.add(this.modernCityBlock);
        
        console.log('Modern city block loaded successfully');
    }

    createUltraWideGroundPlane() {
        // Buat ground plane yang sangat luas sesuai skybox (100,000 x 100,000)
        const groundSize = 100000;
        const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize, 100, 100);
        
        // Material ground yang invisible tapi bisa collision
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x666666,
            transparent: true,
            opacity: 0.1, // Hampir invisible
            wireframe: false
        });
        
        this.groundPlane = new THREE.Mesh(groundGeometry, groundMaterial);
        this.groundPlane.rotation.x = -Math.PI / 2; // Horizontal
        this.groundPlane.position.y = -10; // Sedikit di bawah spawn
        this.groundPlane.receiveShadow = true;
        this.groundPlane.name = 'UltraWideGround';
        
        // Tambahkan ke octree untuk collision
        this.scene.add(this.groundPlane);
        this.octree.fromGraphNode(this.groundPlane);
        
        console.log('Ultra wide ground plane created:', groundSize + 'x' + groundSize + ' units');
        
        // Buat beberapa platform tambahan untuk eksplorasi vertikal
        this.createExplorationPlatforms();
    }
    
    createExplorationPlatforms() {
        const platformMaterial = new THREE.MeshStandardMaterial({
            color: 0x888888,
            transparent: true,
            opacity: 0.3
        });
        
        // Platform di berbagai ketinggian untuk eksplorasi
        const heights = [-5, 10, 25, 50, 100];
        const distances = [1000, 5000, 15000, 30000, 45000];
        
        for (let i = 0; i < heights.length; i++) {
            // Platform di 4 arah mata angin
            for (let angle = 0; angle < 4; angle++) {
                const x = Math.cos(angle * Math.PI / 2) * distances[i];
                const z = Math.sin(angle * Math.PI / 2) * distances[i];
                
                const platformGeometry = new THREE.BoxGeometry(500, 10, 500);
                const platform = new THREE.Mesh(platformGeometry, platformMaterial);
                platform.position.set(x, heights[i], z);
                platform.receiveShadow = true;
                platform.castShadow = true;
                platform.name = `ExplorationPlatform_${i}_${angle}`;
                
                this.scene.add(platform);
                this.octree.fromGraphNode(platform);
            }
        }
        
        console.log('Exploration platforms created at various heights and distances');
    }
}
