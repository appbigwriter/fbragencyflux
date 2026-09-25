'use client';

import React, { useState, useEffect } from 'react';
import { X, Network, RefreshCw, CheckCircle2, AlertTriangle, XCircle, Database, Radio, Server, Bot } from 'lucide-react';

interface IntegrationItem {
  id: string;
  name: string;
  target: string;
  status: 'connected' | 'disconnected' | 'mock';
  details: string;
  latencyMs?: number;
}

interface IntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function IntegrationsModal({ isOpen, onClose }: IntegrationsModalProps) {
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<string>('');

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/integrations/status');
      const data = await res.json();
      if (data.success) {
        setIntegrations(data.integrations);
        setLastCheck(new Date(data.timestamp).toLocaleTimeString());
      }
    } catch (err) {
      console.error('Erro ao verificar integrações:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getIcon = (id: string) => {
    switch (id) {
      case 'database': return <Database className="w-5 h-5 text-emerald-400" />;
      case 'control-tower': return <Server className="w-5 h-5 text-indigo-400" />;
      case 'n8n': return <Radio className="w-5 h-5 text-amber-400" />;
      case 'hermes': return <Bot className="w-5 h-5 text-purple-400" />;
      default: return <Network className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: 'connected' | 'disconnected' | 'mock') => {
    switch (status) {
      case 'connected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Conectado</span>
          </span>
        );
      case 'mock':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>File-First / Mock</span>
          </span>
        );
      case 'disconnected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" />
            <span>Desconectado</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Network className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Central de Integrações da FBR Agency</h2>
              <p className="text-xs text-slate-400">PostgreSQL VPS, Supabase, Control Tower, n8n e Agentes Hermes</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchStatus}
              title="Testar Conexões Novamente"
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

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-white/5">
            <span>Diagnóstico das conexões configuradas no <code>.env.local</code></span>
            {lastCheck && <span>Última checagem: {lastCheck}</span>}
          </div>

          {loading && integrations.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-xs text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-400 mb-2" />
              <span>Diagnosticando status dos sistemas...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {integrations.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-slate-950/60 border border-white/5 hover:border-white/10 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                      {getIcon(item.id)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{item.name}</h4>
                        {item.latencyMs !== undefined && item.latencyMs > 0 && (
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-white/5">
                            {item.latencyMs}ms
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">{item.target}</p>
                      <p className="text-xs text-slate-300 mt-1">{item.details}</p>
                    </div>
                  </div>

                  <div className="shrink-0 sm:self-center">
                    {getStatusBadge(item.status)}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/15 text-xs text-slate-300 space-y-1">
            <h5 className="font-bold text-indigo-300 flex items-center gap-1.5">
              <span>Arquitetura Resiliente (Zero Deadlock)</span>
            </h5>
            <p className="text-slate-400 leading-relaxed">
              Todas as integrações operam de forma <strong>não-bloqueante</strong>. Caso a rede VPS ou Control Tower estejam com rota indisponível momentaneamente, a criação e edição continuam funcionando 100% no disco (File-First) e sincronizam automaticamente assim que a conexão restabelece.
            </p>
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
