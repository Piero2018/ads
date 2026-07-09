import React, { useState } from 'react';
import { CalendarDays, ChevronDown, ChevronUp, CheckCircle, AlertTriangle, AlertOctagon, HelpCircle, BarChart3 } from 'lucide-react';
import { Audit } from '../types';
import { getWeeklySummaries, formatReadableDate } from '../utils/dateUtils';

interface WeeklySummaryPanelProps {
  audits: Audit[];
  onFocusAudit: (auditId: string) => void;
}

export default function WeeklySummaryPanel({ audits, onFocusAudit }: WeeklySummaryPanelProps) {
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);

  const weeklyData = getWeeklySummaries(audits);

  const toggleExpand = (range: string) => {
    setExpandedWeek(expandedWeek === range ? null : range);
  };

  if (weeklyData.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-slate-400 text-xs font-bold shadow-sm">
        Sin datos suficientes para agrupar por semanas.
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col" id="weekly-summary-panel">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h2 className="font-sans font-extrabold text-slate-800 text-sm tracking-tight uppercase">
            Resumen de Desempeño Semanal
          </h2>
        </div>
        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200 font-bold uppercase">
          Por Semana de Creación
        </span>
      </div>

      <p className="text-xs text-slate-500 mb-4 leading-relaxed">
        Resumen automático de la efectividad gráfica de las campañas agrupadas por semana natural.
      </p>

      <div className="space-y-4" id="weekly-summaries-list">
        {weeklyData.map(({ label, range, summary, audits: weekAudits }) => {
          const isExpanded = expandedWeek === range;
          
          // Calculate effectiveness percentage (Correctas / Total)
          const successRate = summary.total > 0 
          ? Math.round((summary.correcto / summary.total) * 100) 
          : 0;

          // Build width percentages for visual horizontal stacked bar
          const pctCorrecto = (summary.correcto / summary.total) * 100;
          const pctCorreccion = (summary.correccion_requerida / summary.total) * 100;
          const pctNoImp = (summary.no_implementado / summary.total) * 100;
          const pctPendiente = (summary.pendiente / summary.total) * 100;

          return (
            <div 
              key={range} 
              id={`week-group-${range}`}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs transition-all duration-200 hover:border-slate-300"
            >
              {/* Header Accordion Trigger */}
              <div 
                onClick={() => toggleExpand(range)}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-50 p-2 rounded-lg text-blue-600 shrink-0 mt-0.5">
                    <CalendarDays className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-sans font-extrabold text-slate-800 leading-tight">
                      {label}
                    </h3>
                    <p className="text-[11px] font-mono text-slate-400 mt-1">
                      {formatReadableDate(summary.semanaInicio)} al {formatReadableDate(summary.semanaFin)}
                    </p>
                  </div>
                </div>

                {/* Performance stats summary */}
                <div className="flex items-center space-x-6 sm:space-x-8">
                  {/* Effectiveness ring/indicator */}
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <span className="text-[9px] text-slate-400 uppercase block font-bold">Efectividad</span>
                      <span className={`text-sm font-extrabold font-sans ${successRate >= 70 ? 'text-emerald-600' : successRate >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                        {successRate}%
                      </span>
                    </div>
                  </div>

                  {/* Audited amount */}
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase block font-bold">Auditadas</span>
                    <span className="text-sm font-extrabold font-sans text-slate-700 block text-center">
                      {summary.total}
                    </span>
                  </div>

                  {/* Toggle arrow */}
                  <div className="text-slate-400 bg-slate-100 p-1 rounded-full">
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-600" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-600" />}
                  </div>
                </div>
              </div>

              {/* Stacked bar color-coded indicator */}
              <div className="h-1.5 w-full bg-slate-100 flex overflow-hidden">
                <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${pctCorrecto}%` }} title={`Correctas: ${summary.correcto}`} />
                <div className="bg-amber-400 h-full transition-all duration-300" style={{ width: `${pctCorreccion}%` }} title={`Con Corrección: ${summary.correccion_requerida}`} />
                <div className="bg-red-500 h-full transition-all duration-300" style={{ width: `${pctNoImp}%` }} title={`No Implementadas: ${summary.no_implementado}`} />
                <div className="bg-slate-300 h-full transition-all duration-300" style={{ width: `${pctPendiente}%` }} title={`Pendientes: ${summary.pendiente}`} />
              </div>

              {/* Collapsed content */}
              {isExpanded && (
                <div className="p-4 bg-slate-50/50 border-t border-slate-200/80 space-y-4">
                  {/* Grid breakdown with state-wise counts */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-150 flex items-center space-x-2 shadow-xs">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase leading-none">Correctas</span>
                        <strong className="text-xs text-emerald-600 font-bold mt-1 block leading-none">{summary.correcto}</strong>
                      </div>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-150 flex items-center space-x-2 shadow-xs">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase leading-none">A corregir</span>
                        <strong className="text-xs text-amber-600 font-bold mt-1 block leading-none">{summary.correccion_requerida}</strong>
                      </div>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-150 flex items-center space-x-2 shadow-xs">
                      <AlertOctagon className="w-4 h-4 text-red-500 shrink-0" />
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase leading-none">No Subidas</span>
                        <strong className="text-xs text-red-600 font-bold mt-1 block leading-none">{summary.no_implementado}</strong>
                      </div>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-150 flex items-center space-x-2 shadow-xs">
                      <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase leading-none">Pendientes</span>
                        <strong className="text-xs text-slate-600 font-bold mt-1 block leading-none">{summary.pendiente}</strong>
                      </div>
                    </div>
                  </div>

                  {/* List of audits within this week */}
                  <div>
                    <h4 className="text-[9px] font-sans font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                      Detalle de Cuentas de la Semana
                    </h4>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto scrollbar-thin">
                      {weekAudits.map(audit => {
                        let dotColor = 'bg-slate-400';
                        if (audit.estado === 'correcto') dotColor = 'bg-emerald-500';
                        else if (audit.estado === 'correccion_requerida') dotColor = 'bg-amber-400';
                        else if (audit.estado === 'no_implementado') dotColor = 'bg-red-500';

                        return (
                          <div 
                            key={audit.id}
                            className="bg-white hover:bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200/60 flex justify-between items-center text-xs group transition-all shadow-xs"
                          >
                            <div className="flex items-center space-x-2.5 min-w-0">
                              <span className={`w-2 h-2 rounded-full ${dotColor} shrink-0`} />
                              <div className="min-w-0">
                                <span className="font-bold text-slate-800 block truncate leading-tight">
                                  {audit.cliente}
                                </span>
                                {audit.cuentaMetaAds && audit.cuentaMetaAds !== audit.cliente && (
                                  <span className="text-[10px] font-mono text-slate-500 block truncate mt-1 leading-none">
                                    {audit.cuentaMetaAds}
                                  </span>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={() => onFocusAudit(audit.id)}
                              className="text-[10px] text-blue-600 hover:text-blue-800 font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap px-2.5 py-1 bg-blue-50 hover:bg-blue-100 rounded-lg cursor-pointer"
                            >
                              Ver en Tabla
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

