'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { ProjectCard } from '@/components/ProjectCard';
import { CreateProjectModal } from '@/components/CreateProjectModal';
import { EditProjectModal } from '@/components/EditProjectModal';
import { ProjectDetailModal } from '@/components/ProjectDetailModal';
import { SkillsDrawer } from '@/components/SkillsDrawer';
import { ManifestoModal } from '@/components/ManifestoModal';
import { IntegrationsModal } from '@/components/IntegrationsModal';
import { ProjectSummary, SkillItem } from '@/lib/projects';
import { Plus, FolderPlus, Sparkles, Bot, Layers, ArrowUpRight, ShieldCheck, RefreshCw } from 'lucide-react';

export default function Home() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);
  const [isManifestoOpen, setIsManifestoOpen] = useState(false);
  const [isIntegrationsOpen, setIsIntegrationsOpen] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editingProjectData, setEditingProjectData] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, sRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/skills')
      ]);
      const pData = await pRes.json();
      const sData = await sRes.json();
      if (pData.success) setProjects(pData.projects);
      if (sData.success) setSkills(sData.skills);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDetail = (slug: string) => {
    setSelectedSlug(slug);
  };

  const handleOpenEditFromCard = async (slug: string) => {
    try {
      const res = await fetch(`/api/projects/${slug}`);
      const data = await res.json();
      if (data.success) {
        setEditingProjectData(data.project);
        setEditingSlug(slug);
      }
    } catch (err) {
      console.error('Erro ao carregar projeto para edição:', err);
    }
  };

  const handleOpenEditFromDetail = (projectData: any) => {
    setEditingProjectData(projectData);
    setEditingSlug(projectData.slug);
    setSelectedSlug(null);
  };

  const handleCreatedSuccess = (newSlug: string) => {
    fetchData();
    setSelectedSlug(newSlug);
  };

  const handleEditSuccess = () => {
    fetchData();
  };

  return (
    <div className="min-h-screen flex flex-col text-slate-100">
      {/* Navbar */}
      <Navbar
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenSkills={() => setIsSkillsOpen(true)}
        onOpenManifesto={() => setIsManifestoOpen(true)}
        onOpenIntegrations={() => setIsIntegrationsOpen(true)}
        totalProjects={projects.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Hero Banner */}
        <section className="relative overflow-hidden rounded-3xl p-8 border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/90 shadow-2xl backdrop-blur-xl">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Base Sólida de Criação de Projetos</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Governança Ágil de Projetos com <span className="bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent">Agentes Gestores Hermes</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Crie e edite projetos com 1 clique: o sistema atualiza toda a árvore de arquivos, brief, backlog de entregas reais e o <strong>System Prompt customizado</strong> para você colar no Hermes e interagir diretamente.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-emerald-300 hover:from-emerald-300 hover:to-emerald-200 rounded-xl shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Criar Novo Projeto + Gestor</span>
              </button>

              <button
                onClick={() => setIsSkillsOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-white/10 rounded-xl transition-all cursor-pointer"
              >
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Explorar {skills.length} Skills Modulares</span>
              </button>
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>Projetos Ativos</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-normal">
                  {projects.length}
                </span>
              </h2>
              <p className="text-xs text-slate-400">Projetos em desenvolvimento na pasta <code className="text-emerald-400">03-projetos/</code></p>
            </div>

            <button
              onClick={fetchData}
              title="Atualizar lista"
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 border border-white/5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(n => (
                <div key={n} className="h-56 glass-card rounded-2xl animate-pulse bg-slate-900/50" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-16 glass-card rounded-3xl border border-white/5 p-8">
              <FolderPlus className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">Nenhum projeto encontrado</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Crie seu primeiro projeto para inicializar a pasta e o prompt do Gestor Hermes automaticamente.
              </p>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="mt-4 px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer"
              >
                Criar Projeto Agora
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(project => (
                <ProjectCard
                  key={project.slug}
                  project={project}
                  onSelect={handleOpenDetail}
                  onViewPrompt={handleOpenDetail}
                  onEdit={handleOpenEditFromCard}
                />
              ))}
            </div>
          )}
        </section>

      </main>

      {/* Modals & Drawers */}
      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleCreatedSuccess}
        availableSkills={skills}
      />

      <EditProjectModal
        isOpen={!!editingSlug}
        slug={editingSlug}
        initialData={editingProjectData}
        onClose={() => {
          setEditingSlug(null);
          setEditingProjectData(null);
        }}
        onSuccess={handleEditSuccess}
        availableSkills={skills}
      />

      <ProjectDetailModal
        slug={selectedSlug}
        onClose={() => setSelectedSlug(null)}
        onProjectUpdated={fetchData}
        onOpenEdit={handleOpenEditFromDetail}
      />

      <SkillsDrawer
        isOpen={isSkillsOpen}
        onClose={() => setIsSkillsOpen(false)}
        skills={skills}
      />

      <ManifestoModal
        isOpen={isManifestoOpen}
        onClose={() => setIsManifestoOpen(false)}
      />

      <IntegrationsModal
        isOpen={isIntegrationsOpen}
        onClose={() => setIsIntegrationsOpen(false)}
      />

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-6 text-center text-xs text-slate-500">
        <p>FBR Agency Flux ⚡ — Governança Ágil, Baseada em Artefatos e Gestores Hermes.</p>
      </footer>
    </div>
  );
}
