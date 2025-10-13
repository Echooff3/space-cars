
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
  let comboMultiplier = 1; // Multiplier for consecutive jumps
  let comboCount = 0; // Number of consecutive successful jumps
  let lastJumpTime = 0; // Time since last successful jump
  const COMBO_TIMEOUT = 120; // Frames before combo resets (2 seconds at 60fps)

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

  // Jump success effect particles
  interface JumpParticle {
    mesh: THREE.Mesh;
    velocity: THREE.Vector3;
    life: number;
  }
  const jumpParticles: JumpParticle[] = [];

  function createJumpSuccessEffect(position: THREE.Vector3): void {
    // Create burst of particles
    for (let i = 0; i < 15; i++) {
      const geometry = new THREE.SphereGeometry(0.1);
      const material = new THREE.MeshStandardMaterial({ 
        emissive: 0xffff00, 
        emissiveIntensity: 2,
        color: 0xffff00
      });
      const particle = new THREE.Mesh(geometry, material);
      particle.position.copy(position);
      
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.3,
        Math.random() * 0.5 + 0.2,
        (Math.random() - 0.5) * 0.3
      );
      
      jumpParticles.push({
        mesh: particle,
        velocity: velocity,
        life: 30 // frames
      });
      scene.add(particle);
    }
  }

  function updateJumpParticles(): void {
    for (let i = jumpParticles.length - 1; i >= 0; i--) {
      const particle = jumpParticles[i];
      particle.mesh.position.add(particle.velocity);
      particle.velocity.y -= 0.02; // gravity
      particle.life--;
      
      // Fade out
      const material = particle.mesh.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = (particle.life / 30) * 2;
      material.opacity = particle.life / 30;
      material.transparent = true;
      
      if (particle.life <= 0) {
        scene.remove(particle.mesh);
        jumpParticles.splice(i, 1);
      }
    }
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
      
      // Check if car successfully jumped over obstacle (award points)
      if (!obstacle.jumpedOver && overlappingX && overlappingZ && !overlappingY && car.isJumping()) {
        // Car is jumping, in same lane and Z position, but not colliding vertically - successful jump!
        obstacle.jumpedOver = true;
        
        // Increment combo
        comboCount++;
        comboMultiplier = Math.min(comboCount, 10); // Cap at 10x multiplier
        lastJumpTime = 0; // Reset combo timer
        
        // Calculate points with multiplier
        const basePoints = 30;
        const pointsEarned = basePoints * comboMultiplier;
        score += pointsEarned;
        
        ui.setScore(score); // Trigger pulse animation
        ui.showJumpBonus(pointsEarned, comboMultiplier); // Show points with multiplier
        
        // Extend jump duration for chaining jumps
        car.extendJumpDuration(10); // Add 10 frames of hang time
        
        // Create visual effect at obstacle position
        createJumpSuccessEffect(obstacle.mesh.position.clone());
        
        // Flash the obstacle with color based on combo
        const material = obstacle.mesh.material as THREE.MeshStandardMaterial;
        const originalEmissive = material.emissive.getHex();
        // Color intensity increases with combo
        const comboColors = [0xffff00, 0xff9900, 0xff6600, 0xff3300, 0xff00ff];
        const colorIndex = Math.min(comboMultiplier - 1, comboColors.length - 1);
        material.emissive.setHex(comboColors[colorIndex]);
        setTimeout(() => {
          material.emissive.setHex(originalEmissive);
        }, 200);
      }
      
      // Only check collision if obstacle hasn't been jumped over and car isn't dipping
      if (!obstacle.jumpedOver && overlappingX && overlappingY && overlappingZ && !car.dipping) {
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
    comboMultiplier = 1;
    comboCount = 0;
    lastJumpTime = 0;
    obstacles.forEach(o => scene.remove(o.mesh));
    obstacles = [];
    car.lane = 1;
    car.targetX = 0;
    car.mesh.position.x = 0;
    car.jumping = false;
    car.jumpFrame = 0;
    car.dipping = false;
    car.dipFrame = 0;
    car.jumpDuration = 60; // Reset to base duration
    car.mesh.position.y = 0.25;
    car.resetJumpDuration(); // Reset jump duration to base
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
      
      // Update combo timer - reset if timeout reached
      lastJumpTime++;
      if (lastJumpTime > COMBO_TIMEOUT) {
        comboCount = 0;
        comboMultiplier = 1;
      }
      
      // Update background for parallax effect
      background.update(getBackgroundSpeed());
      spawnObstacle();
      obstacles.forEach(obstacle => obstacle.update());
      checkCollisions();
      updateParticles();
      updateJumpParticles(); // Update jump success particles
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
