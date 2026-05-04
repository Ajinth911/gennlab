import { useState, useCallback, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Splash from './components/Splash';
import Header from './components/Header';
import Hero   from './components/Hero';

export default function App() {
  const [splashDone, setSplashDone] = useState(false);
  const handleSplashDone = useCallback(() => setSplashDone(true), []);

  return (
    <div className="bg-[#020503] min-h-screen text-white font-sans selection:bg-white/20">
      <AnimatePresence mode="wait">
        {!splashDone && <Splash key="splash" onDone={handleSplashDone} />}
      </AnimatePresence>

      {splashDone && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        >
          <Suspense fallback={null}>
            <Header />
            <main>
              <Hero />
            </main>
          </Suspense>
        </motion.div>
      )}
    </div>
  );
}
