import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpDown, Edit3, Trash2, Calendar, User, Eye, X, CheckCircle2, AlertCircle, AlertOctagon, HelpCircle } from 'lucide-react';
import { Audit, AuditStatus } from '../types';
import { formatReadableDate, getWeekLabel } from '../utils/dateUtils';
import { RESPONSIBLES } from '../mockData';

interface AuditTableProps {
  audits: Audit[];
  onEdit: (audit: Audit) => void;
  onDelete: (auditId: string) => void;
  focusedAuditId: string | null;
  onClearFocus: () => void;
}

type SortField = 'cliente' | 'cuentaMetaAds' | 'estado' | 'fechaAuditoria' | 'responsable';
type SortOrder = 'asc' | 'desc';

export default function AuditTable({ audits, onEdit, onDelete, focusedAuditId, onClearFocus }: AuditTableProps) {
  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [filterResponsable, setFilterResponsable] = useState<string>('todos');
  const [filterWeek, setFilterWeek] = useState<string>('todos');

  // Sorting states
  const [sortField, setSortField] = useState<SortField>('fechaAuditoria');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Extract unique Clients for reference if needed
  const uniqueClients = useMemo(() => {
    return Array.from(new Set(audits.map(a => a.cliente))).sort();
  }, [audits]);

  // Extract unique Week labels for filtering
  const uniqueWeeks = useMemo(() => {
    const weeksMap = new Map<string, string>(); // startOfWeekISO -> Label
    audits.forEach(audit => {
      const label = getWeekLabel(audit.fechaAuditoria);
      weeksMap.set(label, label);
    });
    return Array.from(weeksMap.values()).sort();
  }, [audits]);

  // Handle Sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc'); // Default to descending for new field
    }
  };

  // Filter and Search Logic
  const filteredAudits = useMemo(() => {
    let result = [...audits];

    // Search query (matches client or account name)
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        a => a.cliente.toLowerCase().includes(term) || 
             a.cuentaMetaAds.toLowerCase().includes(term) ||
             a.tipoError.toLowerCase().includes(term)
      );
    }

    // Filter by state
    if (filterEstado !== 'todos') {
      result = result.filter(a => a.estado === filterEstado);
    }

    // Filter by responsible
    if (filterResponsable !== 'todos') {
      result = result.filter(a => a.responsable === filterResponsable);
    }

    // Filter by week
    if (filterWeek !== 'todos') {
      result = result.filter(a => getWeekLabel(a.fechaAuditoria) === filterWeek);
    }

    // Sorting
    result.sort((a, b) => {
      let valA = a[sortField].toLowerCase();
      let valB = b[sortField].toLowerCase();
      
      if (sortField === 'estado') {
        // Custom order for states if desired, or alphabetical
        valA = a.estado;
        valB = b.estado;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [audits, searchTerm, filterEstado, filterResponsable, filterWeek, sortField, sortOrder]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredAudits.length / itemsPerPage);
  const paginatedAudits = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAudits.slice(start, start + itemsPerPage);
  }, [filteredAudits, currentPage]);

  // Reset page on filter change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterEstado, filterResponsable, filterWeek]);

  // Status Badge Renderer
  const renderStatusBadge = (status: AuditStatus) => {
    switch (status) {
      case 'correcto':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
            Correcto
          </span>
        );
      case 'correccion_requerida':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-850 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Requiere Ajustes
          </span>
        );
      case 'no_implementado':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
            No Implementado
          </span>
        );
      case 'pendiente':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-50 text-slate-600 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            Pendiente
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col" id="audit-table-panel">
      {/* Search and Filters Header */}
      <div className="border-b border-slate-100 pb-5 mb-5">
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
          <div>
            <h2 className="font-sans font-extrabold text-slate-800 text-sm tracking-tight uppercase">
              Historial de Auditorías
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Mostrando <strong className="text-slate-700 font-sans">{filteredAudits.length}</strong> de <strong className="text-slate-700 font-sans">{audits.length}</strong> registros activos
            </p>
          </div>
          
          {/* Active Highlight Banner */}
          {focusedAuditId && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl py-2 px-3.5 flex items-center justify-between text-blue-700 text-xs gap-3 font-semibold shadow-xs">
              <span className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600 animate-bounce" />
                Filtrando cuenta enfocada desde Alerta
              </span>
              <button 
                onClick={onClearFocus}
                className="text-blue-500 hover:text-blue-800 transition-colors cursor-pointer bg-white p-1 rounded-full shadow-xs border border-blue-100"
                title="Quitar filtro de enfoque"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Filters grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-4" id="table-filters-container">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar Cliente / Cuenta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-700 text-xs focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="w-full bg-transparent border-none text-slate-700 text-xs focus:outline-none cursor-pointer font-medium"
            >
              <option value="todos">Todos los Estados</option>
              <option value="correcto">Correcto</option>
              <option value="correccion_requerida">Corrección Requerida</option>
              <option value="no_implementado">No Implementado</option>
              <option value="pendiente">Pendiente</option>
            </select>
          </div>

          {/* Responsible filter */}
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <select
              value={filterResponsable}
              onChange={(e) => setFilterResponsable(e.target.value)}
              className="w-full bg-transparent border-none text-slate-700 text-xs focus:outline-none cursor-pointer font-medium"
            >
              <option value="todos">Todos los Responsables</option>
              {RESPONSIBLES.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
              {/* Capture custom ones that are not in default list */}
              {Array.from(new Set(audits.map(a => a.responsable)))
                .filter(r => !RESPONSIBLES.includes(r))
                .map(r => (
                  <option key={r} value={r}>{r}</option>
                ))
              }
            </select>
          </div>

          {/* Week Filter */}
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <select
              value={filterWeek}
              onChange={(e) => setFilterWeek(e.target.value)}
              className="w-full bg-transparent border-none text-slate-700 text-xs focus:outline-none cursor-pointer font-medium"
            >
              <option value="todos">Todas las Semanas</option>
              {uniqueWeeks.map(w => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="flex-1 overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left border-collapse" id="audits-data-table">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
              <th className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('cliente')}>
                <div className="flex items-center gap-1">
                  Cliente / Cuenta Meta
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('estado')}>
                <div className="flex items-center gap-1">
                  Estado
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4">Error / Hallazgo</th>
              <th className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('fechaAuditoria')}>
                <div className="flex items-center gap-1">
                  Fecha Auditoría
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('responsable')}>
                <div className="flex items-center gap-1">
                  Responsable
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 text-sm font-sans bg-white">
            {paginatedAudits.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400 text-xs font-semibold">
                  No se encontraron auditorías con los criterios de búsqueda especificados.
                </td>
              </tr>
            ) : (
              paginatedAudits.map((a) => {
                const isFocused = focusedAuditId === a.id;
                return (
                  <tr 
                    key={a.id} 
                    id={`row-${a.id}`}
                    className={`transition-all hover:bg-slate-50/50 ${isFocused ? 'bg-blue-50/50 border-l-4 border-l-blue-600 font-semibold' : ''}`}
                  >
                    <td className="py-3.5 px-4 max-w-[220px]">
                      <span className="font-bold text-slate-800 block truncate leading-tight">{a.cliente}</span>
                      {a.cuentaMetaAds && a.cuentaMetaAds !== a.cliente && (
                        <span className="text-[11px] font-mono text-slate-500 block truncate mt-0.5">{a.cuentaMetaAds}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {renderStatusBadge(a.estado)}
                    </td>
                    <td className="py-3.5 px-4 max-w-[280px]">
                      {a.estado === 'correcto' ? (
                        <span className="text-xs text-slate-400 italic font-medium">Sin errores gráficos detectados</span>
                      ) : (
                        <div>
                          <span className="font-bold text-slate-800 block text-xs truncate max-w-[220px]" title={a.tipoError}>
                            {a.tipoError}
                          </span>
                          <span className="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-relaxed" title={a.descripcion}>
                            {a.descripcion}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs text-slate-500">
                      <div>
                        <span className="block text-slate-700 font-semibold">{formatReadableDate(a.fechaAuditoria)}</span>
                        <span className="text-[10px] text-slate-400">Rev: {formatReadableDate(a.fechaRevision)}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                        {a.responsable}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => onEdit(a)}
                          className="p-1.5 hover:bg-slate-100 rounded-xl text-blue-600 hover:text-blue-800 transition-colors cursor-pointer border border-transparent hover:border-slate-200 bg-slate-50/50"
                          title="Editar registro"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(a.id)}
                          className="p-1.5 hover:bg-red-50 rounded-xl text-red-600 hover:text-red-800 transition-colors cursor-pointer border border-transparent hover:border-red-100 bg-red-50/30"
                          title="Eliminar registro"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-4" id="table-pagination">
          <span className="text-xs text-slate-400 font-bold font-sans">
            Página <strong className="text-slate-700">{currentPage}</strong> de <strong className="text-slate-700">{totalPages}</strong>
          </span>
          <div className="flex space-x-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs text-slate-700 font-bold cursor-pointer transition-colors"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs text-slate-700 font-bold cursor-pointer transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

