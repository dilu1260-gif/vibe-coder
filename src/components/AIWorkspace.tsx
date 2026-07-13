import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Send, Sparkles, Terminal, Check, Copy, ChevronDown } from 'lucide-react';
import { engineSpring } from './physics'; // Adjust path

// --- 1. PREMIUM COMMAND NODE ---
export function AICommandNode({ onSubmit, isGenerating }: { onSubmit: (p: string) => void, isGenerating: boolean }) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // High-performance auto-grow
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '56px'; // Reset base
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 240)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (input.trim() && !isGenerating) {
        onSubmit(input);
        setInput('');
      }
    }
  };

  return (
    <section aria-label="AI Workspace" className="w-full max-w-3xl mx-auto flex flex-col gap-3">
      <div className="flex items-center gap-2 px-1">
        <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
        {["Initialize repository", "Refactor module"].map((s, i) => (
          <button key={i} onClick={() => setInput(s)} className="px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.05] text-[11px] font-medium text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.08] transition-all focus-ring-premium">
            {s}
          </button>
        ))}
      </div>

      <div className="relative group glass-panel rounded-2xl focus-within:ring-2 focus-within:ring-white/[0.1] focus-within:border-white/[0.15] transition-all duration-300" style={{ willChange: 'transform' }}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isGenerating}
          placeholder="Instruct the engine..."
          className="w-full bg-transparent text-[14px] text-zinc-100 placeholder-zinc-600 resize-none py-4 pl-4 pr-24 focus:outline-none min-h-[56px] leading-relaxed scrollbar-hide rounded-2xl disabled:opacity-50"
          rows={1}
        />
        
        <div className="absolute right-2 bottom-2 flex items-center gap-1.5">
          <button type="button" className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors focus-ring-premium">
            <Mic className="w-4 h-4" />
          </button>
          <button 
            type="button" 
            onClick={() => { if(input.trim()) { onSubmit(input); setInput(''); } }}
            disabled={!input.trim() || isGenerating}
            className="p-1.5 rounded-lg text-zinc-900 bg-white hover:bg-zinc-200 disabled:opacity-20 disabled:bg-white/[0.05] disabled:text-white transition-all focus-ring-premium"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="text-center opacity-70">
        <span className="text-[10px] font-medium text-zinc-500 tracking-wide">Press <kbd className="font-mono bg-white/[0.06] px-1 py-0.5 rounded border border-white/[0.04]">⌘</kbd> <kbd className="font-mono bg-white/[0.06] px-1 py-0.5 rounded border border-white/[0.04]">Enter</kbd> to execute</span>
      </div>
    </section>
  );
}

// --- 2. OUTPUT ENGINE ---
export function PremiumCodeBlock({ language = "typescript", code }: { language?: string, code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full rounded-xl overflow-hidden border border-white/[0.08] bg-[#050505] my-5 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.02] border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-medium">{language}</span>
        </div>
        <button onClick={handleCopy} className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500 hover:text-zinc-200 transition-colors focus-ring-premium rounded px-1">
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="p-4 overflow-x-auto scrollbar-hide">
        <pre className="text-[13px] font-mono text-zinc-300 leading-relaxed tracking-tight">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

export function CollapsibleThinking({ title, children }: { title: string, children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full border border-white/[0.06] bg-white/[0.01] rounded-xl overflow-hidden my-4 transition-colors hover:border-white/[0.1]">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between px-4 py-3 focus-ring-premium">
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
          <span className="text-[13px] font-medium text-zinc-300">{title}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ease-[cubic-bezier(0.87,0,0.13,1)] ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 text-[13px] text-zinc-400 leading-relaxed border-t border-white/[0.04] mt-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
