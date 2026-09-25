'use client';

import React from 'react';
import { Bot, Folder, FileText, CheckCircle2, ChevronRight, Sparkles, ShieldCheck } from 'lucide-react';
import { ProjectSummary } from '@/lib/projects';

interface ProjectCardProps {
  project: ProjectSummary;
  onSelect: (slug: string) => void;
  onViewPrompt: (slug: string) => void;
  onEdit?: (slug: string) => void;
}

export function ProjectCard({ project, onSelect, onViewPrompt, onEdit }: ProjectCardProps) {
  const percentComplete = project.totalTasks > 0
    ? Math.round((project.completedTasks / project.totalTasks) * 100)
    : 0;

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col justify-between group relative overflow-hidden">
      {/* Glow highlight */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />

      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              /{project.slug}
            </span>
            <h3 className="text-lg font-bold text-white mt-1.5 group-hover:text-emerald-300 transition-colors">
              {project.name}
            </h3>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800/80 border border-white/10 text-slate-300 font-medium">
            {project.niche}
          </span>
        </div>

        {/* Gestor Hermes Badge */}
        <div className="mb-4 p-2.5 rounded-xl bg-slate-900/80 border border-indigo-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Bot className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Agente Gestor Hermes</p>
              <p className="text-xs font-semibold text-slate-200">{project.gestorName}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const url = `${window.location.origin}/p/${project.slug}`;
                navigator.clipboard.writeText(url);
                alert(`URL copiada para o Hermes:\n${url}`);
              }}
              title="Copiar URL Web para passar ao Hermes"
              className="text-[11px] text-emerald-300 hover:text-emerald-100 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-2 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>🔗 URL</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewPrompt(project.slug);
              }}
              className="text-[11px] text-indigo-300 hover:text-indigo-100 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 px-2 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>Prompt</span>
            </button>
          </div>
        </div>

        {/* Progress & Artifacts */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Entregáveis Concluídos</span>
            </span>
            <span className="font-semibold text-slate-200">
              {project.completedTasks}/{project.totalTasks} ({percentComplete}%)
            </span>
          </div>

          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(percentComplete, 5)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(project.slug);
              }}
              className="text-xs text-slate-400 hover:text-indigo-300 px-2 py-1 rounded hover:bg-slate-800/80 transition-colors cursor-pointer"
            >
              Editar
            </button>
          )}
        </div>

        <button
          onClick={() => onSelect(project.slug)}
          className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer group-hover:translate-x-0.5"
        >
          <span>Abrir Projeto</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
