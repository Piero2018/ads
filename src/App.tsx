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
  BarChart3,
  LogIn,
  LogOut
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

import { db, auth, AUDITS_COLLECTION } from './firebase';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
} from 'firebase/firestore';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import LoginModal from './components/Login';

export default function App() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [editingAudit, setEditingAudit] = useState<Audit | null>(null);
  const [focusedAuditId, setFocusedAuditId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'table' | 'weekly'>('table');
  
  // Show / Hide Register Form on Mobile
  const [showFormMobile, setShowFormMobile] = useState(false);

  // Success Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Loading state while connecting to Firestore
  const [isLoading, setIsLoading] = useState(true);

  // Auth state: only the logged-in admin can create/edit/delete audits
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const isAdmin = !!user;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth);
    setEditingAudit(null);
    setShowFormMobile(false);
  };

  // Seed Firestore with initial mock data ONLY if the collection is empty
  // (runs once, the first time anyone opens the app with an empty database)
  const seedIfEmpty = async () => {
    const snapshot = await getDocs(collection(db, AUDITS_COLLECTION));
    if (snapshot.empty) {
      await Promise.all(
        INITIAL_AUDITS.map((audit) => setDoc(doc(db, AUDITS_COLLECTION, audit.id), audit))
      );
    }
  };

  // Subscribe in real time to the "audits" collection in Firestore.
  // Every person who opens the app reads/writes the SAME shared data.
  useEffect(() => {
    seedIfEmpty();

    const auditsQuery = query(collection(db, AUDITS_COLLECTION), orderBy('fechaAuditoria', 'desc'));
    const unsubscribe = onSnapshot(
      auditsQuery,
      (snapshot) => {
        const data = snapshot.docs.map((d) => d.data() as Audit);
        setAudits(data);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error al conectar con Firestore:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Trigger Toast helper
  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Save / Update Audit (writes directly to Firestore; onSnapshot updates the UI for everyone)
  const handleSaveAudit = async (auditData: Omit<Audit, 'id'> & { id?: string }) => {
    if (!isAdmin) return;
    try {
      if (auditData.id) {
        // Edit
        await updateDoc(doc(db, AUDITS_COLLECTION, auditData.id), { ...auditData });
        setEditingAudit(null);
        triggerToast(`Auditoría de "${auditData.cliente}" actualizada exitosamente.`);
      } else {
        // Create
        const newId = `aud-${Date.now()}`;
        const newAudit: Audit = { ...auditData, id: newId } as Audit;
        await setDoc(doc(db, AUDITS_COLLECTION, newId), newAudit);
        triggerToast(`Nueva auditoría de "${auditData.cliente}" registrada exitosamente.`);
      }
    } catch (error) {
      console.error('Error al guardar en Firestore:', error);
      triggerToast('Ocurrió un error al guardar. Intenta nuevamente.');
    }
    setShowFormMobile(false);
  };

  // Delete Audit
  const handleDeleteAudit = async (auditId: string) => {
    if (!isAdmin) return;
    const auditToDelete = audits.find(a => a.id === auditId);
    if (!auditToDelete) return;
    
    if (confirm(`¿Está seguro que desea eliminar la auditoría de ${auditToDelete.cliente}?`)) {
      try {
        await deleteDoc(doc(db, AUDITS_COLLECTION, auditId));
        if (editingAudit?.id === auditId) {
          setEditingAudit(null);
        }
        if (focusedAuditId === auditId) {
          setFocusedAuditId(null);
        }
        triggerToast(`Auditoría de "${auditToDelete.cliente}" eliminada.`);
      } catch (error) {
        console.error('Error al eliminar en Firestore:', error);
        triggerToast('Ocurrió un error al eliminar. Intenta nuevamente.');
      }
    }
  };

  // Quick Resolve from Alerts Panel
  const handleQuickResolve = async (auditId: string) => {
    if (!isAdmin) return;
    try {
      await updateDoc(doc(db, AUDITS_COLLECTION, auditId), {
        estado: 'correcto' as AuditStatus,
        tipoError: 'Ninguno',
        descripcion: 'Resuelto rápidamente desde el panel de alertas críticas.'
      });
      triggerToast('¡Implementación marcada como Correcta con éxito!');
    } catch (error) {
      console.error('Error al resolver en Firestore:', error);
      triggerToast('Ocurrió un error. Intenta nuevamente.');
    }
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

          {/* Auth control */}
          <div className="self-start md:self-auto">
            {authChecked && (
              isAdmin ? (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 truncate max-w-[160px]" title={user?.email ?? ''}>
                    {user?.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-3.5 h-3.5 text-slate-400" />
                    <span>Salir</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  title="Iniciar sesión para registrar auditorías"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-400" />
                  <span>Iniciar sesión</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}

      {/* Main Workspace */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6" id="app-workspace">
        
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-slate-400 text-sm font-medium">
            Conectando con la base de datos...
          </div>
        ) : (
        <>
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
                  readOnly={!isAdmin}
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
            
            {isAdmin && (
            <>
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
            </>
            )}

            {/* Active Alerts Panel (Always Visible) */}
            <AlertsPanel 
              audits={audits} 
              onFocusAudit={handleFocusAudit}
              onQuickResolve={handleQuickResolve}
              readOnly={!isAdmin}
            />

          </div>

        </div>
        </>
        )}
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