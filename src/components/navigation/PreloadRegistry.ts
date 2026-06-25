// Vite dynamic import glob patterns
const toolModules = import.meta.glob('../../pages/tools/*.tsx');
const rootModules = import.meta.glob('../../pages/*.tsx');

// Explicit overrides for pages with unique naming patterns
const exactOverrides: Record<string, string> = {
  '/': '../../pages/Home.tsx',
  '/tools': '../../pages/AllToolsPage.tsx',
  '/favorites': '../../pages/FavoritesPage.tsx',
  '/search': '../../pages/SearchPage.tsx',
  '/privacy': '../../pages/PrivacyPage.tsx',
  '/terms': '../../pages/TermsPage.tsx',
  '/games/15-puzzle': '../../pages/tools/SlidingPuzzle.tsx',
  '/games/2048': '../../pages/tools/Game2048.tsx',
  '/games/memory': '../../pages/tools/MemoryCardFlip.tsx',
  '/games/typing-test': '../../pages/tools/TypingSpeedTest.tsx',
  '/games/math-challenge': '../../pages/tools/MathSpeedChallenge.tsx',
  '/games/simon-says': '../../pages/tools/ColorMemoryGame.tsx',
  '/games/flappy-bird': '../../pages/tools/FlappyBirdClone.tsx',
  '/tools/remove-background': '../../pages/tools/RemoveBg.tsx',
  '/tools/enhancer-remove-bg': '../../pages/tools/RemoveBgPro.tsx',
  '/tools/water-intake': '../../pages/tools/WaterIntakeCalculator.tsx',
};

// Helper to convert kebab-case (e.g. "json-formatter") to PascalCase ("JsonFormatter")
function kebabToPascal(str: string): string {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

// Suffixes commonly used on tool files
const COMMON_SUFFIXES = [
  '',
  'Game',
  'Calculator',
  'Checker',
  'Generator',
  'Template',
  'Timer',
  'Converter',
  'Editor',
  'Planner',
  'Tracker',
  'Maker',
  'Lobby',
  'Sheet',
  'Clone',
  'Tester',
  'Outline',
  'Table',
  'Challenge',
  'Mixer',
  'Exercise',
];

// Helper to find the Vite module loader function for a given path
function findLoader(pathname: string): (() => Promise<any>) | null {
  // 1. Check exact overrides
  const overrideKey = exactOverrides[pathname];
  if (overrideKey && toolModules[overrideKey]) {
    return toolModules[overrideKey] as () => Promise<any>;
  }
  if (overrideKey && rootModules[overrideKey]) {
    return rootModules[overrideKey] as () => Promise<any>;
  }

  // 2. Handle sub-category routes or category homepages (e.g. "/developer" -> CategoryPage)
  // Categories are mapped in App.tsx as Route "/:category" -> CategoryPage.tsx
  // Check if it's a direct category page (has single level like "/developer", "/text")
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 1) {
    const loader = rootModules['../../pages/CategoryPage.tsx'];
    if (loader) return loader as () => Promise<any>;
  }

  if (parts.length < 2) {
    return null;
  }

  const baseName = parts[1];
  const pascalName = kebabToPascal(baseName);

  // 3. Scan the tools folder with suffixes
  for (const suffix of COMMON_SUFFIXES) {
    const candidateName = `${pascalName}${suffix}`;
    const candidatePath = `../../pages/tools/${candidateName}.tsx`;
    
    if (toolModules[candidatePath]) {
      return toolModules[candidatePath] as () => Promise<any>;
    }
  }

  return null;
}

// Preload cache to prevent repeated prefetching
const preloadedPaths = new Set<string>();

/**
 * Preload the bundle for a given route pathname.
 * E.g. preloadRoute('/tools/json-formatter')
 */
export function preloadRoute(pathname: string) {
  if (preloadedPaths.has(pathname)) {
    return;
  }

  const loader = findLoader(pathname);
  if (loader) {
    preloadedPaths.add(pathname);
    loader()
      .then(() => {
        // console.log(`[Preload] Successfully loaded route: ${pathname}`);
      })
      .catch((err) => {
        console.warn(`[Preload] Failed to prefetch route: ${pathname}`, err);
        preloadedPaths.delete(pathname); // Retry on next hover if failed
      });
  }
}

/**
 * Setup global event listeners to preload links on hover/touch.
 */
export function setupGlobalPreloader() {
  const handleHover = (e: MouseEvent | TouchEvent) => {
    const anchor = (e.target as HTMLElement).closest('a');
    if (!anchor) return;

    try {
      const url = new URL(anchor.href);
      // Only preload relative/internal links
      if (url.origin === window.location.origin) {
        preloadRoute(url.pathname);
      }
    } catch {
      // Ignore invalid URLs
    }
  };

  document.addEventListener('mouseover', handleHover, { passive: true });
  document.addEventListener('touchstart', handleHover, { passive: true });

  return () => {
    document.removeEventListener('mouseover', handleHover);
    document.removeEventListener('touchstart', handleHover);
  };
}
