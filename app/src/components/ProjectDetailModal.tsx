'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, Bot, FileText, CheckSquare, FolderTree, Copy, Check, ExternalLink, 
  Sparkles, RefreshCw, MessageSquarePlus, Radio, Send, AlertCircle, 
  Clock, Zap, ShieldCheck, CheckCircle2, MessageSquare
} from 'lucide-react';

interface ProjectDetailModalProps {
  slug: string | null;
  onClose: () => void;
  onProjectUpdated: () => void;
  onOpenEdit?: (projectData: any) => void;
}

export function ProjectDetailModal({ slug, onClose, onProjectUpdated, onOpenEdit }: ProjectDetailModalProps) {
  const [tab, setTab] = useState<'prompt' | 'updates' | 'backlog' | 'brief' | 'files'>('prompt');
  const [projectData, setProjectData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedBrief, setCopiedBrief] = useState(false);
  const [copiedUpdates, setCopiedUpdates] = useState(false);
  
  // Backlog state
  const [editingBacklog, setEditingBacklog] = useState(false);
  const [backlogDraft, setBacklogDraft] = useState('');
  
  // Brief state
  const [editingBrief, setEditingBrief] = useState(false);
  const [briefDraft, setBriefDraft] = useState('');
  const [savingBrief, setSavingBrief] = useState(false);

  // Updates & Cobranças state
  const [updatesDraft, setUpdatesDraft] = useState('');
  const [editingUpdates, setEditingUpdates] = useState(false);
  const [savingUpdatesDraft, setSavingUpdatesDraft] = useState(false);
  const [newInstruction, setNewInstruction] = useState('');
  const [newType, setNewType] = useState('⚡ Cobrança de Entrega');
  const [newPriority, setNewPriority] = useState('Alta');
  const [newDeliverable, setNewDeliverable] = useState('');
  const [sendingUpdate, setSendingUpdate] = useState(false);

  const fetchProject = async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${slug}`);
      const data = await res.json();
      if (data.success) {
        setProjectData(data.project);
        setBacklogDraft(data.project.backlog || '');
        setBriefDraft(data.project.brief || '');
        setUpdatesDraft(data.project.updates || '');
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

  const copyBrief = () => {
    if (projectData?.brief) {
      navigator.clipboard.writeText(projectData.brief);
      setCopiedBrief(true);
      setTimeout(() => setCopiedBrief(false), 2500);
    }
  };

  const handleSaveBrief = async () => {
    setSavingBrief(true);
    try {
      const res = await fetch(`/api/projects/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: 'brief.md', content: briefDraft })
      });
      if (res.ok) {
        setProjectData({ ...projectData, brief: briefDraft });
        setEditingBrief(false);
        onProjectUpdated();
      } else {
        alert('Erro ao salvar briefing');
      }
    } catch (err) {
      alert('Erro na requisição ao salvar briefing');
    } finally {
      setSavingBrief(false);
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
    const lines = (markdown || '').split('\n');
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

  const copyUpdates = () => {
    if (projectData?.updates) {
      navigator.clipboard.writeText(projectData.updates);
      setCopiedUpdates(true);
      setTimeout(() => setCopiedUpdates(false), 2500);
    }
  };

  const handleSendUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInstruction.trim()) return;

    setSendingUpdate(true);
    try {
      const res = await fetch(`/api/projects/${slug}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instruction: newInstruction,
          type: newType,
          priority: newPriority,
          deliverable: newDeliverable
        })
      });
      const data = await res.json();
      if (data.success) {
        setProjectData({ ...projectData, updates: data.updates });
        setUpdatesDraft(data.updates);
        setNewInstruction('');
        setNewDeliverable('');
        onProjectUpdated();
      } else {
        alert('Erro ao enviar cobrança: ' + data.error);
      }
    } catch (err) {
      alert('Falha de rede ao enviar cobrança ao Hermes');
    } finally {
      setSendingUpdate(false);
    }
  };

  const handleToggleUpdate = async (updateLine: string, currentlyChecked: boolean) => {
    if (!projectData?.updates) return;

    try {
      const res = await fetch(`/api/projects/${slug}/updates`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updateLine, currentlyChecked })
      });
      const data = await res.json();
      if (data.success) {
        setProjectData({ ...projectData, updates: data.updates });
        setUpdatesDraft(data.updates);
        onProjectUpdated();
      }
    } catch (err) {
      alert('Erro ao atualizar status da cobrança');
    }
  };

  const handleSaveUpdatesDraft = async () => {
    setSavingUpdatesDraft(true);
    try {
      const res = await fetch(`/api/projects/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: 'updates.md', content: updatesDraft })
      });
      if (res.ok) {
        setProjectData({ ...projectData, updates: updatesDraft });
        setEditingUpdates(false);
        onProjectUpdated();
      } else {
        alert('Erro ao salvar updates.md');
      }
    } catch (err) {
      alert('Erro na requisição ao salvar updates');
    } finally {
      setSavingUpdatesDraft(false);
    }
  };

  const parseUpdates = (markdown: string) => {
    const lines = (markdown || '').split('\n');
    const pendingUpdates: { raw: string; checked: boolean; title: string; instruction: string; priority?: string; deliverable?: string; author?: string }[] = [];
    
    let isPendingSection = false;
    let currentItem: any = null;

    for (const line of lines) {
      if (line.includes('## 📥 Observações e Cobranças Ativas')) {
        isPendingSection = true;
      } else if (line.includes('## ✅ Histórico')) {
        if (currentItem) {
          pendingUpdates.push(currentItem);
          currentItem = null;
        }
        isPendingSection = false;
      } else if (isPendingSection) {
        if (line.trim().startsWith('- [ ]') || line.trim().startsWith('- [x]')) {
          if (currentItem) pendingUpdates.push(currentItem);
          const checked = line.trim().startsWith('- [x]');
          const rawMatch = line.replace(/^- \[[ x]\]\s*/, '').trim();
          currentItem = {
            raw: rawMatch,
            checked,
            title: rawMatch.replace(/\*\*/g, ''),
            instruction: '',
            priority: 'Alta',
            deliverable: '',
            author: 'Sergio Castro'
          };
        } else if (currentItem) {
          if (line.includes('**Autor**:')) {
            currentItem.author = line.replace(/.*?\*\*Autor\*\*:\s*/, '').trim();
          } else if (line.includes('**Instrução**:')) {
            currentItem.instruction = line.replace(/.*?\*\*Instrução\*\*:\s*/, '').trim();
          } else if (line.includes('**Prioridade**:')) {
            currentItem.priority = line.replace(/.*?\*\*Prioridade\*\*:\s*/, '').trim();
          } else if (line.includes('**Entregável**:') || line.includes('**Entregável Relacionado**:')) {
            currentItem.deliverable = line.replace(/.*?\*\*Entregável.*?\*\*:\s*/, '').trim();
          }
        }
      }
    }
    if (currentItem) {
      pendingUpdates.push(currentItem);
    }
    return pendingUpdates;
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
            {onOpenEdit && (
              <button
                onClick={() => onOpenEdit(projectData)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <span>Editar Projeto</span>
              </button>
            )}
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
        <div className="px-5 border-b border-white/10 flex gap-2 bg-slate-950/30 overflow-x-auto">
          <button
            onClick={() => setTab('prompt')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer shrink-0 ${
              tab === 'prompt'
                ? 'border-indigo-400 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Gestor Hermes (System Prompt)</span>
          </button>

          <button
            onClick={() => setTab('updates')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer shrink-0 ${
              tab === 'updates'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Sincronização & Cobranças Hermes</span>
            {projectData?.pendingUpdatesCount > 0 && (
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {projectData.pendingUpdatesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setTab('backlog')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer shrink-0 ${
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
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer shrink-0 ${
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
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer shrink-0 ${
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
              {/* Tab: Hermes Prompt & Web URL */}
              {tab === 'prompt' && (
                <div className="space-y-4">
                  {/* Web URL Banner */}
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                        🌐 Acesso Direto via Web URL para Agentes Hermes
                      </span>
                      <p className="text-xs text-slate-200 mt-1 font-mono break-all">
                        {typeof window !== 'undefined' ? `${window.location.origin}/p/${slug}` : `/p/${slug}`}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Apenas diga ao Hermes: <code className="text-emerald-300">"Hermes, leia esta URL e assuma o projeto."</code>
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        const url = `${window.location.origin}/p/${slug}`;
                        navigator.clipboard.writeText(url);
                        alert(`URL copiada para o Hermes:\n${url}`);
                      }}
                      className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer self-start sm:self-center"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar URL do Hermes</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        <span>Prompt do Agente Gestor (Para Cópia Manual se preferir)</span>
                      </h3>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Prompt completo com missão, regras de ouro, protocolo de sincronização e diretrizes das skills selecionadas.
                      </p>
                    </div>

                    <button
                      onClick={copyPrompt}
                      className="px-4 py-2 text-xs font-semibold text-slate-950 bg-indigo-300 hover:bg-indigo-200 rounded-lg flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
                    </button>
                  </div>

                  <div className="relative">
                    <pre className="p-4 rounded-xl bg-slate-950 border border-white/10 text-xs text-slate-300 font-mono overflow-x-auto max-h-[45vh] whitespace-pre-wrap leading-relaxed">
                      {projectData?.prompt || 'Nenhum prompt encontrado para este projeto.'}
                    </pre>
                  </div>
                </div>
              )}

              {/* Tab: Updates & Sincronização Hermes */}
              {tab === 'updates' && (
                <div className="space-y-5">
                  {/* Status Banner */}
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                          <Radio className="w-3 h-3 animate-pulse" /> Canal de Sincronização Contínua Ativo
                        </span>
                        <span className="text-xs font-mono text-slate-400">({slug}/updates.md)</span>
                      </div>
                      <p className="text-xs text-slate-200 mt-1">
                        Poste cobranças, observações e diretrizes de tarefas. O Hermes consome isso automaticamente como <strong>Updates Prioritários</strong>.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={copyUpdates}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-1.5 transition-colors border border-white/10 cursor-pointer"
                      >
                        {copiedUpdates ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedUpdates ? 'Copiado!' : 'Copiar updates.md'}</span>
                      </button>

                      <button
                        onClick={() => setEditingUpdates(!editingUpdates)}
                        className="text-xs font-semibold text-amber-400 hover:text-amber-300 px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 transition-colors cursor-pointer"
                      >
                        {editingUpdates ? 'Ver Modo Lista' : '✏️ Editar Markdown'}
                      </button>
                    </div>
                  </div>

                  {editingUpdates ? (
                    <div className="space-y-3">
                      <textarea
                        rows={14}
                        value={updatesDraft}
                        onChange={(e) => setUpdatesDraft(e.target.value)}
                        placeholder="Conteúdo bruto de updates.md..."
                        className="w-full p-4 rounded-xl bg-slate-950 border border-white/15 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500 leading-relaxed"
                      />
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] text-slate-400">
                          💡 Dica: Ao salvar o arquivo, o Hermes recebe a atualização imediatamente via URL /p/{slug}.
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setUpdatesDraft(projectData?.updates || '');
                              setEditingUpdates(false);
                            }}
                            className="px-3 py-2 text-xs text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={handleSaveUpdatesDraft}
                            disabled={savingUpdatesDraft}
                            className="px-4 py-2 text-xs font-semibold bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 rounded-lg transition-colors cursor-pointer shadow-md"
                          >
                            {savingUpdatesDraft ? 'Salvando...' : 'Salvar updates.md'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Post New Update Form */}
                      <form onSubmit={handleSendUpdate} className="p-4 rounded-xl bg-slate-950/70 border border-white/10 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                            <MessageSquarePlus className="w-4 h-4 text-amber-400" />
                            <span>Nova Observação / Cobrança para o Hermes</span>
                          </h4>
                          <span className="text-[11px] text-slate-400">Publisher: Sergio Castro</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                          <div>
                            <label className="block text-[11px] font-medium text-slate-300 mb-1">
                              Tipo de Mensagem
                            </label>
                            <select
                              value={newType}
                              onChange={(e) => setNewType(e.target.value)}
                              className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                            >
                              <option value="⚡ Cobrança de Entrega">⚡ Cobrança de Entrega</option>
                              <option value="✍️ Diretriz Editorial">✍️ Diretriz Editorial</option>
                              <option value="🎯 Ajuste de Escopo">🎯 Ajuste de Escopo</option>
                              <option value="🔍 Revisão / Feedback">🔍 Revisão / Feedback</option>
                              <option value="📌 Nota Geral">📌 Nota Geral</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-medium text-slate-300 mb-1">
                              Prioridade
                            </label>
                            <select
                              value={newPriority}
                              onChange={(e) => setNewPriority(e.target.value)}
                              className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                            >
                              <option value="Urgente">🔴 Urgente</option>
                              <option value="Alta">🟡 Alta</option>
                              <option value="Média">🔵 Média</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-medium text-slate-300 mb-1">
                              Entregável Relacionado (Opcional)
                            </label>
                            <input
                              type="text"
                              placeholder="Ex: 01-pesquisa/analise-nicho.md"
                              value={newDeliverable}
                              onChange={(e) => setNewDeliverable(e.target.value)}
                              className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-slate-300 mb-1">
                            Instrução / Cobrança Detalhada *
                          </label>
                          <textarea
                            rows={3}
                            required
                            placeholder="Descreva a orientação, ajuste necessário, cobrança de prazo ou refinamento..."
                            value={newInstruction}
                            onChange={(e) => setNewInstruction(e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-amber-500 leading-relaxed"
                          />
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={sendingUpdate || !newInstruction.trim()}
                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-md transition-colors cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{sendingUpdate ? 'Registrando...' : 'Enviar Cobrança ao Hermes'}</span>
                          </button>
                        </div>
                      </form>

                      {/* Active Updates Feed */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                            <span>Observações & Cobranças no updates.md</span>
                            <span className="text-[10px] text-slate-400 font-normal">(Clique para marcar como resolvida)</span>
                          </h4>
                        </div>

                        {parseUpdates(projectData?.updates || '').length === 0 ? (
                          <div className="p-6 rounded-xl bg-slate-950/40 border border-white/5 text-center text-slate-500 text-xs">
                            Nenhuma cobrança ativa no momento. Todas as diretrizes estão em dia!
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {parseUpdates(projectData?.updates || '').map((item, idx) => (
                              <div
                                key={idx}
                                onClick={() => handleToggleUpdate(item.raw, item.checked)}
                                className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                                  item.checked
                                    ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-400'
                                    : 'bg-slate-950/70 border-amber-500/20 text-slate-200 hover:border-amber-500/40'
                                }`}
                              >
                                <div className={`w-5 h-5 rounded mt-0.5 flex items-center justify-center border shrink-0 ${
                                  item.checked
                                    ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                                    : 'border-amber-500/50 bg-slate-900'
                                }`}>
                                  {item.checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                </div>

                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <span className={`text-xs font-bold ${item.checked ? 'line-through text-slate-500' : 'text-amber-300'}`}>
                                      {item.title}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                      {item.priority && (
                                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                                          item.priority.toLowerCase().includes('urgente')
                                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                            : item.priority.toLowerCase().includes('alta')
                                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                        }`}>
                                          {item.priority}
                                        </span>
                                      )}
                                      <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                                        {item.author || 'Sergio Castro'}
                                      </span>
                                    </div>
                                  </div>

                                  {item.instruction && (
                                    <p className={`text-xs ${item.checked ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                                      {item.instruction}
                                    </p>
                                  )}

                                  {item.deliverable && (
                                    <p className="text-[11px] font-mono text-emerald-400/80">
                                      📁 Entregável: {item.deliverable}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
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
                  {/* Briefing Header Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-white/10">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-400" />
                        <span>Briefing & Diretrizes Estratégicas ({slug}/brief.md)</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Este documento é lido pelos agentes Hermes para entender a proposta e diretrizes do projeto.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                      <button
                        onClick={copyBrief}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-1.5 transition-colors border border-white/10 cursor-pointer"
                      >
                        {copiedBrief ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedBrief ? 'Copiado!' : 'Copiar'}</span>
                      </button>

                      <button
                        onClick={() => setEditingBrief(!editingBrief)}
                        className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                      >
                        {editingBrief ? 'Ver Visualização' : '✏️ Editar Briefing'}
                      </button>
                    </div>
                  </div>

                  {editingBrief ? (
                    <div className="space-y-3">
                      <div className="relative">
                        <textarea
                          rows={15}
                          value={briefDraft}
                          onChange={(e) => setBriefDraft(e.target.value)}
                          placeholder="Escreva ou cole o briefing do projeto em Markdown..."
                          className="w-full p-4 rounded-xl bg-slate-950 border border-white/15 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500 leading-relaxed"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] text-slate-400">
                          💡 Dica: Ao salvar, as alterações ficam disponíveis imediatamente para os agentes via URL do projeto.
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setBriefDraft(projectData?.brief || '');
                              setEditingBrief(false);
                            }}
                            className="px-3 py-2 text-xs text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={handleSaveBrief}
                            disabled={savingBrief}
                            className="px-4 py-2 text-xs font-semibold bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-slate-950 rounded-lg transition-colors cursor-pointer shadow-md"
                          >
                            {savingBrief ? 'Salvando...' : 'Salvar Briefing'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <pre className="p-4 rounded-xl bg-slate-950 border border-white/10 text-xs text-slate-300 font-mono overflow-x-auto max-h-[50vh] whitespace-pre-wrap leading-relaxed">
                        {projectData?.brief || 'Nenhum brief.md encontrado.'}
                      </pre>
                    </div>
                  )}
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
