import React from 'react';
import { AlertOctagon, CalendarClock, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Audit } from '../types';
import { isCorrectionOverdue, getDaysElapsed, formatReadableDate } from '../utils/dateUtils';

interface AlertsPanelProps {
  audits: Audit[];
  onFocusAudit: (auditId: string) => void;
  onQuickResolve: (auditId: string) => void;
}

export default function AlertsPanel({ audits, onFocusAudit, onQuickResolve }: AlertsPanelProps) {
  // 1. Unimplemented accounts alerts
  const unimplemented = audits.filter(a => a.estado === 'no_implementado');
  
  // 2. Correction overdue (> 7 days) alerts
  const overdueCorrections = audits.filter(a => isCorrectionOverdue(a));

  const totalAlerts = unimplemented.length + overdueCorrections.length;

  if (totalAlerts === 0) {
    return (
      <div 
        className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center h-full shadow-sm"
        id="alerts-panel-empty"
      >
        <div className="bg-emerald-500/10 p-3 rounded-full text-emerald-600 mb-3">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="font-sans font-bold text-slate-800 text-sm">Sin alertas críticas</h3>
        <p className="text-xs text-slate-500 mt-2 max-w-xs leading-relaxed">
          Todas las cuentas auditadas están al día. No hay pendientes urgentes ni atrasos detectados.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 flex flex-col h-full shadow-lg" id="alerts-panel">
      <div className="flex items-center justify-between border-b border-slate-850 pb-4 mb-4">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4.5 h-4.5 text-blue-400" />
          <h2 className="font-sans font-bold text-blue-400 text-xs uppercase tracking-wider">
            Alertas y Avisos Críticos
          </h2>
        </div>
        <span className="text-[10px] font-mono bg-red-500/20 text-red-300 px-2.5 py-0.5 rounded-full font-bold uppercase border border-red-500/30 animate-pulse">
          Acción Urgente
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1 max-h-[380px] scrollbar-thin">
        {/* Unimplemented accounts */}
        {unimplemented.map((a) => (
          <div 
            key={`unimp-${a.id}`}
            id={`alert-unimp-${a.id}`}
            className="flex space-x-3 bg-slate-850/40 p-3.5 rounded-xl border border-slate-800 hover:border-slate-750 transition-colors"
          >
            {/* Visual Red vertical indicator line */}
            <div className="w-1 bg-red-500 rounded-full shrink-0 my-0.5"></div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-sans font-black uppercase text-red-400 tracking-wider">
                  No Implementado
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {formatReadableDate(a.fechaAuditoria)}
                </span>
              </div>
              
              <h4 className="text-xs font-bold text-white mt-1 truncate" title={a.cliente}>
                {a.cliente}
              </h4>
              
              {a.cuentaMetaAds && a.cuentaMetaAds !== a.cliente && (
                <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                  {a.cuentaMetaAds}
                </p>
              )}

              <p className="text-xs text-slate-300 bg-slate-900/50 p-2 rounded-lg mt-2 line-clamp-2 border border-slate-800/60 leading-relaxed font-sans">
                {a.descripcion}
              </p>

              <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-850/60 text-[10px] text-slate-400">
                <span>Responsable: <strong className="text-slate-300">{a.responsable}</strong></span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onFocusAudit(a.id)}
                    className="text-blue-400 hover:text-blue-300 font-bold flex items-center space-x-0.5 cursor-pointer transition-colors"
                    title="Enfocar en tabla"
                  >
                    <span>Ver</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <span className="text-slate-700">|</span>
                  <button
                    onClick={() => onQuickResolve(a.id)}
                    className="text-emerald-400 hover:text-emerald-300 font-bold cursor-pointer transition-colors"
                    title="Marcar como correcto"
                  >
                    Resolver
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Overdue corrections (> 7 days) */}
        {overdueCorrections.map((a) => {
          const daysElapsed = getDaysElapsed(a.fechaAuditoria);
          return (
            <div 
              key={`overdue-${a.id}`}
              id={`alert-overdue-${a.id}`}
              className="flex space-x-3 bg-slate-850/40 p-3.5 rounded-xl border border-slate-800 hover:border-slate-750 transition-colors"
            >
              {/* Visual Yellow vertical indicator line */}
              <div className="w-1 bg-amber-400 rounded-full shrink-0 my-0.5"></div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-sans font-black uppercase text-amber-400 tracking-wider flex items-center gap-1">
                    Corrección Estancada
                    <span className="bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded font-mono font-bold text-[9px]">
                      +{daysElapsed}d
                    </span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {formatReadableDate(a.fechaAuditoria)}
                  </span>
                </div>
                
                <h4 className="text-xs font-bold text-white mt-1 truncate" title={a.cliente}>
                  {a.cliente}
                </h4>
                
                {a.cuentaMetaAds && a.cuentaMetaAds !== a.cliente && (
                  <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                    {a.cuentaMetaAds}
                  </p>
                )}

                <p className="text-xs text-slate-300 bg-slate-900/50 p-2 rounded-lg mt-2 line-clamp-2 border border-slate-800/60 leading-relaxed font-sans">
                  <strong className="text-amber-400">{a.tipoError}:</strong> {a.descripcion}
                </p>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-850/60 text-[10px] text-slate-400">
                  <span>Auditoría: <strong className="text-slate-300">{formatReadableDate(a.fechaAuditoria)}</strong></span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onFocusAudit(a.id)}
                      className="text-blue-400 hover:text-blue-300 font-bold flex items-center space-x-0.5 cursor-pointer transition-colors"
                    >
                      <span>Ver</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <span className="text-slate-700">|</span>
                    <button
                      onClick={() => onQuickResolve(a.id)}
                      className="text-emerald-400 hover:text-emerald-300 font-bold cursor-pointer transition-colors"
                    >
                      Resolver
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

