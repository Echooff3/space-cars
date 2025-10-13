"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Background = exports.Obstacle = exports.Car = void 0;
const THREE = __importStar(require("three"));
const utils_1 = require("./utils");
const definitions_1 = require("./definitions");
class Car {
    constructor() {
        this.lane = 1; // 0: left, 1: center, 2: right
        this.jumping = false;
        this.jumpFrame = 0;
        const geometry = new THREE.BoxGeometry(1, 0.5, 2);
        const material = (0, utils_1.createNeonMaterial)(0xff00aa, 0xff00aa);
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(0, 0.25, 0);
        this.targetX = 0;
    }
    moveLeft() {
        if (this.lane > 0 && !this.jumping) {
            this.lane--;
            this.targetX = (this.lane - 1) * definitions_1.LANE_WIDTH;
        }
    }
    moveRight() {
        if (this.lane < 2 && !this.jumping) {
            this.lane++;
            this.targetX = (this.lane - 1) * definitions_1.LANE_WIDTH;
        }
    }
    jump() {
        if (!this.jumping) {
            this.jumping = true;
            this.jumpFrame = definitions_1.JUMP_DURATION;
        }
    }
    update() {
        this.mesh.position.x += (this.targetX - this.mesh.position.x) * 0.1;
        if (this.jumping) {
            const halfDuration = definitions_1.JUMP_DURATION / 2;
            if (this.jumpFrame > halfDuration) {
                // Ascending
                const progress = 1 - (this.jumpFrame - halfDuration) / halfDuration;
                this.mesh.position.y = 0.25 + progress * definitions_1.JUMP_HEIGHT;
            }
            else {
                // Descending
                const progress = this.jumpFrame / halfDuration;
                this.mesh.position.y = 0.25 + progress * definitions_1.JUMP_HEIGHT;
            }
            this.jumpFrame--;
            if (this.jumpFrame <= 0) {
                this.jumping = false;
                this.mesh.position.y = 0.25;
            }
        }
    }
    isJumping() {
        return this.jumping;
    }
    getBounds() {
        const halfX = 0.4; // Smaller hitbox: reduced from 0.5 (car width 1, now effective 0.8)
        const halfY = 0.2; // Smaller vertical hitbox
        const halfZ = 0.8; // Smaller depth hitbox: reduced from 1 (car depth 2, now 1.6)
        return {
            minX: this.mesh.position.x - halfX,
            maxX: this.mesh.position.x + halfX,
            minY: this.mesh.position.y - halfY,
            maxY: this.mesh.position.y + halfY,
            minZ: this.mesh.position.z - halfZ,
            maxZ: this.mesh.position.z + halfZ,
        };
    }
}
exports.Car = Car;
class Obstacle {
    constructor(mesh, speed) {
        this.mesh = mesh;
        this.speed = speed;
    }
    update() {
        this.mesh.position.z += this.speed;
    }
    isOutOfBounds() {
        return this.mesh.position.z > 100;
    }
    getBounds() {
        const halfX = 0.4; // Smaller hitbox: reduced from 0.5 (obstacle width 1, now 0.8)
        const halfY = 1; // Full height since obstacles are on ground
        const halfZ = 0.4; // Smaller depth hitbox: reduced from 0.5 (obstacle depth 1, now 0.8)
        return {
            minX: this.mesh.position.x - halfX,
            maxX: this.mesh.position.x + halfX,
            minY: this.mesh.position.y - halfY,
            maxY: this.mesh.position.y + halfY,
            minZ: this.mesh.position.z - halfZ,
            maxZ: this.mesh.position.z + halfZ,
        };
    }
}
exports.Obstacle = Obstacle;
class Background {
    constructor(sceneDepth = -150) {
        this.time = 0;
        this.group = new THREE.Group();
        this.lines = [];
        this.spheres = [];
        // Create more wavy lines: Increase to 15 horizontal lines at different z depths for enhanced depth
        const numLines = 15;
        const pointsPerLine = 100;
        const lineLength = 100;
        const waveFreq = 0.02;
        const waveAmp = 5;
        for (let i = 0; i < numLines; i++) {
            const z = sceneDepth + i * 7; // Closer spacing for more density
            const geometry = new THREE.BufferGeometry();
            const positions = [];
            for (let p = 0; p < pointsPerLine; p++) {
                const x = (p / (pointsPerLine - 1) - 0.5) * lineLength;
                positions.push(x, 0, z);
            }
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            const color = i % 2 === 0 ? 0x00ff00 : 0xff0000; // Alternating neon colors, with some randomness
            const material = new THREE.LineBasicMaterial({ color, linewidth: 3 });
            const line = new THREE.Line(geometry, material);
            this.lines.push(line);
            this.group.add(line);
        }
        // Create spheres: Increase to 20 floating spheres at different depths
        const numSpheres = 20;
        for (let i = 0; i < numSpheres; i++) {
            const geometry = new THREE.SphereGeometry(1 + Math.random() * 2, 16, 16);
            const color = [0x00ff00, 0xff0000, 0x0000ff, 0xffff00, 0xff00ff][Math.floor(Math.random() * 5)];
            const material = (0, utils_1.createNeonMaterial)(color, color);
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.set((Math.random() - 0.5) * 200, (Math.random() - 0.5) * 100 + 50, sceneDepth + Math.random() * 100);
            this.spheres.push(sphere);
            this.group.add(sphere);
        }
        // Add sky particles: Inspired by abstract 3D backgrounds with floating particles (e.g., [videezy.com](https://videezy.com/abstract/9152-blue-soft-particles-floating-on-background-with-glowing-lines), [videezy.com](https://videezy.com/backgrounds/9232-beautiful-particles-moving-on-sky-blue-background), [videezy.com](https://videezy.com/abstract/9175-undulating-glowing-lines-spinning-and-little-particles-floating-on-blue-background)), create a particle system for glowing sky particles
        const particleCount = 1500;
        const particleGeometry = new THREE.BufferGeometry();
        const particlePositions = [];
        const particleColors = [];
        for (let i = 0; i < particleCount; i++) {
            particlePositions.push((Math.random() - 0.5) * 2000, Math.random() * 1000 + 50, (Math.random() - 0.5) * 2000);
            particleColors.push(Math.random() * 0.5 + 0.5, // r: soft blues and whites
            Math.random() * 0.5 + 0.5, 1.0 // b: predominantly blue for sky effect
            );
        }
        particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));
        particleGeometry.setAttribute('color', new THREE.Float32BufferAttribute(particleColors, 3));
        const particleMaterial = new THREE.PointsMaterial({
            size: 3,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0.8
        });
        this.skyParticles = new THREE.Points(particleGeometry, particleMaterial);
        this.group.add(this.skyParticles);
    }
    update(speed) {
        this.time += 0.02; // Time step for waves
        // Update wavy lines: Animate y positions with sine waves
        this.lines.forEach((line, index) => {
            const phase = index * 0.3; // Different phases for each line
            const positions = line.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                const baseX = (i / 3 / 99 - 0.5) * 100; // Reconstruct x from index
                positions[i + 1] = Math.sin(baseX * 0.02 + this.time + phase) * 5; // Wave y
            }
            line.geometry.attributes.position.needsUpdate = true;
            // Parallax movement: Move z at slower speed
            line.position.z += speed * (index + 1) / this.lines.length; // Deeper layers move slower
            if (line.position.z > 50)
                line.position.z = -200; // Loop if goes out of scene
        });
        // Update spheres: Float up/down and rotate, move z
        this.spheres.forEach((sphere, index) => {
            sphere.position.y += Math.sin(this.time + index * 0.5) * 0.1; // Float
            sphere.rotation.x += 0.01;
            sphere.rotation.y += 0.02;
            // Parallax: Move z at speed
            sphere.position.z += speed * (index % 3 + 1) / 3; // Vary speeds
            if (sphere.position.z > 50)
                sphere.position.z = -250; // Loop
        });
        // Update sky particles: Subtle floating and parallax
        const particlePositions = this.skyParticles.geometry.attributes.position.array;
        for (let i = 0; i < particlePositions.length; i += 3) {
            particlePositions[i + 1] += Math.sin(this.time + i * 0.001) * 0.05; // Subtle y oscillation
            particlePositions[i + 2] += speed * 0.5; // Parallax z movement, slower for depth
            if (particlePositions[i + 2] > 500)
                particlePositions[i + 2] -= 1000; // Loop far particles
        }
        this.skyParticles.geometry.attributes.position.needsUpdate = true;
    }
}
exports.Background = Background;
