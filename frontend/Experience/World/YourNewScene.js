import * as THREE from "three";
import Experience from "../Experience.js";

export default class YourNewScene {
    constructor() {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.octree = this.experience.world.octree;

        // Inisialisasi scene baru
        this.setWorld();
    }

    setWorld() {
        // Cek apakah model scene baru sudah dimuat
        if (!this.resources.items.yourNewMap) {
            console.error('Scene baru model gagal dimuat');
            // Fallback geometry jika model tidak ada
            const geometry = new THREE.BoxGeometry(100, 20, 100);
            const material = new THREE.MeshStandardMaterial({ color: 0x666666 });
            this.newMap = new THREE.Mesh(geometry, material);
        } else {
            // Load model scene baru
            this.newMap = this.resources.items.yourNewMap.scene;
        }

        // Set skala dan posisi untuk scene baru
        this.newMap.scale.set(1, 1, 1);
        this.newMap.position.set(0, 0, 0);
        this.newMap.rotation.x = 0;
        this.newMap.rotation.y = 0;
        this.newMap.rotation.z = 0;

        // Clone model untuk collision detection
        this.newMapClone = this.newMap.clone();
        this.newMapClone.scale.copy(this.newMap.scale);
        this.newMapClone.position.copy(this.newMap.position);
        this.newMapClone.rotation.copy(this.newMap.rotation);
        this.newMapClone.updateMatrixWorld(true);

        // Setup collision detection
        this.octree.fromGraphNode(this.newMapClone);
        console.log('Octree collision setup complete untuk scene baru');

        // Apply materials ke scene baru
        this.newMap.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                
                if (child.material) {
                    child.material.depthTest = true;
                    
                    if (child.material.map) {
                        child.material.map.colorSpace = THREE.SRGBColorSpace;
                        child.material.map.flipY = false;
                        child.material.map.wrapS = THREE.RepeatWrapping;
                        child.material.map.wrapT = THREE.RepeatWrapping;
                    }
                }
            }
        });

        // Debug info
        const box = new THREE.Box3().setFromObject(this.newMap);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        console.log('Scene baru dimuat!');
        console.log('Model size (WxHxD):', size.x.toFixed(2), 'x', size.y.toFixed(2), 'x', size.z.toFixed(2));
        console.log('Model center:', center);

        // Add ke scene
        this.scene.add(this.newMap);
        console.log('Scene baru berhasil dimuat');
    }

    update() {
        // Update logic untuk scene baru (jika diperlukan)
    }
}
