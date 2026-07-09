import { Audit } from './types';

export const INITIAL_AUDITS: Audit[] = [
  {
    id: 'aud-1',
    cliente: 'EcoGlow Cosmética',
    cuentaMetaAds: 'EcoGlow - Conversiones Latam',
    estado: 'correccion_requerida',
    tipoError: 'Formato incorrecto (Aspect Ratio)',
    descripcion: 'Las piezas gráficas de Stories se subieron en formato 1:1 en lugar de 9:16, dejando franjas negras arriba y abajo.',
    fechaRevision: '2026-06-25',
    fechaAuditoria: '2026-06-25', // More than 7 days ago, will trigger the overdue correction alert
    responsable: 'Fiorella'
  },
  {
    id: 'aud-2',
    cliente: 'Apex Fitness',
    cuentaMetaAds: 'Apex Fitness - Retargeting Tráfico',
    estado: 'correcto',
    tipoError: 'Ninguno',
    descripcion: 'Todas las piezas de carrusel implementadas correctamente con los textos alternativos optimizados y links correctos.',
    fechaRevision: '2026-07-07',
    fechaAuditoria: '2026-07-07',
    responsable: 'Alvaro'
  },
  {
    id: 'aud-3',
    cliente: 'Sabor y Origen',
    cuentaMetaAds: 'Sabor y Origen - Tráfico Web',
    estado: 'no_implementado',
    tipoError: 'Falta de material gráfico',
    descripcion: 'Los banners del sorteo mensual no han sido cargados en la campaña activa. El grupo de anuncios está pausado.',
    fechaRevision: '2026-07-06',
    fechaAuditoria: '2026-07-06', // Will trigger "no implementado" alert
    responsable: 'Gise'
  },
  {
    id: 'aud-4',
    cliente: 'TechNova Solutions',
    cuentaMetaAds: 'TechNova - Leads B2B',
    estado: 'pendiente',
    tipoError: 'Revisión técnica pendiente',
    descripcion: 'Diseño enviado a aprobación del cliente. Esperando confirmación para proceder con la auditoría técnica de copys.',
    fechaRevision: '2026-07-08',
    fechaAuditoria: '2026-07-08',
    responsable: 'Fiorella'
  },
  {
    id: 'aud-5',
    cliente: 'Inmobiliaria Futura',
    cuentaMetaAds: 'InmoFutura - Captación de Clientes',
    estado: 'correcto',
    tipoError: 'Ninguno',
    descripcion: 'Los videos 9:16 para Reels se implementaron exitosamente. Buena calidad de renderizado y subtítulos visibles.',
    fechaRevision: '2026-07-04',
    fechaAuditoria: '2026-07-04',
    responsable: 'Ale'
  },
  {
    id: 'aud-6',
    cliente: 'Clínica Dentalis',
    cuentaMetaAds: 'Dentalis - Tráfico Local',
    estado: 'correccion_requerida',
    tipoError: 'Texto de imagen excesivo (>20%)',
    descripcion: 'La imagen principal contiene demasiado texto promocional, lo que podría limitar el alcance de entrega en Meta.',
    fechaRevision: '2026-07-05',
    fechaAuditoria: '2026-07-05', // 3 days ago (not overdue yet)
    responsable: 'Alvaro'
  },
  {
    id: 'aud-7',
    cliente: 'Zapatos Pasos',
    cuentaMetaAds: 'Pasos - E-commerce Catálogo',
    estado: 'correcto',
    tipoError: 'Ninguno',
    descripcion: 'Colección de invierno con feed dinámico de productos implementado con marcos personalizados de marca.',
    fechaRevision: '2026-06-29',
    fechaAuditoria: '2026-06-29',
    responsable: 'Gise'
  },
  {
    id: 'aud-8',
    cliente: 'EcoGlow Cosmética',
    cuentaMetaAds: 'EcoGlow - Branding',
    estado: 'no_implementado',
    tipoError: 'Error de copia/diseño',
    descripcion: 'La campaña de branding no tiene activos los nuevos anuncios de video interactivos debido a una falla en el formato de exportación.',
    fechaRevision: '2026-06-28',
    fechaAuditoria: '2026-06-28', // Will trigger "no implementado" alert
    responsable: 'Ale'
  },
  {
    id: 'aud-9',
    cliente: 'Gourmet Express',
    cuentaMetaAds: 'Gourmet - Delivery Semanal',
    estado: 'correcto',
    tipoError: 'Ninguno',
    descripcion: 'Implementación gráfica exitosa en el carrusel de platos destacados. Botón de comprar enlazado correctamente.',
    fechaRevision: '2026-06-20',
    fechaAuditoria: '2026-06-20',
    responsable: 'Fiorella'
  }
];

export const ERROR_TYPES = [
  'Formato incorrecto (Aspect Ratio)',
  'Falta de material gráfico',
  'Texto de imagen excesivo (>20%)',
  'Error de enlace/URL rota',
  'Llamado a la acción (CTA) ausente',
  'Contraste de colores deficiente',
  'Logotipo cortado o poco visible',
  'Información desactualizada en el copy',
  'Tipografía ilegible en móviles',
  'Revisión técnica pendiente',
  'Ninguno',
  'Otro error gráfico'
];

export const RESPONSIBLES = [
  'Fiorella',
  'Alvaro',
  'Gise',
  'Ale'
];
