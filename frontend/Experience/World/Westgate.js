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
        // Check if school map is loaded
        if (!this.resources.items.schoolMap) {
            console.error('School map model failed to load');
            // Create a simple fallback geometry
            const geometry = new THREE.BoxGeometry(10, 5, 10);
            const material = new THREE.MeshStandardMaterial({ color: 0x888888 });
            this.schoolMap = new THREE.Mesh(geometry, material);
        } else {
            // Load the school map
            this.schoolMap = this.resources.items.schoolMap.scene;
        }

        // Set proper scale and position for school map
        // Scale to reasonable visible size
        console.log('!!! SETTING MAP SCALE TO 50x50x50 !!!');
        this.schoolMap.scale.set(50, 50, 50);
        console.log('!!! SETTING MAP POSITION TO (0, 5, 0) !!!');
        this.schoolMap.position.set(0, 5, 0); // Map tepat di atas ground plane (y=0)
        this.schoolMap.rotation.x = 0;
        this.schoolMap.rotation.y = 0;
        this.schoolMap.rotation.z = 0;

        // Skip complex collision detection for very large models
        // Collision akan menggunakan ground plane saja untuk performa
        console.log('Skipping building collision for performance - using ground plane only');

        // Apply materials to the school map (optimized for large models)
        this.schoolMap.traverse((child) => {
            if (child.isMesh) {
                // Enable shadows only for key meshes
                child.castShadow = false;
                child.receiveShadow = true;

                // Enable frustum culling for better performance
                child.frustumCulled = true;

                // Force visible
                child.visible = true;

                // Fix materials untuk menghilangkan lubang-lubang
                if (child.material) {
                    // Pastikan material tidak transparent dan render kedua sisi
                    if (Array.isArray(child.material)) {
                        // Handle multiple materials
                        child.material.forEach(mat => {
                            mat.side = THREE.DoubleSide;
                            mat.transparent = false;
                            mat.opacity = 1.0;
                            mat.depthWrite = true;
                            mat.depthTest = true;
                            mat.needsUpdate = true;
                        });
                    } else {
                        // Handle single material
                        child.material.side = THREE.DoubleSide;
                        child.material.transparent = false;
                        child.material.opacity = 1.0;
                        child.material.depthWrite = true;
                        child.material.depthTest = true;

                        if (child.material.map) {
                            child.material.map.colorSpace = THREE.SRGBColorSpace;
                        }

                        child.material.needsUpdate = true;
                    }
                }
            }
        });

        // Debug log dengan info lengkap
        console.log('=== SCHOOL MAP INFO (BEFORE ADJUSTMENT) ===');
        console.log('Scale:', this.schoolMap.scale);
        console.log('Position:', this.schoolMap.position);

        // Calculate bounding box untuk debug
        const bbox = new THREE.Box3().setFromObject(this.schoolMap);
        const size = bbox.getSize(new THREE.Vector3());
        const center = bbox.getCenter(new THREE.Vector3());
        console.log('Map dimensions (WxHxD):', size.x.toFixed(2), 'x', size.y.toFixed(2), 'x', size.z.toFixed(2));
        console.log('Map bounds MIN:', bbox.min);
        console.log('Map bounds MAX:', bbox.max);
        console.log('Map center:', center);

        // Adjust position agar dasar map tepat di y=0 (ground plane)
        const mapBottom = bbox.min.y;
        console.log('Map bottom Y:', mapBottom);

        // Jika map bottom negatif, naikkan. Jika positif, turunkan.
        const yOffset = -mapBottom + 50; // Tambah 50 untuk spawn karakter
        console.log('Y offset to apply:', yOffset);
        this.schoolMap.position.y = yOffset;

        // Force update matrix
        this.schoolMap.updateMatrixWorld(true);

        // Recalculate after adjustment
        const newBbox = new THREE.Box3().setFromObject(this.schoolMap);
        console.log('NEW Map bounds MIN:', newBbox.min);
        console.log('NEW Map bounds MAX:', newBbox.max);
        console.log('NEW Position:', this.schoolMap.position);
        console.log('Map should now be visible!');
        console.log('======================');

        // Add ground plane
        this.createGroundPlane();

        // Add axes helper for orientation
        const axesHelper = new THREE.AxesHelper(5);
        this.scene.add(axesHelper);

        // Add the school map to the scene
        this.scene.add(this.schoolMap);
        console.log('School map added to scene:', this.schoolMap.parent === this.scene);

        // Add bounding box helper untuk visualisasi
        const boxHelper = new THREE.BoxHelper(this.schoolMap, 0xff0000);
        this.scene.add(boxHelper);
        console.log('Added red bounding box helper around map');

        console.log('School map loaded successfully');
    }

    createGroundPlane() {
        // Create multiple ground planes at different heights for large building
        const groundSize = 10000;

        // Main ground at base level
        const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x90EE90, // Light green untuk rumput
            transparent: true,
            opacity: 0.5
        });

        this.groundPlane = new THREE.Mesh(groundGeometry, groundMaterial);
        this.groundPlane.rotation.x = -Math.PI / 2;
        this.groundPlane.position.y = 0;
        this.groundPlane.receiveShadow = true;
        this.groundPlane.name = 'Ground';

        this.scene.add(this.groundPlane);
        this.octree.fromGraphNode(this.groundPlane);

        // Add multiple floor collision planes at different heights (gedung skala 100x)
        const floorHeights = [100, 200, 300, 400, 500, 600, 700, 800];
        this.floorPlanes = [];

        floorHeights.forEach((height, index) => {
            const floorGeometry = new THREE.PlaneGeometry(groundSize, groundSize);
            const floorMaterial = new THREE.MeshStandardMaterial({
                color: 0xCCCCCC, // Light gray untuk lantai
                transparent: true,
                opacity: 0.2,
                visible: false // Invisible but still has collision
            });

            const floorPlane = new THREE.Mesh(floorGeometry, floorMaterial);
            floorPlane.rotation.x = -Math.PI / 2;
            floorPlane.position.y = height;
            floorPlane.name = `Floor_${height}`;

            this.scene.add(floorPlane);
            this.octree.fromGraphNode(floorPlane);
            this.floorPlanes.push(floorPlane);
        });

        console.log('Ground plane system created:', groundSize + 'x' + groundSize + ' units with', floorHeights.length, 'floors');
    }
}
