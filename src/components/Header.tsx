import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldCheck, Clock } from 'lucide-react';
// @ts-ignore
import papayaLogo from '../assets/images/papaya_logo_1783575599254.jpg';
import { getTodayPeru, formatReadableDate } from '../utils/dateUtils';

interface HeaderProps {
  totalAlerts: number;
}

export default function Header({ totalAlerts }: HeaderProps) {
  // Real current date in Peru's timezone, refreshed periodically so it
  // stays correct even if the app is left open across midnight.
  const [today, setToday] = useState(getTodayPeru());

  useEffect(() => {
    const interval = setInterval(() => setToday(getTodayPeru()), 60_000);
    return () => clearInterval(interval);
  }, []);

  // Agency branding details - Professional Polish theme
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40" id="app-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Brand */}
          <div className="flex items-center space-x-3">
            <img 
              src={papayaLogo} 
              alt="Papaya Logo" 
              className="w-10 h-10 rounded-xl object-cover shadow-sm border border-slate-200"
              referrerPolicy="no-referrer"
            />
            <div>
              <span className="font-sans font-extrabold text-lg tracking-tight text-slate-900 block leading-none uppercase">
                Papaya
              </span>
              <span className="font-sans text-[10px] tracking-wider text-slate-500 font-bold uppercase block mt-1">
                Meta Ads Audit Manager
              </span>
            </div>
          </div>

          {/* Right side: Status and Clock */}
          <div className="flex items-center space-x-4">
            {totalAlerts > 0 && (
              <div 
                className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-100 border border-red-200 text-red-700 animate-pulse"
                title={`${totalAlerts} alertas críticas requieren atención`}
                id="header-alerts-badge"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                <span className="text-xs font-bold font-mono">{totalAlerts} Alertas</span>
              </div>
            )}
            
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-semibold">Auditoría Gráfica de Meta</span>
            </div>

            <div className="flex items-center space-x-1.5 font-mono text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{formatReadableDate(today)}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

