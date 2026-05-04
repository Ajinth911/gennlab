import { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Stars } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import ParticleSystem from './ParticleSystem';
import Logo3D from './Logo3D';
import './SplashScreen.css';

function SplashScene({ onFormationComplete, showLogo }) {
  return (
    <>
      {/* Ambient star field background */}
      <Stars radius={20} depth={8} count={600} factor={1.2} fade speed={0.4} />

      {/* Lights */}
      <ambientLight intensity={0.12} />
      <directionalLight position={[3, 5, 4]}  intensity={2.2} />
      <directionalLight position={[-4, 2, 2]} intensity={0.9} color="#4caf6e" />
      <pointLight       position={[0, 1, 3]}  intensity={1.8} color="#5bd47b" distance={10} />
      <Environment preset="forest" background={false} />

      {/* Particle animation */}
      <ParticleSystem onFormationComplete={onFormationComplete} />

      {/* Solid logo fades in after formation */}
      {showLogo && (
        <Logo3D scale={1} floatAmplitude={0.1} rotateSpeed={0.005} />
      )}
    </>
  );
}

export default function SplashScreen({ onComplete }) {
  const [showLogo, setShowLogo] = useState(false);
  const [exiting,  setExiting]  = useState(false);

  const handleFormationComplete = useCallback(() => {
    setShowLogo(true);
    setTimeout(() => {
      setExiting(true);
      setTimeout(onComplete, 900);
    }, 900);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!exiting ? (
        <motion.div
          className="splash-overlay"
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
        >
          <Canvas
            className="splash-canvas"
            camera={{ position: [0, 0, 5], fov: 60 }}
            gl={{ antialias: true, alpha: false }}
            style={{ background: 'linear-gradient(135deg,#050d07 0%,#0a1a0e 60%,#0d2015 100%)' }}
          >
            <SplashScene
              onFormationComplete={handleFormationComplete}
              showLogo={showLogo}
            />
          </Canvas>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
