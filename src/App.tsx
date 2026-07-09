import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileSpreadsheet, 
  Plus, 
  X,
  Sparkles,
  CheckCircle,
  TrendingUp,
  Layout,
  Table,
  BarChart3
} from 'lucide-react';

import Header from './components/Header';
import MetricCards from './components/MetricCards';
import AlertsPanel from './components/AlertsPanel';
import AuditForm from './components/AuditForm';
import AuditTable from './components/AuditTable';
import WeeklySummaryPanel from './components/WeeklySummaryPanel';

import { Audit, AuditStatus } from './types';
import { INITIAL_AUDITS } from './mockData';
import { isCorrectionOverdue } from './utils/dateUtils';

export default function App() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [editingAudit, setEditingAudit] = useState<Audit | null>(null);
  const [focusedAuditId, setFocusedAuditId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'table' | 'weekly'>('table');
  
  // Show / Hide Register Form on Mobile
  const [showFormMobile, setShowFormMobile] = useState(false);

  // Success Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('meta_ads_audits');
    if (saved) {
      try {
        setAudits(JSON.parse(saved));
      } catch (e) {
        setAudits(INITIAL_AUDITS);
      }
    } else {
      setAudits(INITIAL_AUDITS);
      localStorage.setItem('meta_ads_audits', JSON.stringify(INITIAL_AUDITS));
    }
  }, []);

  // Save to LocalStorage helper
  const saveAudits = (updatedAudits: Audit[]) => {
    setAudits(updatedAudits);
    localStorage.setItem('meta_ads_audits', JSON.stringify(updatedAudits));
  };

  // Trigger Toast helper
  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Save / Update Audit
  const handleSaveAudit = (auditData: Omit<Audit, 'id'> & { id?: string }) => {
    if (auditData.id) {
      // Edit
      const updated = audits.map(a => 
        a.id === auditData.id ? { ...a, ...auditData } as Audit : a
      );
      saveAudits(updated);
      setEditingAudit(null);
      triggerToast(`Auditoría de "${auditData.cliente}" actualizada exitosamente.`);
    } else {
      // Create
      const newAudit: Audit = {
        ...auditData,
        id: `aud-${Date.now()}`
      } as Audit;
      saveAudits([newAudit, ...audits]);
      triggerToast(`Nueva auditoría de "${auditData.cliente}" registrada exitosamente.`);
    }
    setShowFormMobile(false);
  };

  // Delete Audit
  const handleDeleteAudit = (auditId: string) => {
    const auditToDelete = audits.find(a => a.id === auditId);
    if (!auditToDelete) return;
    
    if (confirm(`¿Está seguro que desea eliminar la auditoría de ${auditToDelete.cliente}?`)) {
      const updated = audits.filter(a => a.id !== auditId);
      saveAudits(updated);
      if (editingAudit?.id === auditId) {
        setEditingAudit(null);
      }
      if (focusedAuditId === auditId) {
        setFocusedAuditId(null);
      }
      triggerToast(`Auditoría de "${auditToDelete.cliente}" eliminada.`);
    }
  };

  // Quick Resolve from Alerts Panel
  const handleQuickResolve = (auditId: string) => {
    const updated = audits.map(a => {
      if (a.id === auditId) {
        return {
          ...a,
          estado: 'correcto' as AuditStatus,
          tipoError: 'Ninguno',
          descripcion: 'Resuelto rápidamente desde el panel de alertas críticas.'
        };
      }
      return a;
    });
    saveAudits(updated);
    triggerToast('¡Implementación marcada como Correcta con éxito!');
  };

  // Focus specific audit
  const handleFocusAudit = (auditId: string) => {
    setFocusedAuditId(auditId);
    setActiveTab('table');
    
    // Smooth scroll to the table
    setTimeout(() => {
      const element = document.getElementById(`row-${auditId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  // Clear focused alert filter
  const handleClearFocus = () => {
    setFocusedAuditId(null);
  };

  // Total active alerts calculation for header indicator
  const totalAlerts = audits.filter(a => a.estado === 'no_implementado' || isCorrectionOverdue(a)).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans" id="app-root">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            id="toast-notification"
            className="fixed top-20 right-4 z-50 bg-white border border-slate-200 text-slate-800 px-4 py-3 rounded-xl shadow-lg flex items-center space-x-3 max-w-sm"
          >
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 animate-bounce" />
            <span className="text-xs font-bold leading-relaxed">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <Header totalAlerts={totalAlerts} />

      {/* Hero Agency Banner */}
      <div className="bg-white border-b border-slate-200 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 font-sans">Consola de Control de Tráfico</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-sans font-extrabold text-slate-900 tracking-tight mt-1">
              Meta Ads Audit Manager
            </h1>
            <p className="text-xs text-slate-500 mt-2 max-w-2xl leading-relaxed">
              Auditorías de implementación de creativos, formatos y copys para campañas publicitarias. 
              Mantén el control de la calidad gráfica, evita que las campañas corran con formatos incorrectos o errores de diseño.
            </p>
          </div>

        </div>
      </div>

      {/* Main Workspace */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6" id="app-workspace">
        
        {/* Metric cards displaying total status counts */}
        <MetricCards audits={audits} />

        {/* Dynamic Layout: Two Column Grid on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT SIDE: Active audits table, searches, filters, weekly accordion */}
          <div className="lg:col-span-2 space-y-6 flex flex-col">
            
            {/* View selectors (Tabs) */}
            <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex w-full">
              <button
                onClick={() => { setActiveTab('table'); handleClearFocus(); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-bold cursor-pointer transition-all ${activeTab === 'table' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <Table className="w-4 h-4" />
                <span>Historial & Auditorías</span>
              </button>
              
              <button
                onClick={() => { setActiveTab('weekly'); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-bold cursor-pointer transition-all ${activeTab === 'weekly' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Resumen Semanal</span>
              </button>
            </div>

            {/* Render selected view */}
            <div className="flex-1">
              {activeTab === 'table' ? (
                <AuditTable 
                  audits={focusedAuditId ? audits.filter(a => a.id === focusedAuditId) : audits} 
                  onEdit={(audit) => {
                    setEditingAudit(audit);
                    setShowFormMobile(true);
                    // Scroll to form on mobile
                    window.scrollTo({ top: document.getElementById('audit-form-container')?.offsetTop, behavior: 'smooth' });
                  }} 
                  onDelete={handleDeleteAudit}
                  focusedAuditId={focusedAuditId}
                  onClearFocus={handleClearFocus}
                />
              ) : (
                <WeeklySummaryPanel 
                  audits={audits} 
                  onFocusAudit={handleFocusAudit}
                />
              )}
            </div>
          </div>

          {/* RIGHT SIDE: Alerts and Register/Edit Forms */}
          <div className="space-y-6 lg:col-span-1">
            
            {/* Form Drawer Toggle on Mobile / Always visible on Desktop */}
            <div className="lg:hidden flex justify-end">
              <button
                onClick={() => {
                  if (editingAudit) setEditingAudit(null);
                  setShowFormMobile(!showFormMobile);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-98"
              >
                {showFormMobile ? (
                  <>
                    <X className="w-4 h-4" />
                    <span>Cerrar Formulario</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Registrar Auditoría</span>
                  </>
                )}
              </button>
            </div>

            {/* Audit Form Container */}
            <div className={`${showFormMobile ? 'block' : 'hidden lg:block'}`}>
              <AuditForm 
                onSave={handleSaveAudit} 
                editingAudit={editingAudit}
                onCancelEdit={() => {
                  setEditingAudit(null);
                  setShowFormMobile(false);
                }}
              />
            </div>

            {/* Active Alerts Panel (Always Visible) */}
            <AlertsPanel 
              audits={audits} 
              onFocusAudit={handleFocusAudit}
              onQuickResolve={handleQuickResolve}
            />

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-sans font-medium">&copy; 2026 Papaya Agency. Todos los derechos reservados.</span>
          <div className="flex items-center space-x-4">
            <span className="font-mono text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-150 font-bold">
              Versión 1.2.0
            </span>
            <span className="text-slate-300">|</span>
            <span className="font-sans font-bold uppercase text-[10px] tracking-wider text-slate-400">Meta Business Partner Solutions</span>
          </div>
        </div>
      </footer>
    </div>
  );
}