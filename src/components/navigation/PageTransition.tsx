import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useTransition } from './TransitionContext';

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const navigate = useNavigate();
  const {
    direction,
    locationStack,
    currentLocationIndex,
    isGestureBack,
    setIsGestureBack,
  } = useTransition();

  const shouldReduceMotion = useReducedMotion();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isSwipeGesture = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Snappy iOS-like easing curve
  const transitionConfig = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.35, ease: [0.32, 0.94, 0.6, 1] };

  // Track transition state
  useEffect(() => {
    if (direction !== 'none') {
      setIsTransitioning(true);
    }
  }, [direction, currentLocationIndex]);

  // Handle Touch Events for Mobile Edge Swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    // Only allow swipe if we are not at the root page and not currently transitioning
    if (currentLocationIndex <= 0 || isTransitioning || isSwiping) return;

    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    isSwipeGesture.current = false;

    // Detect if swipe starts from the left edge of the screen (within 35px)
    if (touch.clientX < 35) {
      isSwipeGesture.current = true;
      setIsGestureBack(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwipeGesture.current) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;

    // Verify it is primarily a horizontal gesture
    if (!isSwiping && Math.abs(deltaX) > 10 && Math.abs(deltaX) > Math.abs(deltaY)) {
      setIsSwiping(true);
      document.body.style.overflow = 'hidden'; // Lock body scroll during swipe
    }

    if (isSwiping && deltaX >= 0) {
      setSwipeOffset(deltaX);
    }
  };

  const handleTouchEnd = () => {
    if (!isSwipeGesture.current) return;

    const containerWidth = containerRef.current?.offsetWidth || window.innerWidth;
    const threshold = containerWidth * 0.25; // 25% of width threshold to trigger back navigation

    if (isSwiping) {
      setIsSwiping(false);
      document.body.style.overflow = '';

      if (swipeOffset >= threshold) {
        // Complete the swipe-back transition
        setIsTransitioning(true);
        // Animate the remaining distance programmatically via Navigate
        navigate(-1);
      } else {
        // Snap back to original state
        setSwipeOffset(0);
        setIsGestureBack(false);
      }
    } else {
      setIsGestureBack(false);
    }
  };

  // Reset swipe offset when transition completes
  const handleAnimationComplete = () => {
    setIsTransitioning(false);
    setSwipeOffset(0);
    setIsGestureBack(false);
  };

  const activeLoc = locationStack[currentLocationIndex];

  return (
    <div
      ref={containerRef}
      className={`w-full ${isTransitioning || isSwiping ? 'h-screen overflow-hidden relative' : 'min-h-screen relative'}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {locationStack.map((loc, index) => {
        const isCurrent = index === currentLocationIndex;
        const isPrevious = index === currentLocationIndex - 1;
        const isUnderneath = index === currentLocationIndex - 1;
        
        const isExitingBackward = direction === 'backward' && index === currentLocationIndex + 1;
        const isUnderneathForward = direction === 'forward' && index === currentLocationIndex - 1;
        const isUnderneathSwipe = isSwiping && index === currentLocationIndex - 1;

        const shouldRender = isCurrent || 
                             (isTransitioning && (isExitingBackward || isUnderneathForward)) || 
                             isUnderneathSwipe;
        
        if (!shouldRender) return null;

        const key = loc.key || 'initial';
        const isTop = isCurrent && !isGestureBack;

        // Custom Framer Motion style and variants based on swipe and direction
        let xValue: any = 0;
        let scaleValue: any = 1;
        let opacityValue: any = 1;

        if (isSwiping) {
          const containerWidth = containerRef.current?.offsetWidth || window.innerWidth;
          const progress = Math.min(swipeOffset / containerWidth, 1);

          if (isCurrent) {
            // Swiping the top page off to the right
            xValue = swipeOffset;
          } else if (isPrevious) {
            // Revealing the previous page underneath
            xValue = -containerWidth * 0.15 * (1 - progress);
            scaleValue = 0.96 + 0.04 * progress;
            opacityValue = 0.9 + 0.1 * progress;
          }
        }

        return (
          <motion.div
            key={key}
            style={{
              position: isTransitioning || isSwiping ? 'absolute' : 'relative',
              top: 0,
              left: 0,
              width: '100%',
              height: isTransitioning || isSwiping ? '100%' : 'auto',
              zIndex: index,
              backgroundColor: 'var(--background)',
              boxShadow: isTop && isTransitioning ? '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' : 'none',
              transformTemplate: isTransitioning || isSwiping
                ? ({ x, scale }: { x: any; scale: any }) => `translate3d(${x}, 0, 0) scale(${scale})`
                : undefined,
              willChange: isTransitioning || isSwiping ? 'transform, opacity' : 'auto',
            }}
            initial={
              shouldReduceMotion
                ? { opacity: 0 }
                : direction === 'forward' && isCurrent
                ? { x: '100%', scale: 1, opacity: 1 }
                : direction === 'backward' && isUnderneath
                ? { x: '-15%', scale: 0.96, opacity: 0.9 }
                : {}
            }
            animate={
              isSwiping
                ? { x: xValue, scale: scaleValue, opacity: opacityValue }
                : shouldReduceMotion
                ? { opacity: 1 }
                : isCurrent
                ? { x: 0, scale: 1, opacity: 1 }
                : isUnderneath
                ? { x: '-15%', scale: 0.96, opacity: 0.9 }
                : { x: '100%', scale: 1, opacity: 1 }
            }
            transition={transitionConfig}
            onAnimationComplete={isCurrent ? handleAnimationComplete : undefined}
          >
            {/* 
              Inject standard React children but override the routing context 
              for this specific stack level by supplying the stack's Location object 
            */}
            {React.cloneElement(children as React.ReactElement, {
              location: loc,
            })}
          </motion.div>
        );
      })}
    </div>
  );
}
