export type AuditStatus = 'correcto' | 'correccion_requerida' | 'no_implementado' | 'pendiente';

export interface Audit {
  id: string;
  cliente: string;
  cuentaMetaAds: string;
  estado: AuditStatus;
  tipoError: string;
  descripcion: string;
  fechaRevision: string; // YYYY-MM-DD
  fechaAuditoria: string; // YYYY-MM-DD (fecha automática)
  responsable: string;
}

export interface WeeklySummary {
  semanaInicio: string; // YYYY-MM-DD
  semanaFin: string; // YYYY-MM-DD
  total: number;
  correcto: number;
  correccion_requerida: number;
  no_implementado: number;
  pendiente: number;
}
