'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, Bot, Layers, Check, Copy, ArrowRight, Edit3, Save } from 'lucide-react';
import { ProjectCreationData } from '@/lib/generator';

interface EditProjectModalProps {
  isOpen: boolean;
  slug: string | null;
  initialData?: any;
  onClose: () => void;
  onSuccess: () => void;
  availableSkills: { id: string; name: string; description: string }[];
}

export function EditProjectModal({
  isOpen,
  slug,
  initialData,
  onClose,
  onSuccess,
  availableSkills
}: EditProjectModalProps) {
  const [formData, setFormData] = useState<ProjectCreationData>({
    name: '',
    slug: slug || '',
    niche: '',
    targetAudience: '',
    language: 'EN-US (Global)',
    domain: '',
    monetization: ['Amazon Associates', 'Afiliados Especializados', 'FBR Ads'],
    gestorName: '',
    personaTone: 'Editorial sofisticado, transparente, baseado em evidências científicas e sem falsas promessas.',
    selectedSkills: ['pesquisa-mercado', 'copy-posicionamento', 'design-identidade', 'engenharia-fullstack', 'trafego-growth', 'qa-auditoria']
  });

  const [loading, setLoading] = useState(false);
  const [updatedPrompt, setUpdatedPrompt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialData?.metadata) {
      setFormData({
        ...initialData.metadata,
        slug: slug || initialData.metadata.slug
      });
      setUpdatedPrompt(null);
    }
  }, [initialData, slug]);

  if (!isOpen || !slug) return null;

  const toggleSkill = (skillId: string) => {
    setFormData(prev => {
      const exists = prev.selectedSkills.includes(skillId);
      return {
        ...prev,
        selectedSkills: exists
          ? prev.selectedSkills.filter(s => s !== skillId)
          : [...prev.selectedSkills, skillId]
      };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updateMetadata: true,
          data: formData
        })
      });
      const data = await res.json();
      if (data.success) {
        setUpdatedPrompt(data.result.prompt);
        onSuccess();
      } else {
        alert('Erro ao atualizar projeto: ' + data.error);
      }
    } catch (err) {
      alert('Falha na requisição');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (updatedPrompt) {
      navigator.clipboard.writeText(updatedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Edit3 className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Editar Projeto</h2>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  /{slug}
                </span>
              </div>
              <p className="text-xs text-slate-400">Atualize os parâmetros e regenere automaticamente o Prompt do Gestor Hermes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {!updatedPrompt ? (
            <form id="edit-project-form" onSubmit={handleSave} className="space-y-5">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Nome do Projeto *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950/70 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Domínio Previsto
                  </label>
                  <input
                    type="text"
                    placeholder="exemplo.fbr.news"
                    value={formData.domain}
                    onChange={e => setFormData({ ...formData, domain: e.target.value })}
                    className="w-full bg-slate-950/70 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Niche & Audience */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Nicho & Mercado Principal
                  </label>
                  <input
                    type="text"
                    value={formData.niche}
                    onChange={e => setFormData({ ...formData, niche: e.target.value })}
                    className="w-full bg-slate-950/70 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Público-Alvo & Idioma
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={formData.targetAudience}
                      onChange={e => setFormData({ ...formData, targetAudience: e.target.value })}
                      className="w-full bg-slate-950/70 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                    <input
                      type="text"
                      value={formData.language}
                      onChange={e => setFormData({ ...formData, language: e.target.value })}
                      className="w-full bg-slate-950/70 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Global Briefing Text Area */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Briefing / Visão Global do Projeto</span>
                  <span className="text-[11px] text-slate-400 font-normal">Texto com requisitos, modelo de operação e contexto global</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Cole aqui o briefing completo, modelo de operação, contexto de mercado, requisitos editoriais ou notas estratégicas do projeto..."
                  value={formData.briefingText || ''}
                  onChange={e => setFormData({ ...formData, briefingText: e.target.value })}
                  className="w-full bg-slate-950/70 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors leading-relaxed font-sans"
                />
              </div>

              {/* Gestor Hermes Configuration */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-indigo-500/20 space-y-3">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                    Configuração do Agente Gestor Hermes
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      Nome / Persona do Gestor
                    </label>
                    <input
                      type="text"
                      value={formData.gestorName}
                      onChange={e => setFormData({ ...formData, gestorName: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      Tom de Voz & Postura
                    </label>
                    <input
                      type="text"
                      value={formData.personaTone}
                      onChange={e => setFormData({ ...formData, personaTone: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Skills Selection */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-2 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Skills que o Gestor Hermes terá à disposição:</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {availableSkills.map(skill => {
                      const isSelected = formData.selectedSkills.includes(skill.id);
                      return (
                        <button
                          key={skill.id}
                          type="button"
                          onClick={() => toggleSkill(skill.id)}
                          className={`p-2.5 rounded-lg border text-left transition-all flex items-start justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                              : 'bg-slate-900/60 border-white/5 text-slate-400 hover:border-white/15'
                          }`}
                        >
                          <div>
                            <p className="text-xs font-bold">{skill.name}</p>
                            <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{skill.description}</p>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1 mt-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </form>
          ) : (
            /* Success View with Updated Prompt */
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
                    ✓
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-emerald-300">Projeto & Prompt Atualizados com Sucesso!</h3>
                    <p className="text-xs text-slate-300 font-mono mt-0.5">
                      URL Web: <code className="text-emerald-300">{typeof window !== 'undefined' ? `${window.location.origin}/p/${slug}` : `/p/${slug}`}</code>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/p/${slug}`;
                      navigator.clipboard.writeText(url);
                      alert(`URL copiada para o Hermes:\n${url}`);
                    }}
                    className="px-3.5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                  >
                    <span>🔗 Copiar URL Hermes</span>
                  </button>

                  <button
                    onClick={copyToClipboard}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer border border-white/10"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Prompt do Agente Hermes Atualizado (Ou passe a URL acima ao Hermes):</span>
                </label>
                <div className="relative">
                  <pre className="p-4 rounded-xl bg-slate-950 border border-white/10 text-xs text-slate-300 font-mono overflow-x-auto max-h-72 whitespace-pre-wrap leading-relaxed">
                    {updatedPrompt}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-950/50 flex items-center justify-between">
          {!updatedPrompt ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                form="edit-project-form"
                disabled={loading || !formData.name}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-indigo-400 to-emerald-400 hover:from-indigo-300 hover:to-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
              >
                {loading ? (
                  <span>Salvando e regenerando prompt...</span>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-slate-950" />
                    <span>Salvar & Regenerar Gestor</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="w-full flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
