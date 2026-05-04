import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  PARTICLE_COUNT, FORMATION_COUNT,
  buildLogoTargets, buildScatterPositions, buildVelocities,
  buildColors, buildSizes,
  vertexShader, fragmentShader,
} from './particleUtils';

// ── Phase timing (seconds) ──────────────────────────────────────────────
const T_SWIRL     = 0.7;
const T_FORM      = 2.1;
const T_SOLID     = 3.5;
const T_COMPLETE  = 4.2;

export default function ParticleSystem({ onFormationComplete }) {
  const pointsRef = useRef();
  const { camera } = useThree();

  // Mutable data (not React state — avoids re-renders)
  const pos     = useMemo(buildScatterPositions, []);
  const vel     = useMemo(buildVelocities,       []);
  const targets = useMemo(buildLogoTargets,      []);
  const colors  = useMemo(buildColors,           []);
  const sizes   = useMemo(buildSizes,            []);

  // Snapshot of positions when formation phase begins
  const formStart = useRef(null);
  const completedRef = useRef(false);

  // Uniform refs
  const uniforms = useRef({
    uOpacity: { value: 1.0 },
  });

  useFrame(({ clock }) => {
    const t   = clock.getElapsedTime();
    const pts = pointsRef.current;
    if (!pts) return;

    const posAttr = pts.geometry.attributes.position;
    const colAttr = pts.geometry.attributes.aColor;

    // ── Phase 0: Drift ─────────────────────────────────────────────────
    if (t < T_SWIRL) {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        pos[i3]     += vel[i3]     * 0.016;
        pos[i3 + 1] += vel[i3 + 1] * 0.016;
        pos[i3 + 2] += vel[i3 + 2] * 0.016;
        posAttr.array[i3]     = pos[i3];
        posAttr.array[i3 + 1] = pos[i3 + 1];
        posAttr.array[i3 + 2] = pos[i3 + 2];
      }
    }

    // ── Phase 1: Swirl ──────────────────────────────────────────────────
    else if (t < T_FORM) {
      const progress = (t - T_SWIRL) / (T_FORM - T_SWIRL); // 0→1
      const angSpeed = 1.8 + progress * 3.5;
      const shrink   = 1 - progress * 0.55;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        const px = pos[i3], py = pos[i3 + 1], pz = pos[i3 + 2];

        // Spiral toward center
        const r     = Math.sqrt(px * px + py * py);
        const angle = Math.atan2(py, px) + angSpeed * 0.018;
        const nr    = r * shrink;

        pos[i3]     = Math.cos(angle) * nr;
        pos[i3 + 1] = Math.sin(angle) * nr;
        pos[i3 + 2] = pz * 0.988;

        posAttr.array[i3]     = pos[i3];
        posAttr.array[i3 + 1] = pos[i3 + 1];
        posAttr.array[i3 + 2] = pos[i3 + 2];

        // Colours shift toward green as they swirl in
        const g = progress;
        colAttr.array[i3]     = 1.0 - g * 0.6;
        colAttr.array[i3 + 1] = 0.9 + g * 0.1;
        colAttr.array[i3 + 2] = 1.0 - g * 0.6;
      }

      // Slow camera drift during swirl
      camera.position.x = Math.sin(t * 0.25) * 0.4;
      camera.position.y = Math.cos(t * 0.18) * 0.2;
      camera.lookAt(0, 0, 0);
    }

    // ── Phase 2: Formation ──────────────────────────────────────────────
    else if (t < T_SOLID) {
      if (!formStart.current) {
        formStart.current = new Float32Array(pos); // snapshot
      }

      const raw      = (t - T_FORM) / (T_SOLID - T_FORM); // 0→1
      const progress = raw < 0.5 ? 2 * raw * raw : -1 + (4 - 2 * raw) * raw; // easeInOut

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;

        if (i < FORMATION_COUNT) {
          // Lerp toward logo target
          const tx = targets[i3], ty = targets[i3 + 1], tz = targets[i3 + 2];
          const sx = formStart.current[i3], sy = formStart.current[i3 + 1], sz = formStart.current[i3 + 2];
          pos[i3]     = sx + (tx - sx) * progress;
          pos[i3 + 1] = sy + (ty - sy) * progress;
          pos[i3 + 2] = sz + (tz - sz) * progress;

          // Flash white → vivid green as they lock in
          colAttr.array[i3]     = 1.0 - progress * 0.55;
          colAttr.array[i3 + 1] = 1.0;
          colAttr.array[i3 + 2] = 1.0 - progress * 0.55;
        } else {
          // Excess particles fly outward and fade
          pos[i3]     *= 1.008;
          pos[i3 + 1] *= 1.008;
          pos[i3 + 2] += 0.015;
          colAttr.array[i3]     *= 0.97;
          colAttr.array[i3 + 1] *= 0.97;
          colAttr.array[i3 + 2] *= 0.97;
        }

        posAttr.array[i3]     = pos[i3];
        posAttr.array[i3 + 1] = pos[i3 + 1];
        posAttr.array[i3 + 2] = pos[i3 + 2];
      }

      // Return camera to center
      camera.position.x *= 0.92;
      camera.position.y *= 0.92;
      camera.lookAt(0, 0, 0);
    }

    // ── Phase 3: Solidify / fade out ───────────────────────────────────
    else if (t < T_COMPLETE) {
      const p = (t - T_SOLID) / (T_COMPLETE - T_SOLID);
      uniforms.current.uOpacity.value = 1 - p;

      // Keep rotating the formation
      pts.rotation.y += 0.008;
    }

    // ── Done ────────────────────────────────────────────────────────────
    else if (!completedRef.current) {
      completedRef.current = true;
      onFormationComplete();
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pos,    3]} usage={35048} />
        <bufferAttribute attach="attributes-aColor"   args={[colors, 3]} usage={35048} />
        <bufferAttribute attach="attributes-aSize"    args={[sizes,  1]} usage={35044} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms.current}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
