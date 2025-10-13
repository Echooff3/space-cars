
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { game } from './game';
import { ui } from './ui';
import { persistence } from './libs/persistence';

async function main(): Promise<void> {
  // Initialize high score
  const highScore = await persistence.getItem('highScore') ?? 0;
  ui.setHighScore(parseInt(highScore.toString()));

  // Create scene, camera, renderer
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x000000, 50, 200);

  // Add starry 1980s sky background
  const starGeometry = new THREE.BufferGeometry();
  const starCount = 1000;
  const starPositions = [];
  const starColors = [];
  for (let i = 0; i < starCount; i++) {
    starPositions.push(
      (Math.random() - 0.5) * 2000, // x
      (Math.random() - 0.5) * 2000, // y
      (Math.random() - 0.5) * 2000  // z
    );
    starColors.push(
      Math.random() * 0.5 + 0.5, // r (varied brightness)
      Math.random() * 0.5 + 0.5, // g
      Math.random() * 0.5 + 0.5  // b
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

  const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('game-canvas') as HTMLCanvasElement, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000);

  // Bloom effect
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
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
  const gameInstance = game(scene);

  // Touch controls
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchStartTime = Date.now();
  });

  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const touchEndTime = Date.now();
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const touchDuration = touchEndTime - touchStartTime;
    const screenWidth = window.innerWidth;

    // Check if it's a tap (short duration and minimal movement)
    const isTap = touchDuration < 200 && Math.abs(deltaX) < 30 && Math.abs(deltaY) < 30;

    if (isTap) {
      // Tap to jump
      gameInstance.jump();
    } else if (Math.abs(deltaX) > screenWidth * 0.1 && Math.abs(deltaX) > Math.abs(deltaY)) {
      // Swipe left/right for lane change
      if (deltaX > 0) {
        gameInstance.moveRight();
      } else {
        gameInstance.moveLeft();
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

  ui.showControls();

  let time = 0;
  // Game loop
  function animate(): void {
    requestAnimationFrame(animate);
    time += 0.01;

    // Animate stars
    stars.material.size = 2 + Math.sin(time * 0.5) * 0.5;

    // Animate shooting stars
    const positions = shootingStars.geometry.attributes.position.array as Float32Array;
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
    ui.updateScore(gameInstance.getScore());
    composer.render();
  }
  animate();
}

main();
