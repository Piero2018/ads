import React from 'react';
import { LayoutGrid, CheckCircle2, AlertCircle, AlertOctagon, HelpCircle } from 'lucide-react';
import { Audit } from '../types';

interface MetricCardsProps {
  audits: Audit[];
}

export default function MetricCards({ audits }: MetricCardsProps) {
  const total = audits.length;
  const correctas = audits.filter(a => a.estado === 'correcto').length;
  const correcciones = audits.filter(a => a.estado === 'correccion_requerida').length;
  const noImplementadas = audits.filter(a => a.estado === 'no_implementado').length;
  const pendientes = audits.filter(a => a.estado === 'pendiente').length;

  const percent = (count: number) => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  const metrics = [
    {
      id: 'metric-total',
      title: 'Total Auditadas',
      value: total,
      subtext: 'Cuentas en el historial',
      icon: LayoutGrid,
      color: 'slate',
      bgClass: 'bg-white border border-slate-200 border-l-4 border-l-slate-400',
      accentClass: 'bg-slate-400',
      textColor: 'text-slate-500',
      iconColor: 'text-slate-400',
      valueClass: 'text-slate-800',
      progress: 100
    },
    {
      id: 'metric-correctas',
      title: 'Correctas',
      value: correctas,
      subtext: `${percent(correctas)}% de efectividad`,
      icon: CheckCircle2,
      color: 'emerald',
      bgClass: 'bg-white border border-slate-200 border-l-4 border-l-emerald-500',
      accentClass: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      iconColor: 'text-emerald-500',
      valueClass: 'text-slate-800',
      progress: percent(correctas)
    },
    {
      id: 'metric-correcciones',
      title: 'Con Correcciones',
      value: correcciones,
      subtext: `${percent(correcciones)}% requiere ajustes`,
      icon: AlertCircle,
      color: 'amber',
      bgClass: 'bg-white border border-slate-200 border-l-4 border-l-amber-400',
      accentClass: 'bg-amber-400',
      textColor: 'text-amber-600',
      iconColor: 'text-amber-500',
      valueClass: 'text-slate-800',
      progress: percent(correcciones)
    },
    {
      id: 'metric-no-implementadas',
      title: 'No Implementadas',
      value: noImplementadas,
      subtext: `${percent(noImplementadas)}% críticas sin subir`,
      icon: AlertOctagon,
      color: 'red',
      bgClass: 'bg-white border border-slate-200 border-l-4 border-l-red-500',
      accentClass: 'bg-red-500',
      textColor: 'text-red-600',
      iconColor: 'text-red-500',
      valueClass: 'text-slate-800',
      progress: percent(noImplementadas)
    },
    {
      id: 'metric-pendientes',
      title: 'Pendientes',
      value: pendientes,
      subtext: `${percent(pendientes)}% en cola de revisión`,
      icon: HelpCircle,
      color: 'slate',
      bgClass: 'bg-white border border-slate-200 border-l-4 border-l-slate-300',
      accentClass: 'bg-slate-300',
      textColor: 'text-slate-400',
      iconColor: 'text-slate-400',
      valueClass: 'text-slate-800',
      progress: percent(pendientes)
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4" id="dashboard-metrics-grid">
      {metrics.map((m) => {
        const Icon = m.icon;
        return (
          <div
            key={m.id}
            id={m.id}
            className={`flex flex-col justify-between p-4 rounded-xl shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${m.bgClass}`}
          >
            <div className="flex justify-between items-start">
              <span className={`text-[10px] font-sans font-bold uppercase tracking-wider block ${m.textColor}`}>
                {m.title}
              </span>
              <Icon className={`w-4 h-4 ${m.iconColor}`} />
            </div>
            
            <div className="mt-3">
              <span className={`text-2xl font-sans font-extrabold block leading-none ${m.valueClass}`}>
                {m.value}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block truncate">
                {m.subtext}
              </span>
            </div>
            
            {/* Progress indicator bar */}
            <div className="w-full bg-slate-100 h-1 rounded-full mt-2.5 overflow-hidden">
              <div 
                className={`h-full ${m.accentClass} rounded-full transition-all duration-500`}
                style={{ width: `${m.progress}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

