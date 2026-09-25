'use client';

import React, { useState } from 'react';
import { X, Layers, BookOpen, ChevronRight, Check } from 'lucide-react';
import { SkillItem } from '@/lib/projects';

interface SkillsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  skills: SkillItem[];
}

export function SkillsDrawer({ isOpen, onClose, skills }: SkillsDrawerProps) {
  const [selectedSkill, setSelectedSkill] = useState<SkillItem | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Layers className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Hub de Skills da FBR Agency</h2>
              <p className="text-xs text-slate-400">Diretrizes modulares acionadas sob demanda pelos Gestores Hermes</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Skills List */}
          <div className="md:col-span-1 space-y-2 border-r border-white/5 pr-4">
            {skills.map(skill => {
              const isSelected = selectedSkill?.id === skill.id;
              return (
                <button
                  key={skill.id}
                  onClick={() => setSelectedSkill(skill)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-slate-950/40 border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/15'
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold">{skill.name}</p>
                    <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{skill.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 shrink-0 opacity-50" />
                </button>
              );
            })}
          </div>

          {/* Skill Detail */}
          <div className="md:col-span-2">
            {selectedSkill ? (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-400 font-mono">
                    02-skills/{selectedSkill.id}/SKILL.md
                  </span>
                  <h3 className="text-base font-bold text-white mt-1">{selectedSkill.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedSkill.description}</p>
                </div>

                <div className="relative">
                  <pre className="p-4 rounded-xl bg-slate-950 border border-white/10 text-xs text-slate-300 font-mono overflow-x-auto max-h-[50vh] whitespace-pre-wrap leading-relaxed">
                    {selectedSkill.content}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs py-20">
                <BookOpen className="w-8 h-8 mb-2 opacity-30" />
                <span>Selecione uma skill ao lado para visualizar suas instruções.</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
