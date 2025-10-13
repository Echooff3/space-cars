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
exports.game = game;
const THREE = __importStar(require("three"));
const entities_1 = require("./entities");
const utils_1 = require("./utils");
const ui_1 = require("./ui");
const definitions_1 = require("./definitions");
function game(scene) {
    var _a;
    let car = new entities_1.Car();
    let obstacles = [];
    let score = 0;
    let gameOver = false;
    let level = 0;
    // Add initial objects
    scene.add(car.mesh);
    scene.add((0, utils_1.createRoad)());
    const laneDividers = (0, utils_1.createLaneDividers)();
    scene.add(laneDividers);
    // Background with wavy lines and spheres for parallax effect
    const background = new entities_1.Background(-150);
    scene.add(background.group);
    // Particles for boost (existing)
    const particleGeometry = new THREE.SphereGeometry(0.05);
    const particleMaterial = new THREE.MeshStandardMaterial({ emissive: 0x00ffaa, emissiveIntensity: 1 });
    const particles = [];
    for (let i = 0; i < 20; i++) {
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        particle.position.set((Math.random() - 0.5) * 2, 0, Math.random() * 2);
        particles.push(particle);
        scene.add(particle);
    }
    function getObstacleSpeed() {
        return definitions_1.BASE_OBSTACLE_SPEED * Math.pow(definitions_1.SPEED_MULTIPLIER, level);
    }
    function getObstacleSpawnRate() {
        return definitions_1.BASE_OBSTACLE_SPAWN_RATE * Math.pow(definitions_1.SPAWN_MULTIPLIER, level);
    }
    function getBackgroundSpeed() {
        return getObstacleSpeed() * 0.4;
    }
    function spawnObstacle() {
        if (Math.random() < getObstacleSpawnRate()) {
            const obstacleMesh = (0, utils_1.createObstacle)();
            const obstacle = new entities_1.Obstacle(obstacleMesh, getObstacleSpeed());
            obstacles.push(obstacle);
            scene.add(obstacleMesh);
        }
    }
    function checkCollisions() {
        // Use precise 3D AABB collision detection with smaller hitboxes for less aggressive gameplay
        obstacles.forEach((obstacle, index) => {
            const carBounds = car.getBounds();
            const obsBounds = obstacle.getBounds();
            // Check for AABB overlap in all three dimensions
            const overlappingX = carBounds.maxX >= obsBounds.minX && carBounds.minX <= obsBounds.maxX;
            const overlappingY = carBounds.maxY >= obsBounds.minY && carBounds.minY <= obsBounds.maxY;
            const overlappingZ = carBounds.maxZ >= obsBounds.minZ && carBounds.minZ <= obsBounds.maxZ;
            if (overlappingX && overlappingY && overlappingZ) {
                gameOver = true;
                ui_1.ui.showGameOver();
                ui_1.ui.saveHighScore(score);
            }
            if (obstacle.isOutOfBounds()) {
                scene.remove(obstacle.mesh);
                obstacles.splice(index, 1);
            }
        });
    }
    function updateParticles() {
        particles.forEach(particle => {
            particle.position.z -= getObstacleSpeed(); // Adapt particle speed to obstacle speed
            if (particle.position.z < -10)
                particle.position.z = Math.random() * 2;
            particle.position.x = car.mesh.position.x + (Math.random() - 0.5) * 2;
        });
    }
    function updateDifficulty() {
        const newLevel = Math.floor(score / definitions_1.SPEED_INCREASE_INTERVAL);
        if (newLevel > level) {
            level = newLevel;
            // On level up, pulse the score for excitement
            ui_1.ui.setScore(score); // Force update to trigger pulse
        }
    }
    // Restart function
    function restart() {
        gameOver = false;
        score = 0;
        level = 0;
        obstacles.forEach(o => scene.remove(o.mesh));
        obstacles = [];
        car.lane = 1;
        car.targetX = 0;
        car.mesh.position.x = 0;
        car.jumping = false;
        car.jumpFrame = 0;
        car.mesh.position.y = 0.25;
        ui_1.ui.hideGameOver();
        ui_1.ui.updateScore(0);
    }
    // Expose to UI for restart
    (_a = document.getElementById('game-over')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', restart);
    return {
        update() {
            if (gameOver)
                return;
            score++;
            updateDifficulty();
            car.update();
            // Update background for parallax effect
            background.update(getBackgroundSpeed());
            spawnObstacle();
            obstacles.forEach(obstacle => obstacle.update());
            checkCollisions();
            updateParticles();
        },
        getScore() {
            return score;
        },
        moveLeft() {
            car.moveLeft();
        },
        moveRight() {
            car.moveRight();
        },
        jump() {
            car.jump();
        },
    };
}
