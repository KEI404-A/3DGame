import * as THREE from "three";
import { EventEmitter } from "events";
import Experience from "../Experience.js";

import { Octree } from "three/examples/jsm/math/Octree";

import Player from "./Player/Player.js";
import NPCManager from "./NPCManager.js";

import Westgate from "./Westgate.js";
import Environment from "./Environment.js";

export default class World extends EventEmitter {
    constructor() {
        super();
        this.experience = new Experience();
        this.resources = this.experience.resources;

        this.octree = new Octree();

        this.player = null;
        this.npcManager = null;

        this.resources.on("ready", () => {
            if (this.player === null) {
                this.westgate = new Westgate();
                this.player = new Player();
                this.environment = new Environment();
                
                // Initialize NPCs after world is ready
                this.npcManager = new NPCManager();
                this.npcManager.spawnAllNPCs();
                console.log('World ready with NPCs');
            }
        });
    }

    update() {
        if (this.player) this.player.update();
        if (this.npcManager) this.npcManager.update();
        if (this.environment) this.environment.update();
    }
}
