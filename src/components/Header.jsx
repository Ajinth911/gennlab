import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { GenLabLogo } from './Logo3D';

function HeaderLogoCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 40 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      style={{ width: 24, height: 24 }}
    >
      <ambientLight intensity={1.5} />
      <pointLight position={[5, 5, 5]} intensity={1} />
      <Suspense fallback={null}>
        <group rotation={[0, 0, 0]}>
          <GenLabLogo scale={1.2} color="#ffffff" />
        </group>
      </Suspense>
    </Canvas>
  );
}

export default function Header() {
  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between w-full px-8 py-6 pointer-events-none"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Left: MENU */}
      <div className="flex-1 flex justify-start pointer-events-auto">
        <a href="#menu" className="flex items-center gap-2 text-[11px] tracking-[0.1em] font-light text-white uppercase hover:opacity-70 transition-opacity">
          <span className="text-[10px]">✕</span> MENU
        </a>
      </div>

      {/* Center: LOGO */}
      <div className="flex flex-col items-center gap-1 pointer-events-auto">
        <HeaderLogoCanvas />
        <span className="text-[9px] tracking-[0.1em] font-medium text-white uppercase">
          GenLab
        </span>
      </div>

      {/* Right: CONTACT */}
      <div className="flex-1 flex justify-end items-center pointer-events-auto">
        <a href="#contact" className="text-[11px] tracking-[0.1em] font-light text-white uppercase hover:opacity-70 transition-opacity">
          CONTACT US
        </a>
      </div>
    </motion.header>
  );
}
