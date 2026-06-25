import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import type { Location } from 'react-router-dom';

export type TransitionDirection = 'forward' | 'backward' | 'none';

interface TransitionContextType {
  direction: TransitionDirection;
  locationStack: Location[];
  currentLocationIndex: number;
  isGestureBack: boolean;
  setIsGestureBack: (val: boolean) => void;
  saveScrollPosition: (key: string, scrollY: number) => void;
  getScrollPosition: (key: string) => number;
  popPage: () => void;
}

const TransitionContext = createContext<TransitionContextType | undefined>(undefined);

export function useTransition() {
  const context = useContext(TransitionContext);
  if (!context) {
    throw new Error('useTransition must be used within a TransitionProvider');
  }
  return context;
}

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigationType = useNavigationType();

  const [locationStack, setLocationStack] = useState<Location[]>([location]);
  const [currentLocationIndex, setCurrentLocationIndex] = useState<number>(0);
  const [direction, setDirection] = useState<TransitionDirection>('none');
  const [isGestureBack, setIsGestureBack] = useState<boolean>(false);

  const scrollPositionsRef = useRef<Record<string, number>>({});
  const lastLocationKeyRef = useRef<string>(location.key || 'initial');

  // Helper to save scroll position
  const saveScrollPosition = (key: string, scrollY: number) => {
    scrollPositionsRef.current[key] = scrollY;
  };

  // Helper to get scroll position
  const getScrollPosition = (key: string) => {
    return scrollPositionsRef.current[key] || 0;
  };

  // Explicitly pop a page (e.g. after exit animation completes)
  const popPage = () => {
    setLocationStack((prev) => {
      if (prev.length <= 1) return prev;
      return prev.slice(0, prev.length - 1);
    });
  };

  useEffect(() => {
    const currentKey = location.key || 'initial';
    const lastKey = lastLocationKeyRef.current;

    // Save scroll position for the page we are leaving
    saveScrollPosition(lastKey, window.scrollY);

    setLocationStack((prevStack) => {
      const existingIndex = prevStack.findIndex(
        (loc) => (loc.key || 'initial') === currentKey
      );

      if (navigationType === 'PUSH') {
        setDirection('forward');
        const nextIndex = currentLocationIndex + 1;
        const newStack = [...prevStack.slice(0, nextIndex), location];
        setCurrentLocationIndex(newStack.length - 1);
        return newStack;
      } else if (navigationType === 'REPLACE') {
        setDirection('none');
        const newStack = [...prevStack];
        newStack[currentLocationIndex] = location;
        return newStack;
      } else if (navigationType === 'POP') {
        if (existingIndex !== -1) {
          if (existingIndex < currentLocationIndex) {
            setDirection('backward');
          } else if (existingIndex > currentLocationIndex) {
            setDirection('forward');
          } else {
            setDirection('none');
          }
          setCurrentLocationIndex(existingIndex);
          return prevStack;
        } else {
          // If we popped to a location not in our stack, treat as new forward page
          setDirection('forward');
          const newStack = [...prevStack, location];
          setCurrentLocationIndex(newStack.length - 1);
          return newStack;
        }
      }

      return prevStack;
    });

    lastLocationKeyRef.current = currentKey;
  }, [location, navigationType]);

  // Restore scroll position after navigation/render
  useEffect(() => {
    const currentKey = location.key || 'initial';
    const savedScroll = getScrollPosition(currentKey);

    // Wait slightly for components to mount and render
    const timer = setTimeout(() => {
      window.scrollTo({
        top: savedScroll,
        left: 0,
        behavior: 'instant' as ScrollBehavior,
      });
    }, 50);

    return () => clearTimeout(timer);
  }, [location.pathname, location.key]);

  return (
    <TransitionContext.Provider
      value={{
        direction,
        locationStack,
        currentLocationIndex,
        isGestureBack,
        setIsGestureBack,
        saveScrollPosition,
        getScrollPosition,
        popPage,
      }}
    >
      {children}
    </TransitionContext.Provider>
  );
}
