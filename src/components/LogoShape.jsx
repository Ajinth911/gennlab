import { useMemo } from 'react';
import * as THREE from 'three';

const EXTRUDE_SETTINGS = {
  depth: 0.1,
  bevelEnabled: true,
  bevelThickness: 0.02,
  bevelSize: 0.02,
  bevelSegments: 5,
};

function createShape(type, orientation) {
  const shape = new THREE.Shape();
  const radius = 0.42;

  if (type === 'full') {
    shape.absarc(0, 0, radius, 0, Math.PI * 2, false);
  } else {
    // orientation: 0 (up), 1 (right), 2 (left), 3 (down)
    switch (orientation) {
      case 0: // Curve Up (Flat Bottom)
        shape.absarc(0, 0, radius, 0, Math.PI, false);
        shape.lineTo(radius, 0);
        break;
      case 1: // Curve Right (Flat Left)
        shape.absarc(0, 0, radius, -Math.PI / 2, Math.PI / 2, false);
        shape.lineTo(0, -radius);
        break;
      case 2: // Curve Left (Flat Right)
        shape.absarc(0, 0, radius, Math.PI / 2, 3 * Math.PI / 2, false);
        shape.lineTo(0, radius);
        break;
      case 3: // Curve Down (Flat Top)
        shape.absarc(0, 0, radius, Math.PI, 2 * Math.PI, false);
        shape.lineTo(-radius, 0);
        break;
    }
  }
  return shape;
}

export function GenLabLogo({ scale = 1, color = '#000000' }) {
  const pieces = useMemo(() => {
    // 3x3 Grid Layout
    // (-1, 1)  (0, 1)  (1, 1)
    // (-1, 0)  (0, 0)  (1, 0)
    // (-1,-1)  (0,-1)  (1,-1)
    const layout = [
      { pos: [-1,  1, 0], type: 'full' },
      { pos: [ 0,  1, 0], type: 'half', dir: 3 }, // Flat Top (Down)
      { pos: [ 1,  1, 0], type: 'full' },
      
      { pos: [-1,  0, 0], type: 'half', dir: 1 }, // Flat Left (Right)
      { pos: [ 0,  0, 0], type: 'full' },
      { pos: [ 1,  0, 0], type: 'half', dir: 2 }, // Flat Right (Left)
      
      { pos: [-1, -1, 0], type: 'full' },
      { pos: [ 0, -1, 0], type: 'half', dir: 0 }, // Flat Bottom (Up)
      { pos: [ 1, -1, 0], type: 'full' },
    ];

    return layout.map((item, idx) => ({
      ...item,
      id: idx,
      geo: new THREE.ExtrudeGeometry(createShape(item.type, item.dir), EXTRUDE_SETTINGS),
    }));
  }, []);

  return (
    <group scale={scale}>
      {pieces.map((p) => (
        <mesh key={p.id} geometry={p.geo} position={p.pos}>
          <meshPhysicalMaterial
            color={color}
            roughness={0.2}
            metalness={0.1}
            reflectivity={0.5}
            clearcoat={1}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function LogoShape({ color = '#000000' }) {
  return <GenLabLogo scale={0.4} color={color} />;
}
