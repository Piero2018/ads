import React, { useState, useEffect } from 'react';
import { PlusCircle, Save, Undo, RefreshCw, AlertCircle } from 'lucide-react';
import { Audit, AuditStatus } from '../types';
import { ERROR_TYPES, RESPONSIBLES } from '../mockData';
import { getTodayPeru } from '../utils/dateUtils';

interface AuditFormProps {
  onSave: (audit: Omit<Audit, 'id'> & { id?: string }) => void;
  editingAudit?: Audit | null;
  onCancelEdit?: () => void;
}

export default function AuditForm({ onSave, editingAudit, onCancelEdit }: AuditFormProps) {
  // Current date in system context: 2026-07-08
  const TODAY = getTodayPeru();

  const [cliente, setCliente] = useState('');
  const [cuentaMetaAds, setCuentaMetaAds] = useState('');
  const [estado, setEstado] = useState<AuditStatus>('pendiente');
  const [tipoError, setTipoError] = useState('');
  const [customError, setCustomError] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaRevision, setFechaRevision] = useState(TODAY);
  const [fechaAuditoria, setFechaAuditoria] = useState(TODAY);
  const [responsable, setResponsable] = useState('');
  const [customResponsable, setCustomResponsable] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Pre-fill if editing
  useEffect(() => {
    if (editingAudit) {
      setCliente(editingAudit.cliente);
      setCuentaMetaAds(editingAudit.cuentaMetaAds);
      setEstado(editingAudit.estado);
      
      if (ERROR_TYPES.includes(editingAudit.tipoError)) {
        setTipoError(editingAudit.tipoError);
        setCustomError('');
      } else {
        setTipoError('custom');
        setCustomError(editingAudit.tipoError);
      }

      setDescripcion(editingAudit.descripcion);
      setFechaRevision(editingAudit.fechaRevision);
      setFechaAuditoria(editingAudit.fechaAuditoria);

      if (RESPONSIBLES.includes(editingAudit.responsable)) {
        setResponsable(editingAudit.responsable);
        setCustomResponsable('');
      } else {
        setResponsable('custom');
        setCustomResponsable(editingAudit.responsable);
      }
      setErrorMsg('');
    } else {
      resetForm();
    }
  }, [editingAudit]);

  // If status is "correcto", force tipoError to "Ninguno"
  useEffect(() => {
    if (estado === 'correcto') {
      setTipoError('Ninguno');
    } else if (tipoError === 'Ninguno' && estado !== 'correcto') {
      setTipoError('');
    }
  }, [estado]);

  const resetForm = () => {
    setCliente('');
    setCuentaMetaAds('');
    setEstado('pendiente');
    setTipoError('');
    setCustomError('');
    setDescripcion('');
    setFechaRevision(TODAY);
    setFechaAuditoria(TODAY); // Automatic audit date
    setResponsable('');
    setCustomResponsable('');
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!cliente.trim()) {
      setErrorMsg('El nombre del cliente o cuenta es obligatorio.');
      return;
    }
    if (!estado) {
      setErrorMsg('Debe seleccionar un estado.');
      return;
    }

    const selectedError = tipoError === 'custom' ? customError.trim() : tipoError;
    if (!selectedError) {
      setErrorMsg('Seleccione un tipo de error o ingrese uno personalizado.');
      return;
    }

    const selectedResponsable = responsable === 'custom' ? customResponsable.trim() : responsable;
    if (!selectedResponsable) {
      setErrorMsg('Debe designar un responsable para la auditoría.');
      return;
    }

    onSave({
      id: editingAudit?.id,
      cliente: cliente.trim(),
      cuentaMetaAds: cliente.trim(),
      estado,
      tipoError: selectedError,
      descripcion: descripcion.trim() || 'Sin descripción detallada.',
      fechaRevision,
      fechaAuditoria, // Automáticamente asignada al registrarse
      responsable: selectedResponsable,
    });

    if (!editingAudit) {
      resetForm();
    }
  };

  return (
    <div 
      className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative"
      id="audit-form-container"
    >
      <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-5">
        <h2 className="font-sans font-bold text-slate-800 text-xs tracking-wider uppercase flex items-center gap-2">
          {editingAudit ? (
            <>
              <RefreshCw className="w-4.5 h-4.5 text-blue-600" />
              Editar Registro de Auditoría
            </>
          ) : (
            <>
              <PlusCircle className="w-4.5 h-4.5 text-blue-600" />
              Registrar Nueva Auditoría
            </>
          )}
        </h2>
        {editingAudit && onCancelEdit && (
          <button
            onClick={onCancelEdit}
            className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors cursor-pointer"
          >
            <Undo className="w-3.5 h-3.5" />
            Cancelar Edición
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-red-700 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" id="audit-form">
        {/* Cliente & Cuenta */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
            Cliente / Cuenta Meta Ads
          </label>
          <input
            type="text"
            placeholder="Ej. EcoGlow Cosmética"
            value={cliente}
            onChange={(e) => {
              setCliente(e.target.value);
              setCuentaMetaAds(e.target.value);
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 text-sm focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400 shadow-xs"
            required
          />
        </div>

        {/* Estado & Responsable */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
              Estado de la Implementación
            </label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value as AuditStatus)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-sm focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
            >
              <option value="correcto">Correcto (Verde)</option>
              <option value="correccion_requerida">Corrección Requerida (Amarillo)</option>
              <option value="no_implementado">No Implementado (Rojo)</option>
              <option value="pendiente">Pendiente (Gris)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
              Responsable de la Cuenta
            </label>
            <select
              value={responsable}
              onChange={(e) => setResponsable(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-sm focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
              required
            >
              <option value="" disabled>Seleccione Responsable...</option>
              {RESPONSIBLES.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
              <option value="custom">+ Agregar Nuevo Responsable...</option>
            </select>
            {responsable === 'custom' && (
              <input
                type="text"
                placeholder="Nombre del nuevo responsable"
                value={customResponsable}
                onChange={(e) => setCustomResponsable(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-sm focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 mt-2 transition-all"
                required
              />
            )}
          </div>
        </div>

        {/* Error Type Selection */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
            Tipo de Error gráfico
          </label>
          <select
            value={tipoError}
            disabled={estado === 'correcto'}
            onChange={(e) => setTipoError(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-sm focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            required
          >
            {estado === 'correcto' ? (
              <option value="Ninguno">Ninguno</option>
            ) : (
              <>
                <option value="" disabled>Seleccione una categoría de error...</option>
                {ERROR_TYPES.filter(t => t !== 'Ninguno').map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
                <option value="custom">+ Otro error personalizado...</option>
              </>
            )}
          </select>

          {tipoError === 'custom' && estado !== 'correcto' && (
            <input
              type="text"
              placeholder="Describa brevemente la categoría del error"
              value={customError}
              onChange={(e) => setCustomError(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-sm focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 mt-2 transition-all"
              required
            />
          )}
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
            Descripción Detallada
          </label>
          <textarea
            placeholder="Ingrese los detalles de la auditoría o especificaciones de las correcciones gráficas requeridas..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-sm focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none placeholder:text-slate-400"
          />
        </div>

        {/* Fecha */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
            Fecha de Auditoría / Revisión
          </label>
          <input
            type="date"
            value={fechaAuditoria}
            onChange={(e) => {
              setFechaAuditoria(e.target.value);
              setFechaRevision(e.target.value);
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 text-sm focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            required
          />
        </div>

        {/* Actions */}
        <div className="pt-3 flex gap-3">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm hover:shadow active:scale-98"
          >
            <Save className="w-4 h-4" />
            {editingAudit ? 'Guardar Cambios' : 'Registrar Auditoría'}
          </button>
          
          <button
            type="button"
            onClick={resetForm}
            className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl cursor-pointer transition-colors"
          >
            Limpiar
          </button>
        </div>
      </form>
    </div>
  );
}

