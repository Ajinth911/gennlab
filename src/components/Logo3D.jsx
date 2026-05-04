import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';

const EXTRUDE_SETTINGS = {
  depth: 0.08,
  bevelEnabled: true,
  bevelThickness: 0.015,
  bevelSize: 0.015,
  bevelSegments: 4,
};

/* =========================
   Base Shape (flat bottom)
========================= */
function semiUp() {
  const s = new THREE.Shape();
  const r = 0.47;

  s.moveTo(-r, 0);
  s.absarc(0, 0, r, Math.PI, 0, true);
  s.lineTo(-r, 0);

  return s;
}

/* =========================
   Logo
========================= */
export function GenLabLogo({ scale = 1, color = '#000000' }) {
  const pieces = useMemo(() => {
    const baseGeo = new THREE.ExtrudeGeometry(semiUp(), EXTRUDE_SETTINGS);
    baseGeo.center();

    const make = (rot, pos, id) => ({
      id,
      geo: baseGeo.clone(),
      rot,
      pos,
    });

    return [
      // ── TOP-LEFT (UNCHANGED) ──
      make([0, 0, Math.PI], [-0.513,  0.744, 0], 0), // DOWN
      make([0, 0, 0],        [-0.513,  0.240, 0], 1), // UP

      // ── TOP-RIGHT (FORM CIRCLE) ──
      make([0, 0, -Math.PI / 2], [ 0.238,  0.486, 0], 2), // RIGHT-facing
      make([0, 0,  Math.PI / 2], [ 0.730,  0.485, 0], 3), // LEFT-facing

      // ── BOTTOM-LEFT (FORM CIRCLE) ──
      make([0, 0, -Math.PI / 2], [-0.774, -0.499, 0], 4), // RIGHT-facing
      make([0, 0,  Math.PI / 2], [-0.296, -0.500, 0], 5), // LEFT-facing

      // ── BOTTOM-RIGHT (UNCHANGED) ──
      make([0, 0, Math.PI], [ 0.502, -0.240, 0], 6), // DOWN
      make([0, 0, 0],       [ 0.502, -0.701, 0], 7), // UP
    ];
  }, []);

  return (
    <group scale={scale}>
      {pieces.map((p) => (
        <mesh
          key={p.id}
          geometry={p.geo}
          position={p.pos}
          rotation={p.rot}
        >
          <meshPhysicalMaterial
            color={color}
            roughness={0.25}
            metalness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}

/* =========================
   Cube
========================= */
export default function Logo3D({ scale = 0.6 }) {
  const groupRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (!groupRef.current) return;

    groupRef.current.rotation.y = t * 0.4;
    groupRef.current.rotation.x = Math.sin(t * 0.3) * 0.2;
    groupRef.current.position.y = Math.sin(t * 0.8) * 0.08;
  });

  const FACE = 0.61;

  const faces = [
    { pos: [0, 0,  FACE], rot: [0, 0, 0] },
    { pos: [0, 0, -FACE], rot: [0, Math.PI, 0] },
    { pos: [-FACE, 0, 0], rot: [0, -Math.PI / 2, 0] },
    { pos: [ FACE, 0, 0], rot: [0,  Math.PI / 2, 0] },
    { pos: [0,  FACE, 0], rot: [-Math.PI / 2, 0, 0] },
    { pos: [0, -FACE, 0], rot: [ Math.PI / 2, 0, 0] },
  ];

  return (
    <group ref={groupRef} scale={scale}>
      <RoundedBox args={[1.2, 1.2, 1.2]} radius={0.15} smoothness={4}>
        <meshPhysicalMaterial
          color="#0a0a0a"
          roughness={0.3}
          metalness={0.2}
          reflectivity={0.6}
          clearcoat={0.5}
        />
      </RoundedBox>

      {faces.map((f, i) => (
        <group key={i} position={f.pos} rotation={f.rot}>
          <GenLabLogo scale={0.35} color="#000000" />
        </group>
      ))}
    </group>
  );
}