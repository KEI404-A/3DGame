import * as THREE from "three";
import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js";

/**
 * NPC Class
 * Creates a non-player character that walks along a defined path
 */
export default class NPC {
    constructor(avatar, scene, name, path, speed = 1.0) {
        this.scene = scene;
        this.name = name;
        this.path = path; // Array of Vector3 positions
        this.speed = speed; // Movement speed multiplier
        this.currentPathIndex = 0;
        this.direction = new THREE.Vector3();
        this.targetRotation = new THREE.Quaternion();
        this.upVector = new THREE.Vector3(0, 1, 0);
        
        // Clone the avatar model
        this.avatar = SkeletonUtils.clone(avatar.scene);
        this.avatar.animations = avatar.animations.map((clip) => clip.clone());
        
        this.setAvatar();
        this.setAnimation();
    }

    setAvatar() {
        // Scale sama dengan player untuk konsistensi
        this.avatar.scale.set(80.0, 80.0, 80.0);
        this.avatar.visible = true;
        
        // Set posisi awal ke path pertama
        if (this.path && this.path.length > 0) {
            this.avatar.position.copy(this.path[0]);
        }
        
        // Debug sphere untuk NPC (warna biru untuk membedakan dari player)
        const debugGeometry = new THREE.SphereGeometry(64, 8, 6);
        const debugMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x0000ff, // Biru untuk NPC
            transparent: true, 
            opacity: 0.7 
        });
        this.debugSphere = new THREE.Mesh(debugGeometry, debugMaterial);
        this.avatar.add(this.debugSphere);
        this.debugSphere.position.set(0, 160, 0);
        
        // Add to scene
        this.scene.add(this.avatar);
        
        console.log(`NPC "${this.name}" created at:`, this.avatar.position);
    }

    setAnimation() {
        this.animation = {};
        this.animation.mixer = new THREE.AnimationMixer(this.avatar);
        this.animation.actions = {};

        // Setup all animations
        this.animation.actions.dancing = this.animation.mixer.clipAction(this.avatar.animations[0]);
        this.animation.actions.idle = this.animation.mixer.clipAction(this.avatar.animations[1]);
        this.animation.actions.jumping = this.animation.mixer.clipAction(this.avatar.animations[2]);
        this.animation.actions.running = this.animation.mixer.clipAction(this.avatar.animations[3]);
        this.animation.actions.walking = this.animation.mixer.clipAction(this.avatar.animations[4]);
        this.animation.actions.waving = this.animation.mixer.clipAction(this.avatar.animations[5]);

        // Start with walking animation
        this.animation.actions.current = this.animation.actions.walking;
        this.animation.actions.current.play();

        // Animation play function
        this.animation.play = (name) => {
            const newAction = this.animation.actions[name];
            const oldAction = this.animation.actions.current;

            if (oldAction === newAction) return;

            newAction.reset();
            newAction.play();
            newAction.crossFadeFrom(oldAction, 0.2);

            this.animation.actions.current = newAction;
        };

        // Animation update function
        this.animation.update = (deltaTime) => {
            this.animation.mixer.update(deltaTime);
        };
    }

    /**
     * Move NPC along its path
     */
    updateMovement(deltaTime) {
        if (!this.path || this.path.length < 2) return;

        // Get current target position
        const targetPos = this.path[this.currentPathIndex];
        
        // Calculate direction to target
        this.direction.subVectors(targetPos, this.avatar.position);
        const distance = this.direction.length();

        // Check if reached target waypoint
        if (distance < 10) { // Threshold untuk mencapai waypoint (scale 80x)
            // Move to next waypoint
            this.currentPathIndex = (this.currentPathIndex + 1) % this.path.length;
            return;
        }

        // Normalize direction and move
        this.direction.normalize();
        const moveSpeed = 50.0 * this.speed * deltaTime; // Base speed untuk scale 80x
        this.avatar.position.addScaledVector(this.direction, moveSpeed);

        // Rotate NPC to face movement direction
        const angle = Math.atan2(this.direction.x, this.direction.z);
        this.targetRotation.setFromAxisAngle(this.upVector, angle);
        this.avatar.quaternion.rotateTowards(this.targetRotation, 0.1);
    }

    /**
     * Update NPC each frame
     */
    update(deltaTime) {
        this.updateMovement(deltaTime);
        this.animation.update(deltaTime);
    }

    /**
     * Remove NPC from scene
     */
    dispose() {
        // Dispose debug sphere
        if (this.debugSphere) {
            this.debugSphere.geometry.dispose();
            this.debugSphere.material.dispose();
            this.avatar.remove(this.debugSphere);
        }

        // Dispose avatar
        this.avatar.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.geometry.dispose();
                if (child.material) {
                    child.material.dispose();
                }
            }
        });

        this.scene.remove(this.avatar);
        console.log(`NPC "${this.name}" removed from scene`);
    }
}

