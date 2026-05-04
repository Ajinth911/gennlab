import * as THREE from 'three';

const PARTICLE_COUNT = 2000;
const FORMATION_COUNT = 480;

// ── Logo target positions (atom/orbital structure) ─────────────────────
export function buildLogoTargets() {
  const pts = [];

  // Outer ring — 120 pts
  for (let i = 0; i < 120; i++) {
    const a = (i / 120) * Math.PI * 2;
    pts.push(Math.cos(a) * 1.0, Math.sin(a) * 1.0, (Math.random() - 0.5) * 0.05);
  }

  // Orbit 1 (tilted 60° on X) — 80 pts
  for (let i = 0; i < 80; i++) {
    const a = (i / 80) * Math.PI * 2;
    const r = 0.58, tilt = Math.PI / 3;
    const y = Math.sin(a) * r;
    pts.push(Math.cos(a) * r, y * Math.cos(tilt), y * Math.sin(tilt));
  }

  // Orbit 2 (tilted −60° on X) — 80 pts
  for (let i = 0; i < 80; i++) {
    const a = (i / 80) * Math.PI * 2;
    const r = 0.75, tilt = -Math.PI / 3;
    const y = Math.sin(a) * r;
    pts.push(Math.cos(a) * r, y * Math.cos(tilt), y * Math.sin(tilt));
  }

  // Horizontal orbit (Y-axis) — 80 pts
  for (let i = 0; i < 80; i++) {
    const a = (i / 80) * Math.PI * 2;
    const r = 0.67;
    pts.push(Math.cos(a) * r, (Math.random() - 0.5) * 0.03, Math.sin(a) * r);
  }

  // Centre nucleus — 60 pts
  for (let i = 0; i < 60; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    const r     = 0.18 * Math.cbrt(Math.random());
    pts.push(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi));
  }

  // Cardinal dots (4 × 15) — 60 pts
  [[0, 1, 0], [0, -1, 0], [1, 0, 0], [-1, 0, 0]].forEach(([dx, dy, dz]) => {
    for (let i = 0; i < 15; i++)
      pts.push(dx + (Math.random() - 0.5) * 0.04, dy + (Math.random() - 0.5) * 0.04, dz + (Math.random() - 0.5) * 0.04);
  });

  return new Float32Array(pts); // 480 × 3
}

// ── Initial scattered positions ────────────────────────────────────────
export function buildScatterPositions() {
  const pos = new Float32Array(PARTICLE_COUNT * 3);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const r     = 3.5 + Math.random() * 4;
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i * 3 + 2] = r * Math.cos(phi) - 1;
  }
  return pos;
}

// ── Per-particle velocities ────────────────────────────────────────────
export function buildVelocities() {
  const vel = new Float32Array(PARTICLE_COUNT * 3);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    vel[i * 3]     = (Math.random() - 0.5) * 0.12;
    vel[i * 3 + 1] = (Math.random() - 0.5) * 0.12;
    vel[i * 3 + 2] = (Math.random() - 0.5) * 0.06;
  }
  return vel;
}

// ── Colors (white → green gradient per particle) ───────────────────────
export function buildColors() {
  const col = new Float32Array(PARTICLE_COUNT * 3);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const t = Math.random();
    col[i * 3]     = 0.7 + t * 0.3;   // R
    col[i * 3 + 1] = 0.85 + t * 0.15; // G
    col[i * 3 + 2] = 0.7 + t * 0.3;   // B
  }
  return col;
}

// ── Sizes ──────────────────────────────────────────────────────────────
export function buildSizes() {
  const sz = new Float32Array(PARTICLE_COUNT);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    sz[i] = i < FORMATION_COUNT
      ? 2.5 + Math.random() * 2.5   // formation particles — slightly larger
      : 1.2 + Math.random() * 1.8;  // background dust
  }
  return sz;
}

// ── Vertex shader ──────────────────────────────────────────────────────
export const vertexShader = /* glsl */`
  attribute float aSize;
  attribute vec3  aColor;
  varying   vec3  vColor;
  uniform   float uOpacity;
  varying   float vOpacity;

  void main() {
    vColor   = aColor;
    vOpacity = uOpacity;
    vec4 mvPos    = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize  = aSize * (380.0 / -mvPos.z);
    gl_Position   = projectionMatrix * mvPos;
  }
`;

// ── Fragment shader ────────────────────────────────────────────────────
export const fragmentShader = /* glsl */`
  varying vec3  vColor;
  varying float vOpacity;

  void main() {
    float d  = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float s  = pow(1.0 - smoothstep(0.0, 0.5, d), 2.0);
    gl_FragColor = vec4(vColor, s * vOpacity);
  }
`;

export { PARTICLE_COUNT, FORMATION_COUNT };
