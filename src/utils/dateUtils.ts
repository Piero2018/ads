import { Audit, WeeklySummary } from '../types';

// Get today's date (YYYY-MM-DD) in Peru's timezone (America/Lima, UTC-5, no DST)
// This ensures the "current date" is always correct regardless of where the
// server/browser rendering the app is physically located.
export function getTodayPeru(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

// Get the Monday and Sunday of the week for a given date
export function getWeekRange(dateString: string): { start: Date; end: Date } {
  const date = new Date(dateString + 'T00:00:00');
  const day = date.getDay();
  // Adjust so Monday is 0, Tuesday is 1, ..., Sunday is 6
  const diffToMonday = day === 0 ? -6 : 1 - day;
  
  const start = new Date(date);
  start.setDate(date.getDate() + diffToMonday);
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  
  return { start, end };
}

// Format Date object to YYYY-MM-DD
export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Format date to local readable format: DD/MM/YYYY
export function formatReadableDate(dateString: string): string {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateString;
}

// Get readable week label: "Semana del DD/MM al DD/MM (YYYY)"
export function getWeekLabel(dateString: string): string {
  const { start, end } = getWeekRange(dateString);
  const startDay = String(start.getDate()).padStart(2, '0');
  const startMonth = String(start.getMonth() + 1).padStart(2, '0');
  const endDay = String(end.getDate()).padStart(2, '0');
  const endMonth = String(end.getMonth() + 1).padStart(2, '0');
  const year = start.getFullYear();
  
  return `Semana del ${startDay}/${startMonth} al ${endDay}/${endMonth} (${year})`;
}

// Check if a correction has been unresolved for more than 7 days
// Given the audit and today's date (represented by the system's current time)
export function isCorrectionOverdue(audit: Audit, todayStr: string = getTodayPeru()): boolean {
  if (audit.estado !== 'correccion_requerida') return false;
  
  // We use the fechaAuditoria (creation date) or fechaRevision (revision date)
  // Let's use fechaAuditoria as the reference for when the audit occurred
  const auditDate = new Date(audit.fechaAuditoria + 'T00:00:00');
  const today = new Date(todayStr + 'T00:00:00');
  
  const diffTime = today.getTime() - auditDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 7;
}

// Calculate the number of days elapsed since the audit was created
export function getDaysElapsed(auditDateStr: string, todayStr: string = getTodayPeru()): number {
  const auditDate = new Date(auditDateStr + 'T00:00:00');
  const today = new Date(todayStr + 'T00:00:00');
  const diffTime = today.getTime() - auditDate.getTime();
  return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
}

// Group audits by week and generate weekly summaries
export function getWeeklySummaries(audits: Audit[]): { label: string; range: string; summary: WeeklySummary; audits: Audit[] }[] {
  const groups: { [key: string]: { audits: Audit[]; start: Date; end: Date } } = {};
  
  audits.forEach(audit => {
    const { start, end } = getWeekRange(audit.fechaAuditoria);
    const startStr = formatDateISO(start);
    const key = startStr;
    
    if (!groups[key]) {
      groups[key] = {
        audits: [],
        start,
        end
      };
    }
    groups[key].audits.push(audit);
  });
  
  // Sort weeks descending (most recent first)
  const sortedKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a));
  
  return sortedKeys.map(key => {
    const group = groups[key];
    const total = group.audits.length;
    const correcto = group.audits.filter(a => a.estado === 'correcto').length;
    const correccion_requerida = group.audits.filter(a => a.estado === 'correccion_requerida').length;
    const no_implementado = group.audits.filter(a => a.estado === 'no_implementado').length;
    const pendiente = group.audits.filter(a => a.estado === 'pendiente').length;
    
    const startStr = formatDateISO(group.start);
    const endStr = formatDateISO(group.end);
    
    const startDay = String(group.start.getDate()).padStart(2, '0');
    const startMonth = String(group.start.getMonth() + 1).padStart(2, '0');
    const endDay = String(group.end.getDate()).padStart(2, '0');
    const endMonth = String(group.end.getMonth() + 1).padStart(2, '0');
    const label = `Semana del ${startDay}/${startMonth} al ${endDay}/${endMonth}`;
    const range = `${startStr} - ${endStr}`;
    
    return {
      label,
      range,
      audits: group.audits.sort((a, b) => b.fechaAuditoria.localeCompare(a.fechaAuditoria)),
      summary: {
        semanaInicio: startStr,
        semanaFin: endStr,
        total,
        correcto,
        correccion_requerida,
        no_implementado,
        pendiente
      }
    };
  });
}
