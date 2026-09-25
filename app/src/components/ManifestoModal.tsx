'use client';

import React from 'react';
import { X, BookOpen, Zap, CheckCircle } from 'lucide-react';

interface ManifestoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ManifestoModal({ isOpen, onClose }: ManifestoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Manifesto FBR Agency Flux ⚡</h2>
              <p className="text-xs text-slate-400">Diretrizes da arquitetura Fast-Flow e Gestores Hermes</p>
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
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs text-slate-300 leading-relaxed">
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <h3 className="text-sm font-bold text-indigo-300 mb-1">Por que abandonamos os Handoffs Rígidos?</h3>
            <p className="text-slate-300">
              O modelo antigo gastava 90% da energia administrando contratos de handoff entre 11 personas fictícias que bloqueavam o trabalho a cada microetapa. No novo modelo, cada projeto tem seu <strong>Agente Gestor Hermes</strong> direto, operando com maestria através de <strong>Skills sob demanda</strong>.
            </p>
          </div>

          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Os 5 Princípios Fundamentais:</h3>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-950/50 border border-white/5 flex gap-3">
              <Zap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-100">1. Orientação a Arquivos Físicos (File-First):</strong>
                <p className="text-slate-400 mt-0.5">O progresso real é medido pela existência de artefatos (código, artigos, designs, SQL), e não por estados de banco de dados voláteis.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/50 border border-white/5 flex gap-3">
              <Zap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-100">2. Agente Gestor Hermes Dedicado por Projeto:</strong>
                <p className="text-slate-400 mt-0.5">Cada projeto possui um Gestor com System Prompt personalizado que conhece o nicho, o público, o tom de voz e as skills necessárias.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/50 border border-white/5 flex gap-3">
              <Zap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-100">3. Zero Deadlocks & Autonomia Padrão:</strong>
                <p className="text-slate-400 mt-0.5">O agente pesquisa, redige, codifica e testa sem travar em solicitações de permissão para passos triviais.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/50 border border-white/5 flex gap-3">
              <Zap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-100">4. Gates Apenas para Ações Irreversíveis (One-Way Doors):</strong>
                <p className="text-slate-400 mt-0.5">Aprovação do Sergio é exigida estritamente para gastos de orçamento, contratações e deploy final em produção.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/50 border border-white/5 flex gap-3">
              <Zap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-100">5. Simplicidade e Velocidade de Entrega:</strong>
                <p className="text-slate-400 mt-0.5">Menos abstração burocrática, mais software funcional e produtos no ar.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
}
