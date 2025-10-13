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
exports.createNeonMaterial = createNeonMaterial;
exports.createObstacle = createObstacle;
exports.createRoad = createRoad;
exports.createLaneDividers = createLaneDividers;
const THREE = __importStar(require("three"));
const definitions_1 = require("./definitions");
function createNeonMaterial(color, emissive) {
    return new THREE.MeshStandardMaterial({
        color,
        emissive,
        emissiveIntensity: 0.8,
    });
}
function createObstacle() {
    const geometry = new THREE.BoxGeometry(1, 2, 1);
    const color = definitions_1.NEON_COLORS[Math.floor(Math.random() * definitions_1.NEON_COLORS.length)];
    const material = createNeonMaterial(color, color);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = -50;
    mesh.position.x = (Math.floor(Math.random() * 3) - 1) * 3; // Random lane
    return mesh;
}
function createRoad() {
    const geometry = new THREE.PlaneGeometry(15, 200);
    const material = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const road = new THREE.Mesh(geometry, material);
    road.rotation.x = -Math.PI / 2;
    return road;
}
function createLaneDividers() {
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
