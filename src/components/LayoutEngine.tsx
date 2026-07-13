import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import { Command, LayoutGrid, FileText, Sun, Bell, Settings, ChevronDown, Search, Plus, Folder, ArrowUpRight, X, Github, Mail, Smartphone } from 'lucide-react';
import { engineSpring, layoutTransitions, microInteractions } from './physics'; // Adjust path
import { ProjectVersion } from './engine'; // Adjust path

// --- 1. TOP NAVIGATION ---
export function TopNavigation({ onOpenProjects, onOpenAuth }: { onOpenProjects: () => void, onOpenAuth: () => void }) {
  return (
    <header className="w-full h-14 px-5 flex items-center justify-between border-b border-white/[0.06] bg-[#09090B]/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="flex items-center gap-2 cursor-pointer group">
        <div className="h-5 w-5 rounded-md bg-gradient-to-tr from-zinc-100 to-zinc-300 flex items-center justify-center shadow-sm">
          <Command className="w-3 h-3 text-zinc-900" />
        </div>
        <span className="text-[13px] font-semibold tracking-tight text-zinc-100">VibeCoder</span>
      </div>

      <nav className="hidden md:flex items-center gap-1 bg-white/[0.02] p-1 rounded-lg border border-white/[0.04]">
        <NavButton icon={LayoutGrid} label="Projects" onClick={onOpenProjects} isActive />
        <NavButton label="Templates" />
        <NavButton icon={FileText} label="Documentation" />
      </nav>

      <div className="flex items-center gap-1.5">
        <IconButton icon={Sun} onClick={() => {}} />
        <IconButton icon={Bell} badge onClick={() => {}} />
        <div className="w-[1px] h-4 bg-white/[0.08] mx-1" />
        <button onClick={onOpenAuth} className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-full border border-transparent hover:bg-white/[0.04] transition-all focus-ring-premium group">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shadow-inner">D</div>
          <span className="text-xs font-medium text-zinc-300 group-hover:text-zinc-100">Dev</span>
          <ChevronDown className="w-3 h-3 text-zinc-500" />
        </button>
      </div>
    </header>
  );
}

const NavButton = ({ icon: Icon, label, isActive, onClick }: any) => (
  <button onClick={onClick} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-all focus-ring-premium ${isActive ? 'bg-white/[0.06] text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'}`}>
    {Icon && <Icon className="w-3.5 h-3.5 opacity-70" />}
    <span>{label}</span>
  </button>
);

const IconButton = ({ icon: Icon, badge, onClick }: any) => (
  <button onClick={onClick} className="relative p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06] transition-all focus-ring-premium">
    <Icon className="w-4 h-4" />
    {badge && <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-purple-500 ring-2 ring-[#09090B]" />}
  </button>
);

// --- 2. PROJECT DRAWER ---
export function ProjectDrawer({ isOpen, onClose, projects }: { isOpen: boolean, onClose: () => void, projects: ProjectVersion[] }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#09090B]/40 backdrop-blur-sm z-50" />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div variants={layoutTransitions.drawer} initial="initial" animate="animate" exit="exit" className="fixed inset-y-0 right-0 w-full sm:w-[420px] glass-panel z-50 flex flex-col outline-none">
                <div className="px-5 py-4 flex items-center justify-between border-b border-white/[0.06]">
                  <Dialog.Title className="text-[13px] font-semibold text-zinc-100">Workspaces</Dialog.Title>
                  <Dialog.Close asChild>
                    <button className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-100 hover:bg-white/[0.06] transition-all focus-ring-premium"><X className="w-4 h-4" /></button>
                  </Dialog.Close>
                </div>
                
                <div className="p-4 border-b border-white/[0.04]">
                  <div className="relative group">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
                    <input type="text" placeholder="Find repository..." className="w-full h-9 pl-9 pr-4 text-[13px] bg-white/[0.02] border border-white/[0.06] rounded-lg text-zinc-100 placeholder-zinc-500 focus-ring-premium transition-all" />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-hide">
                  {projects.map(p => (
                    <motion.div whileHover="hover" whileTap="tap" variants={microInteractions} key={p.id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.04] border border-transparent hover:border-white/[0.06] cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-center text-zinc-400 group-hover:text-zinc-100 transition-colors">
                          <Folder className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-medium text-zinc-200 group-hover:text-white">{p.name}</span>
                          <span className="text-[11px] text-zinc-500 mt-0.5">{p.updatedAt}</span>
                        </div>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-400 hover:text-white transition-all"><ArrowUpRight className="w-4 h-4" /></button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </AnimatePresence>
  );
}

// --- 3. PREMIUM AUTH MODAL ---
export function AuthModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#09090B]/60 backdrop-blur-md z-50" />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
                <motion.div variants={layoutTransitions.modal} initial="initial" animate="animate" exit="exit" className="w-full max-w-[360px] glass-panel rounded-2xl p-6 relative overflow-hidden outline-none">
                  {/* Subtle static radial glow, no cheap CSS animations */}
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-[64px] pointer-events-none" />
                  
                  <div className="relative z-10 flex flex-col">
                    <div className="h-10 w-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-5 shadow-sm">
                      <Command className="w-5 h-5 text-zinc-100" />
                    </div>
                    
                    <Dialog.Title className="text-lg font-semibold text-white tracking-tight mb-1.5">Welcome back</Dialog.Title>
                    <p className="text-[13px] text-zinc-400 mb-6 leading-relaxed">Authenticate to synchronize your engine environment.</p>

                    <div className="space-y-2.5">
                      <AuthButton icon={Github} label="Continue with GitHub" />
                      <AuthButton icon={() => <span className="font-bold text-zinc-400">G</span>} label="Continue with Google" />
                      
                      <div className="flex items-center gap-3 my-4">
                        <div className="h-[1px] flex-1 bg-white/[0.06]" />
                        <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-widest">Or</span>
                        <div className="h-[1px] flex-1 bg-white/[0.06]" />
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <button className="flex items-center justify-center gap-2 h-9 rounded-lg border border-white/[0.06] hover:bg-white/[0.04] text-[13px] font-medium text-zinc-300 transition-colors focus-ring-premium">
                          <Mail className="w-3.5 h-3.5" /> Email
                        </button>
                        <button className="flex items-center justify-center gap-2 h-9 rounded-lg border border-white/[0.06] hover:bg-white/[0.04] text-[13px] font-medium text-zinc-300 transition-colors focus-ring-premium">
                          <Smartphone className="w-3.5 h-3.5" /> Phone
                        </button>
                      </div>
                    </div>
                  </div>
                  <Dialog.Close asChild>
                    <button className="absolute top-4 right-4 p-1.5 rounded-md text-zinc-500 hover:text-zinc-100 hover:bg-white/[0.06] transition-colors focus-ring-premium"><X className="w-4 h-4" /></button>
                  </Dialog.Close>
                </motion.div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </AnimatePresence>
  );
}

const AuthButton = ({ icon: Icon, label }: any) => (
  <button className="w-full flex items-center justify-center gap-2.5 h-10 rounded-lg border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] transition-colors focus-ring-premium group">
    <Icon className="w-4 h-4 text-zinc-400 group-hover:text-zinc-100 transition-colors" />
    <span className="text-[13px] font-medium text-zinc-300 group-hover:text-white">{label}</span>
  </button>
);
