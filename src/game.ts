
import * as THREE from 'three';
import { Car, Obstacle, Background } from './entities';
import { createObstacle, createRoad, createLaneDividers } from './utils';
import { ui } from './ui';
import {
  BASE_OBSTACLE_SPEED,
  BASE_OBSTACLE_SPAWN_RATE,
  SPEED_INCREASE_INTERVAL,
  SPEED_MULTIPLIER,
  SPAWN_MULTIPLIER,
} from './definitions';

export function game(scene: THREE.Scene) {
  let car = new Car();
  let obstacles: Obstacle[] = [];
  let score = 0;
  let gameOver = false;
  let level = 0;

  // Add initial objects
  scene.add(car.mesh);
  scene.add(createRoad());

  const laneDividers = createLaneDividers();
  scene.add(laneDividers);

  // Background with wavy lines and spheres for parallax effect
  const background = new Background(-150);
  scene.add(background.group);

  // Particles for boost (existing)
  const particleGeometry = new THREE.SphereGeometry(0.05);
  const particleMaterial = new THREE.MeshStandardMaterial({ emissive: 0x00ffaa, emissiveIntensity: 1 });
  const particles: THREE.Mesh[] = [];
  for (let i = 0; i < 20; i++) {
    const particle = new THREE.Mesh(particleGeometry, particleMaterial);
    particle.position.set((Math.random() - 0.5) * 2, 0, Math.random() * 2);
    particles.push(particle);
    scene.add(particle);
  }

  function getObstacleSpeed(): number {
    return BASE_OBSTACLE_SPEED * Math.pow(SPEED_MULTIPLIER, level);
  }

  function getObstacleSpawnRate(): number {
    return BASE_OBSTACLE_SPAWN_RATE * Math.pow(SPAWN_MULTIPLIER, level);
  }

  function getBackgroundSpeed(): number {
    return getObstacleSpeed() * 0.4;
  }

  function spawnObstacle(): void {
    if (Math.random() < getObstacleSpawnRate()) {
      const obstacleMesh = createObstacle();
      const obstacle = new Obstacle(obstacleMesh, getObstacleSpeed());
      obstacles.push(obstacle);
      scene.add(obstacleMesh);
    }
  }

  function checkCollisions(): void {
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
        ui.showGameOver();
        ui.saveHighScore(score);
      }
      if (obstacle.isOutOfBounds()) {
        scene.remove(obstacle.mesh);
        obstacles.splice(index, 1);
      }
    });
  }

  function updateParticles(): void {
    particles.forEach(particle => {
      particle.position.z -= getObstacleSpeed(); // Adapt particle speed to obstacle speed
      if (particle.position.z < -10) particle.position.z = Math.random() * 2;
      particle.position.x = car.mesh.position.x + (Math.random() - 0.5) * 2;
    });
  }

  function updateDifficulty(): void {
    const newLevel = Math.floor(score / SPEED_INCREASE_INTERVAL);
    if (newLevel > level) {
      level = newLevel;
      // On level up, pulse the score for excitement
      ui.setScore(score); // Force update to trigger pulse
    }
  }

  // Restart function
  function restart(): void {
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
    ui.hideGameOver();
    ui.updateScore(0);
  }

  // Expose to UI for restart
  document.getElementById('game-over')?.addEventListener('click', restart);

  return {
    update(): void {
      if (gameOver) return;
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
    getScore(): number {
      return score;
    },
    moveLeft(): void {
      car.moveLeft();
    },
    moveRight(): void {
      car.moveRight();
    },
    jump(): void {
      car.jump();
    },
  };
}
