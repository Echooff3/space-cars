
import * as THREE from 'three';
import { NEON_COLORS } from './definitions';

export function createNeonMaterial(color: number, emissive: number): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    emissive,
    emissiveIntensity: 0.8,
  });
}

export function createObstacle(): THREE.Mesh {
  const geometry = new THREE.BoxGeometry(1, 2, 1);
  const color = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
  const material = createNeonMaterial(color, color);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.z = -50;
  mesh.position.x = (Math.floor(Math.random() * 3) - 1) * 3; // Random lane
  return mesh;
}

export function createRoad(): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(15, 200);
  const material = new THREE.MeshStandardMaterial({ color: 0x111111 });
  const road = new THREE.Mesh(geometry, material);
  road.rotation.x = -Math.PI / 2;
  return road;
}

export function createLaneDividers(): THREE.Group {
  const group = new THREE.Group();
  for (let i = -1; i <= 1; i++) {
    const geometry = new THREE.PlaneGeometry(0.1, 200);
    const material = createNeonMaterial(0x00ffff, 0x00ffff);
    const divider = new THREE.Mesh(geometry, material);
    divider.position.set(i * 3, 0.01, -100);
    divider.rotation.x = -Math.PI / 2;
    group.add(divider);
  }
  return group;
}
