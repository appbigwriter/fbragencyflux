'use client';

import React, { useState, useEffect } from 'react';
import { X, Bot, FileText, CheckSquare, FolderTree, Copy, Check, ExternalLink, Sparkles, RefreshCw } from 'lucide-react';

interface ProjectDetailModalProps {
  slug: string | null;
  onClose: () => void;
  onProjectUpdated: () => void;
}

export function ProjectDetailModal({ slug, onClose, onProjectUpdated }: ProjectDetailModalProps) {
  const [tab, setTab] = useState<'prompt' | 'brief' | 'backlog' | 'files'>('prompt');
  const [projectData, setProjectData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editingBacklog, setEditingBacklog] = useState(false);
  const [backlogDraft, setBacklogDraft] = useState('');

  const fetchProject = async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${slug}`);
      const data = await res.json();
      if (data.success) {
        setProjectData(data.project);
        setBacklogDraft(data.project.backlog || '');
      }
    } catch (err) {
      console.error('Erro ao carregar detalhes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchProject();
      setTab('prompt');
    }
  }, [slug]);

  if (!slug) return null;

  const copyPrompt = () => {
    if (projectData?.prompt) {
      navigator.clipboard.writeText(projectData.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleToggleTask = async (taskLine: string, currentlyChecked: boolean) => {
    if (!projectData?.backlog) return;

    const oldPattern = currentlyChecked ? `- [x] ${taskLine}` : `- [ ] ${taskLine}`;
    const newPattern = currentlyChecked ? `- [ ] ${taskLine}` : `- [x] ${taskLine}`;

    const newBacklog = projectData.backlog.replace(oldPattern, newPattern);

    try {
      const res = await fetch(`/api/projects/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: 'backlog.md', content: newBacklog })
      });
      if (res.ok) {
        setProjectData({ ...projectData, backlog: newBacklog });
        setBacklogDraft(newBacklog);
        onProjectUpdated();
      }
    } catch (err) {
      alert('Erro ao atualizar tarefa');
    }
  };

  const handleSaveBacklog = async () => {
    try {
      const res = await fetch(`/api/projects/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: 'backlog.md', content: backlogDraft })
      });
      if (res.ok) {
        setProjectData({ ...projectData, backlog: backlogDraft });
        setEditingBacklog(false);
        onProjectUpdated();
      }
    } catch (err) {
      alert('Erro ao salvar backlog');
    }
  };

  const parseBacklogTasks = (markdown: string) => {
    const lines = markdown.split('\n');
    const tasks: { line: string; checked: boolean; section?: string }[] = [];
    let currentSection = '';

    for (const line of lines) {
      if (line.startsWith('## ') || line.startsWith('### ')) {
        currentSection = line.replace(/^[#]+\s*/, '');
      } else if (line.trim().startsWith('- [ ]')) {
        tasks.push({
          line: line.replace('- [ ]', '').trim(),
          checked: false,
          section: currentSection
        });
      } else if (line.trim().startsWith('- [x]')) {
        tasks.push({
          line: line.replace('- [x]', '').trim(),
          checked: true,
          section: currentSection
        });
      }
    }
    return tasks;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-950/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                /{slug}
              </span>
              <h2 className="text-lg font-bold text-white">Central do Projeto</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Gestor Hermes, Briefing, Backlog e Artefatos Físicos</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchProject}
              title="Recarregar dados"
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-5 border-b border-white/10 flex gap-2 bg-slate-950/30">
          <button
            onClick={() => setTab('prompt')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              tab === 'prompt'
                ? 'border-indigo-400 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Gestor Hermes (System Prompt)</span>
          </button>

          <button
            onClick={() => setTab('backlog')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              tab === 'backlog'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Backlog de Entregáveis</span>
          </button>

          <button
            onClick={() => setTab('brief')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              tab === 'brief'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Briefing</span>
          </button>

          <button
            onClick={() => setTab('files')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              tab === 'files'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>Arquivos & Artefatos</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mb-2 text-emerald-400" />
              <span>Carregando dados do projeto...</span>
            </div>
          ) : (
            <>
              {/* Tab: Hermes Prompt */}
              {tab === 'prompt' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        <span>Prompt Completo do Agente Gestor Hermes</span>
                      </h3>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Copie este prompt e cole no Hermes para iniciar o trabalho diretamente com o agente responsável.
                      </p>
                    </div>

                    <button
                      onClick={copyPrompt}
                      className="px-4 py-2 text-xs font-semibold text-slate-950 bg-indigo-300 hover:bg-indigo-200 rounded-lg flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? 'Copiado para Área de Transferência!' : 'Copiar Prompt'}</span>
                    </button>
                  </div>

                  <div className="relative">
                    <pre className="p-4 rounded-xl bg-slate-950 border border-white/10 text-xs text-slate-300 font-mono overflow-x-auto max-h-[50vh] whitespace-pre-wrap leading-relaxed">
                      {projectData?.prompt || 'Nenhum prompt encontrado para este projeto.'}
                    </pre>
                  </div>
                </div>
              )}

              {/* Tab: Backlog */}
              {tab === 'backlog' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">Checklist de Execução Real</h3>
                      <p className="text-xs text-slate-400">Clique nas tarefas para marcar como concluídas no arquivo físico.</p>
                    </div>

                    <button
                      onClick={() => setEditingBacklog(!editingBacklog)}
                      className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:bg-slate-800 transition-colors"
                    >
                      {editingBacklog ? 'Ver Modo Lista' : 'Editar Markdown'}
                    </button>
                  </div>

                  {editingBacklog ? (
                    <div className="space-y-3">
                      <textarea
                        rows={14}
                        value={backlogDraft}
                        onChange={(e) => setBacklogDraft(e.target.value)}
                        className="w-full p-4 rounded-xl bg-slate-950 border border-white/10 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        onClick={handleSaveBacklog}
                        className="px-4 py-2 text-xs font-semibold bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-lg transition-colors cursor-pointer"
                      >
                        Salvar Alterações
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {parseBacklogTasks(projectData?.backlog || '').map((task, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleToggleTask(task.line, task.checked)}
                          className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                            task.checked
                              ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-400'
                              : 'bg-slate-950/60 border-white/5 text-slate-200 hover:border-white/15'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded flex items-center justify-center border ${
                            task.checked
                              ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                              : 'border-slate-600 bg-slate-900'
                          }`}>
                            {task.checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <div className="flex-1">
                            <p className={`text-xs font-medium ${task.checked ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                              {task.line}
                            </p>
                            {task.section && (
                              <span className="text-[10px] text-emerald-400/70 font-mono">
                                {task.section}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Brief */}
              {tab === 'brief' && (
                <div className="space-y-4">
                  <pre className="p-4 rounded-xl bg-slate-950 border border-white/10 text-xs text-slate-300 font-mono overflow-x-auto max-h-[50vh] whitespace-pre-wrap leading-relaxed">
                    {projectData?.brief || 'Nenhum brief.md encontrado.'}
                  </pre>
                </div>
              )}

              {/* Tab: Files */}
              {tab === 'files' && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Árvore de Arquivos em <code>03-projetos/{slug}</code>
                  </h3>
                  <div className="p-4 rounded-xl bg-slate-950 border border-white/10 font-mono text-xs space-y-1.5 max-h-[50vh] overflow-y-auto">
                    {projectData?.files && projectData.files.length > 0 ? (
                      projectData.files.map((f: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 text-slate-300">
                          <span className={f.isDir ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                            {f.isDir ? '📁' : '📄'}
                          </span>
                          <span>{f.path}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500">Nenhum arquivo listado.</p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
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
