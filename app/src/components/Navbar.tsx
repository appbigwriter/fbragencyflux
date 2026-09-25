'use client';

import React from 'react';
import { Zap, BookOpen, Layers, Plus, Sparkles } from 'lucide-react';

interface NavbarProps {
  onOpenCreate: () => void;
  onOpenSkills: () => void;
  onOpenManifesto: () => void;
  onOpenIntegrations: () => void;
  totalProjects: number;
}

export function Navbar({ onOpenCreate, onOpenSkills, onOpenManifesto, onOpenIntegrations, totalProjects }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-indigo-600 p-[1px] flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                FBR Agency Flux
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Fast-Flow v2.0
              </span>
            </div>
            <p className="text-xs text-slate-400">Hub & Governança de Projetos com Gestores Hermes</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenIntegrations}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 hover:border-white/15 rounded-lg transition-all cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Integrações</span>
          </button>

          <button
            onClick={onOpenManifesto}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 hover:border-white/15 rounded-lg transition-all cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Manifesto</span>
          </button>

          <button
            onClick={onOpenSkills}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 hover:border-white/15 rounded-lg transition-all cursor-pointer"
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Skills Hub</span>
          </button>

          <button
            onClick={onOpenCreate}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-emerald-400 to-emerald-300 hover:from-emerald-300 hover:to-emerald-200 rounded-lg shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            <span>Novo Projeto + Gestor</span>
          </button>
        </div>

      </div>
    </header>
  );
}
