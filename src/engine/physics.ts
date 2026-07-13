// 1. types/engine.ts
export type AuthProvider = 'google' | 'github' | 'microsoft' | 'email' | 'phone' | 'guest';

export interface UserPreferences {
  theme: 'dark' | 'light' | 'system';
  fontSize: number;
  autoSaveInterval: number;
}

export interface ProjectVersion {
  id: string;
  name: string;
  updatedAt: string;
  isPinned: boolean;
  isArchived: boolean;
}

// 2. constants/physics.ts
import { Variants } from "framer-motion";

// Apple-tier spring: High stiffness, critical damping. Zero bounce, immediate response.
export const engineSpring = {
  type: "spring",
  stiffness: 400,
  damping: 32,
  mass: 0.8,
};

export const layoutTransitions = {
  modal: {
    initial: { opacity: 0, scale: 0.98, y: 8, filter: "blur(8px)" },
    animate: { opacity: 1, scale: 1, y: 0, filter: "blur(0px)", transition: engineSpring },
    exit: { opacity: 0, scale: 0.98, y: 4, filter: "blur(4px)", transition: { duration: 0.15, ease: "easeOut" } }
  },
  drawer: {
    initial: { x: '100%', filter: 'blur(8px)' },
    animate: { x: 0, filter: 'blur(0px)', transition: engineSpring },
    exit: { x: '100%', filter: 'blur(8px)', transition: { type: 'spring', stiffness: 300, damping: 32 } }
  }
};

export const microInteractions = {
  tap: { scale: 0.985, transition: { duration: 0.1 } },
  hover: { scale: 1.01, transition: { duration: 0.2 } }
};

// 3. styles/globals.css
/*
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }
  
  :root {
    --bg-primary: #09090B;
    --border-subtle: rgba(255, 255, 255, 0.06);
    --border-hover: rgba(255, 255, 255, 0.12);
    --shadow-premium: 0 4px 24px -4px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.04);
  }
}

@layer utilities {
  .focus-ring-premium {
    @apply outline-none focus-visible:ring-[3px] focus-visible:ring-purple-500/20 focus-visible:border-purple-500/50 transition-all;
  }
  .glass-panel {
    @apply bg-[#09090B]/70 backdrop-blur-2xl border border-white/[0.06] shadow-[var(--shadow-premium)];
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
}
*/
