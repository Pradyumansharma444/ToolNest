import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();

  // Instant scroll to top when page changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as ScrollBehavior
    });
  }, [location.pathname]);

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', overflowX: 'hidden' }}>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
          style={{ width: '100%' }}
        >
          {React.cloneElement(children as React.ReactElement<any>, {
            location: location,
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
