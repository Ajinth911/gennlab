import { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import { motion } from 'framer-motion';
import Logo3D from './Logo3D';

function FloatingCubeScene({ mousePos }) {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    
    const targetX = (mousePos.x - 0.5) * 0.5;
    const targetY = (mousePos.y - 0.5) * -0.5;
    
    groupRef.current.position.x += (targetX - groupRef.current.position.x) * 0.05;
    groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.05;
    
    groupRef.current.rotation.y = t * 0.2 + (mousePos.x - 0.5) * 1.5;
    groupRef.current.rotation.x = Math.sin(t * 0.5) * 0.1 + (mousePos.y - 0.5) * 0.5;
  });

  return (
    <>
      <ambientLight intensity={1.5} />
      <spotLight position={[10, 20, 10]} angle={0.2} penumbra={1} intensity={2.5} color="#ffffff" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#4caf6e" />
      <Environment preset="city" />
      
      <group ref={groupRef}>
        {/* Scale up the 3D logo slightly to match the prominent tablet in the image */}
        <Logo3D scale={1.2} />
      </group>
      
      <ContactShadows 
        position={[0, -2.2, 0]} 
        opacity={0.7} 
        scale={12} 
        blur={2} 
        far={4} 
        color="#000000"
      />
    </>
  );
}

export default function Hero() {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  const handleMouseMove = (e) => {
    setMousePos({
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight,
    });
  };

  return (
    <section 
      className="relative w-full h-screen overflow-hidden flex flex-col justify-between"
      onMouseMove={handleMouseMove}
    >
      {/* Exact Green-Black Gradient matching the reference image */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 60% 40%, #576344 0%, #3e4a2e 50%, #1a2212 100%)'
        }}
      />
      {/* Additional lighting overlay for depth */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#6a7a50]/20 blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[50vw] h-[50vw] rounded-full bg-[#11170b]/60 blur-[120px]" />
      </div>

      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <Suspense fallback={null}>
          <Canvas camera={{ position: [0, 0, 6], fov: 35 }}>
            <FloatingCubeScene mousePos={mousePos} />
          </Canvas>
        </Suspense>
      </div>

      {/* Content Overlay */}
      <div className="relative z-20 w-full h-full px-8 md:px-16 pt-32 pb-16 flex flex-col justify-between pointer-events-none">
        
        {/* Top Section */}
        <div className="w-full flex flex-col">
          {/* Huge Title & Right content container */}
          <div className="flex flex-col md:flex-row md:items-end justify-between w-full">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 1.5 }}
              className="text-[14vw] md:text-[10vw] font-medium leading-[0.9] tracking-tighter text-[#f2f4ee]"
            >
              GenLab<span className="text-[3vw] align-top relative -top-4 md:-top-8">™</span>
            </motion.h1>
            
            {/* CTA Button on the right, aligned with bottom of GenLab text */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2, delay: 1.7 }}
              className="mt-6 md:mt-0 pointer-events-auto"
            >
              
            </motion.div>
          </div>

          <div className="w-full h-[1px] bg-white/10 my-6" />

          {/* Subtitles below the line */}
          <div className="flex flex-col md:flex-row justify-between w-full">
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 1.6 }}
              className="text-[11px] tracking-[0.1em] font-light text-[#f2f4ee]/80"
            >
              INTELLIGENCE, REINVENTED.
            </motion.p>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 1.8 }}
              className="mt-4 md:mt-0 text-[11px] tracking-[0.05em] font-light text-[#f2f4ee]/80 md:text-right max-w-[200px] leading-relaxed"
            >
              100 TB OF COMPUTE —<br/>REIMAGINED AS A 13 G CORE.
            </motion.p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="w-full flex items-end">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 1.9 }}
            className="flex flex-col gap-2"
          >
            <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-[#f2f4ee]">
              For Your Data.<br/>
              For the Future.
            </h2>
            <p className="mt-4 text-[10px] md:text-[11px] tracking-[0.05em] font-light text-[#f2f4ee]/70 leading-relaxed uppercase max-w-[300px]">
              DEEP-TECH NEURAL ARCHITECTURE<br/>
              THAT DELIVERS INTELLIGENCE WITH<br/>
              ZERO LATENCY AND ZERO COMPROMISE.
            </p>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
