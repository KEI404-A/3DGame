import * as THREE from "three";
import Experience from "../Experience.js";
import NPC from "./NPC.js";

/**
 * NPCManager Class
 * Manages multiple NPCs in the world
 */
export default class NPCManager {
    constructor() {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.time = this.experience.time;
        
        this.npcs = []; // Array to store all NPCs
        
        this.createNPCs();
    }

    /**
     * Create multiple NPCs with different paths
     */
    createNPCs() {
        // Define different paths for NPCs to walk
        // Path 1: Walking in a square around spawn area
        const path1 = [
            new THREE.Vector3(150, 5, -50),
            new THREE.Vector3(150, 5, -150),
            new THREE.Vector3(50, 5, -150),
            new THREE.Vector3(50, 5, -50),
        ];

        // Path 2: Walking in a line back and forth
        const path2 = [
            new THREE.Vector3(200, 5, -100),
            new THREE.Vector3(0, 5, -100),
        ];

        // Path 3: Walking in a larger circle
        const path3 = [
            new THREE.Vector3(100, 5, 0),
            new THREE.Vector3(200, 5, -100),
            new THREE.Vector3(100, 5, -200),
            new THREE.Vector3(0, 5, -100),
        ];

        // Path 4: Diagonal walking pattern
        const path4 = [
            new THREE.Vector3(50, 5, 0),
            new THREE.Vector3(150, 5, -200),
            new THREE.Vector3(50, 5, -200),
            new THREE.Vector3(150, 5, 0),
        ];

        // Path 5: Small loop near center
        const path5 = [
            new THREE.Vector3(80, 5, -80),
            new THREE.Vector3(120, 5, -80),
            new THREE.Vector3(120, 5, -120),
            new THREE.Vector3(80, 5, -120),
        ];

        // Randomly choose avatar skins for variety
        const avatarSkins = ['asian_male_animated', 'asian_female_animated'];
        
        // Create NPCs with different paths
        this.npcConfigs = [
            { name: "Walker 1", path: path1, speed: 1.0, skin: avatarSkins[0] },
            { name: "Walker 2", path: path2, speed: 0.8, skin: avatarSkins[1] },
            { name: "Walker 3", path: path3, speed: 1.2, skin: avatarSkins[0] },
            { name: "Walker 4", path: path4, speed: 0.9, skin: avatarSkins[1] },
            { name: "Walker 5", path: path5, speed: 1.1, skin: avatarSkins[0] },
        ];

        // Spawn NPCs (will be created when resources are ready)
        console.log(`NPCManager initialized with ${this.npcConfigs.length} NPC configurations`);
    }

    /**
     * Spawn all NPCs (call this after resources are loaded)
     */
    spawnAllNPCs() {
        this.npcConfigs.forEach(config => {
            const avatarResource = this.resources.items[config.skin];
            
            if (!avatarResource) {
                console.warn(`Avatar resource "${config.skin}" not found for NPC "${config.name}"`);
                return;
            }

            const npc = new NPC(
                avatarResource,
                this.scene,
                config.name,
                config.path,
                config.speed
            );

            this.npcs.push(npc);
            console.log(`NPC spawned: ${config.name}`);
        });

        console.log(`Total NPCs spawned: ${this.npcs.length}`);
    }

    /**
     * Update all NPCs
     */
    update() {
        if (this.npcs.length === 0) return;

        // Update each NPC with delta time
        this.npcs.forEach(npc => {
            npc.update(this.time.delta);
        });
    }

    /**
     * Remove all NPCs from scene
     */
    disposeAll() {
        this.npcs.forEach(npc => {
            npc.dispose();
        });
        this.npcs = [];
        console.log('All NPCs removed');
    }

    /**
     * Add a new NPC dynamically
     */
    addNPC(name, path, speed = 1.0, skinName = 'asian_male_animated') {
        const avatarResource = this.resources.items[skinName];
        
        if (!avatarResource) {
            console.warn(`Avatar resource "${skinName}" not found`);
            return null;
        }

        const npc = new NPC(avatarResource, this.scene, name, path, speed);
        this.npcs.push(npc);
        
        console.log(`NPC "${name}" added dynamically`);
        return npc;
    }

    /**
     * Remove specific NPC by name
     */
    removeNPC(name) {
        const index = this.npcs.findIndex(npc => npc.name === name);
        
        if (index !== -1) {
            this.npcs[index].dispose();
            this.npcs.splice(index, 1);
            console.log(`NPC "${name}" removed`);
            return true;
        }
        
        console.warn(`NPC "${name}" not found`);
        return false;
    }
}

