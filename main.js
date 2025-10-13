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
const THREE = __importStar(require("three"));
const EffectComposer_js_1 = require("three/addons/postprocessing/EffectComposer.js");
const RenderPass_js_1 = require("three/addons/postprocessing/RenderPass.js");
const UnrealBloomPass_js_1 = require("three/addons/postprocessing/UnrealBloomPass.js");
const game_1 = require("./game");
const ui_1 = require("./ui");
const persistence_1 = require("./libs/persistence");
async function main() {
    var _a;
    // Initialize high score
    const highScore = (_a = await persistence_1.persistence.getItem('highScore')) !== null && _a !== void 0 ? _a : 0;
    ui_1.ui.setHighScore(parseInt(highScore.toString()));
    // Create scene, camera, renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 50, 200);
    // Add starry 1980s sky background
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 1000;
    const starPositions = [];
    const starColors = [];
    for (let i = 0; i < starCount; i++) {
        starPositions.push((Math.random() - 0.5) * 2000, // x
        (Math.random() - 0.5) * 2000, // y
        (Math.random() - 0.5) * 2000 // z
        );
        starColors.push(Math.random() * 0.5 + 0.5, // r (varied brightness)
        Math.random() * 0.5 + 0.5, // g
        Math.random() * 0.5 + 0.5 // b
        );
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
    const starMaterial = new THREE.PointsMaterial({
        size: 2,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    // Shooting stars effect
    const shootingStarGeometry = new THREE.BufferGeometry();
    const shootingStarPositions = Array(10).fill(null).map(() => [
        (Math.random() - 0.5) * 2000,
        (Math.random() - 0.5) * 2000,
        (Math.random() - 0.5) * 2000
    ]).flat();
    shootingStarGeometry.setAttribute('position', new THREE.Float32BufferAttribute(shootingStarPositions, 3));
    const shootingStarMaterial = new THREE.PointsMaterial({
        size: 4,
        color: 0xffffff,
        blending: THREE.AdditiveBlending,
        transparent: true
    });
    const shootingStars = new THREE.Points(shootingStarGeometry, shootingStarMaterial);
    scene.add(shootingStars);
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('game-canvas'), antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);
    // Bloom effect
    const composer = new EffectComposer_js_1.EffectComposer(renderer);
    composer.addPass(new RenderPass_js_1.RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass_js_1.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = 0.1;
    bloomPass.strength = 2;
    bloomPass.radius = 1;
    composer.addPass(bloomPass);
    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040, 0.1);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xff00ff, 0.5);
    directionalLight.position.set(0, 10, 10);
    scene.add(directionalLight);
    // Neon lights
    const neonLight1 = new THREE.PointLight(0x00ff00, 2, 100);
    neonLight1.position.set(-5, 5, -10);
    scene.add(neonLight1);
    const neonLight2 = new THREE.PointLight(0xff0000, 2, 100);
    neonLight2.position.set(5, 5, -10);
    scene.add(neonLight2);
    const neonLight3 = new THREE.PointLight(0x0000ff, 2, 100);
    neonLight3.position.set(0, 5, 0);
    scene.add(neonLight3);
    // Game instance
    const gameInstance = (0, game_1.game)(scene);
    // Touch controls
    let touchStartX = 0;
    let touchStartY = 0;
    const canvas = document.getElementById('game-canvas');
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        if (Math.abs(deltaX) > screenWidth * 0.1 && Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 0) {
                gameInstance.moveRight();
            }
            else {
                gameInstance.moveLeft();
            }
        }
        else if (Math.abs(deltaY) > screenHeight * 0.1 && Math.abs(deltaY) > Math.abs(deltaX)) {
            if (deltaY < 0) { // Swipe up
                gameInstance.jump();
            }
        }
    });
    // Handle resize
    window.addEventListener('resize', () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        composer.setSize(width, height);
    });
    ui_1.ui.showControls();
    let time = 0;
    // Game loop
    function animate() {
        requestAnimationFrame(animate);
        time += 0.01;
        // Animate stars
        stars.material.size = 2 + Math.sin(time * 0.5) * 0.5;
        // Animate shooting stars
        const positions = shootingStars.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += 5; // move x
            positions[i + 1] += 5; // move y
            positions[i + 2] += 5; // move z
            if (positions[i + 2] > 1000) {
                positions[i] = (Math.random() - 0.5) * 2000;
                positions[i + 1] = (Math.random() - 0.5) * 2000;
                positions[i + 2] = (Math.random() - 0.5) * 2000;
            }
        }
        shootingStars.geometry.attributes.position.needsUpdate = true;
        gameInstance.update();
        ui_1.ui.updateScore(gameInstance.getScore());
        composer.render();
    }
    animate();
}
main();
