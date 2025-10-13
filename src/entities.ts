
import * as THREE from 'three';
import { createNeonMaterial } from './utils';
import { LANE_WIDTH, JUMP_HEIGHT, JUMP_DURATION, DIP_DURATION, DIP_DEPTH } from './definitions';

export class Car {
  mesh: THREE.Mesh;
  lane: number = 1; // 0: left, 1: center, 2: right
  targetX: number;
  jumping: boolean = false;
  jumpFrame: number = 0;
  jumpDuration: number = JUMP_DURATION; // Dynamic jump duration
  maxJumpDuration: number = JUMP_DURATION * 2.5; // Cap at 2.5x base duration
  dipping: boolean = false;
  dipFrame: number = 0;

  constructor() {
    const geometry = new THREE.BoxGeometry(1, 0.5, 2);
    const material = createNeonMaterial(0xff00aa, 0xff00aa);
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(0, 0.25, 0);
    this.targetX = 0;
  }

  moveLeft(): void {
    if (this.lane > 0 && !this.jumping) {
      this.lane--;
      this.targetX = (this.lane - 1) * LANE_WIDTH;
    }
  }

  moveRight(): void {
    if (this.lane < 2 && !this.jumping) {
      this.lane++;
      this.targetX = (this.lane - 1) * LANE_WIDTH;
    }
  }

  jump(): void {
    if (!this.jumping && !this.dipping) {
      this.dipping = true;
      this.dipFrame = DIP_DURATION;
    }
  }

  extendJumpDuration(amount: number = 10): void {
    // Extend the current jump duration, capped at max
    this.jumpDuration = Math.min(this.jumpDuration + amount, this.maxJumpDuration);
    
    // If currently jumping, also extend the current jump
    if (this.jumping) {
      this.jumpFrame += amount;
    }
  }

  resetJumpDuration(): void {
    this.jumpDuration = JUMP_DURATION;
  }

  update(): void {
    this.mesh.position.x += (this.targetX - this.mesh.position.x) * 0.1;

    // Handle dip animation before jump
    if (this.dipping) {
      const dipProgress = 1 - (this.dipFrame / DIP_DURATION);
      // Smooth easing for dip using sine wave
      const easedProgress = Math.sin(dipProgress * Math.PI / 2);
      this.mesh.position.y = 0.25 - (easedProgress * DIP_DEPTH);
      
      this.dipFrame--;
      
      if (this.dipFrame <= 0) {
        this.dipping = false;
        this.jumping = true;
        this.jumpFrame = this.jumpDuration;
      }
    }

    if (this.jumping) {
      const totalDuration = this.jumpDuration;
      const halfDuration = totalDuration / 2;
      
      if (this.jumpFrame > halfDuration) {
        // Ascending - use ease-out for smoother launch
        const progress = 1 - (this.jumpFrame - halfDuration) / halfDuration;
        const easedProgress = 1 - Math.pow(1 - progress, 3); // cubic ease-out
        this.mesh.position.y = 0.25 + easedProgress * JUMP_HEIGHT;
      } else {
        // Descending - use ease-in for bouncy landing
        const progress = this.jumpFrame / halfDuration;
        const easedProgress = Math.pow(progress, 2); // quadratic ease-in
        this.mesh.position.y = 0.25 + easedProgress * JUMP_HEIGHT;
      }
      this.jumpFrame--;

      if (this.jumpFrame <= 0) {
        this.jumping = false;
        this.mesh.position.y = 0.25;
      }
    }
  }

  isJumping(): boolean {
    return this.jumping;
  }

  getBounds(): { minX: number; maxX: number; minY: number; maxY: number; minZ: number; maxZ: number } {
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

export class Obstacle {
  mesh: THREE.Mesh;
  speed: number;
  jumpedOver: boolean = false; // Track if player has jumped over this obstacle

  constructor(mesh: THREE.Mesh, speed: number) {
    this.mesh = mesh;
    this.speed = speed;
  }

  update(): void {
    this.mesh.position.z += this.speed;
  }

  isOutOfBounds(): boolean {
    return this.mesh.position.z > 100;
  }

  getBounds(): { minX: number; maxX: number; minY: number; maxY: number; minZ: number; maxZ: number } {
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

export class Background {
  group: THREE.Group;
  lines: THREE.Line[];
  spheres: THREE.Mesh[];
  skyParticles: THREE.Points;
  time: number = 0;

  constructor(sceneDepth: number = -150) {
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
      const material = createNeonMaterial(color, color);
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
      particlePositions.push(
        (Math.random() - 0.5) * 2000,
        Math.random() * 1000 + 50,
        (Math.random() - 0.5) * 2000
      );
      particleColors.push(
        Math.random() * 0.5 + 0.5, // r: soft blues and whites
        Math.random() * 0.5 + 0.5,
        1.0  // b: predominantly blue for sky effect
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

  update(speed: number): void {
    this.time += 0.02; // Time step for waves

    // Update wavy lines: Animate y positions with sine waves
    this.lines.forEach((line, index) => {
      const phase = index * 0.3; // Different phases for each line
      const positions = line.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        const baseX = (i / 3 / 99 - 0.5) * 100; // Reconstruct x from index
        positions[i + 1] = Math.sin(baseX * 0.02 + this.time + phase) * 5; // Wave y
      }
      line.geometry.attributes.position.needsUpdate = true;
      // Parallax movement: Move z at slower speed
      line.position.z += speed * (index + 1) / this.lines.length; // Deeper layers move slower
      if (line.position.z > 50) line.position.z = -200; // Loop if goes out of scene
    });

    // Update spheres: Float up/down and rotate, move z
    this.spheres.forEach((sphere, index) => {
      sphere.position.y += Math.sin(this.time + index * 0.5) * 0.1; // Float
      sphere.rotation.x += 0.01;
      sphere.rotation.y += 0.02;
      // Parallax: Move z at speed
      sphere.position.z += speed * (index % 3 + 1) / 3; // Vary speeds
      if (sphere.position.z > 50) sphere.position.z = -250; // Loop
    });

    // Update sky particles: Subtle floating and parallax
    const particlePositions = this.skyParticles.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < particlePositions.length; i += 3) {
      particlePositions[i + 1] += Math.sin(this.time + i * 0.001) * 0.05; // Subtle y oscillation
      particlePositions[i + 2] += speed * 0.5; // Parallax z movement, slower for depth
      if (particlePositions[i + 2] > 500) particlePositions[i + 2] -= 1000; // Loop far particles
    }
    this.skyParticles.geometry.attributes.position.needsUpdate = true;
  }
}
