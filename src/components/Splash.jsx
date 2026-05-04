import { useEffect, useState, Suspense, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import Logo3D from './Logo3D';

function FloatingCube() {
  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    // Slow elegant rotation
    groupRef.current.rotation.y = t * 0.2;
    groupRef.current.rotation.x = Math.sin(t * 0.5) * 0.1;
    // Gentle floating
    groupRef.current.position.y = Math.sin(t * 1.5) * 0.1;
  });

  return (
    <group ref={groupRef}>
      <Logo3D scale={1.8} />
    </group>
  );
}

export default function Splash({ onDone }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDone, 1200); // Allow time for exit animation
    }, 2800); // Total splash duration ~2.8s before starting exit
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#020503]"
        >
          {/* Subtle radial gradients for depth */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[40vw] md:h-[40vw] rounded-full bg-[#4caf6e]/5 blur-[120px]" />
          </div>

          {/* 3D Logo Scene */}
          <div className="relative z-10 w-full h-[50vh] max-h-[400px]">
            <Suspense fallback={null}>
              <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <ambientLight intensity={1.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#ffffff" />
                <Environment preset="city" />
                <FloatingCube />
                <ContactShadows 
                  position={[0, -1.5, 0]} 
                  opacity={0.5} 
                  scale={5} 
                  blur={2} 
                  far={4} 
                  color="#000000"
                />
              </Canvas>
            </Suspense>
          </div>

          {/* Brand Name & Loading Indicator */}
          <div className="relative z-10 mt-12 flex flex-col items-center gap-6">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="text-2xl tracking-[0.3em] font-light text-white/90 uppercase"
            >
              GenLab
            </motion.h1>

            {/* Elegant thin progress line */}
            <div className="w-32 h-[1px] bg-white/10 overflow-hidden">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 2, ease: 'easeInOut', delay: 0.5 }}
                className="w-full h-full bg-white/60"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
