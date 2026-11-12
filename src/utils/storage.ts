import { SolicitudPermiso } from '../types.ts';

const STORAGE_KEY = 'spn_solicitudes_permiso_v1';

export const AREAS_MUNICIPALES = [
  'Administración y Finanzas',
  'Talento Humano (RRHH)',
  'Despacho del Alcalde / Vicealcaldía',
  'Secretaría del Concejo Municipal',
  'Servicios Municipales y Aseo Público',
  'Obras Públicas e Infraestructura',
  'Catastro y Urbanismo',
  'Registro del Estado Civil de las Personas',
  'Medio Ambiente y Recursos Naturales',
  'Adquisiciones y Contrataciones',
  'Tecnología e Informática',
  'Seguridad y Vigilancia Municipal',
  'Casa de Cultura y Deportes',
  'Mercado Municipal',
];

export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export function generarFolio(consecutivo: number): string {
  const anio = new Date().getFullYear();
  return `SPN-RH-${anio}-${String(consecutivo).padStart(4, '0')}`;
}

const SOLICITUDES_INICIALES: SolicitudPermiso[] = [
  {
    id: 'sol-001',
    folio: 'SPN-RH-2026-0038',
    fechaCreacion: '2026-11-05T08:30:00.000Z',
    fechaDia: '05',
    fechaMes: '11',
    fechaAnio: '2026',
    nombre: 'Marlon José Aguilera Mendoza',
    cedula: '081-140585-0002A',
    cargo: 'Responsable de Servicios Municipales',
    area: 'Servicios Municipales y Aseo Público',
    diaInicio: '08',
    diaFin: '10',
    mesPermiso: 'Noviembre',
    anioPermiso: '2026',
    totalDias: '3',
    totalHoras: '24',
    tipoPermiso: 'vacaciones',
    otroEspecificar: '',
    motivo: 'Días acumulados de vacaciones por período anual para atención de trámite familiar en Managua.',
    firmaSolicitante: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M10,40 Q50,5 90,35 T170,30" stroke="%231e3a8a" stroke-width="2" fill="none"/></svg>',
    estado: 'aprobado_alcalde',
    observacionesRRHH: 'Cumple con los días reglamentarios disponibles en su saldo de vacaciones 2026. Aprobado.',
    responsableRRHH: 'Lic. Claudia Patricia Gómez - Dir. Talento Humano',
    fechaAprobacion: '2026-11-06T10:15:00.000Z',
  },
  {
    id: 'sol-002',
    folio: 'SPN-RH-2026-0039',
    fechaCreacion: '2026-11-09T09:10:00.000Z',
    fechaDia: '09',
    fechaMes: '11',
    fechaAnio: '2026',
    nombre: 'Esperanza del Socorro Vallecillo',
    cedula: '081-220892-0004C',
    cargo: 'Analista de Registro Civil',
    area: 'Registro del Estado Civil de las Personas',
    diaInicio: '14',
    diaFin: '14',
    mesPermiso: 'Noviembre',
    anioPermiso: '2026',
    totalDias: '1',
    totalHoras: '8',
    tipoPermiso: 'especial',
    otroEspecificar: '',
    motivo: 'Cita médica especializada en el Hospital Departamental de Chinandega (remisión del MINSA).',
    firmaSolicitante: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M15,45 Q40,10 80,40 T150,25" stroke="%231e3a8a" stroke-width="2" fill="none"/></svg>',
    estado: 'aprobado_rrhh',
    observacionesRRHH: 'Presenta constancia previa de cita médica. Permiso especial con goce de salario conforme Ley 476.',
    responsableRRHH: 'Lic. Claudia Patricia Gómez - Dir. Talento Humano',
    fechaAprobacion: '2026-11-10T11:00:00.000Z',
  },
  {
    id: 'sol-003',
    folio: 'SPN-RH-2026-0040',
    fechaCreacion: '2026-11-12T07:45:00.000Z',
    fechaDia: '12',
    fechaMes: '11',
    fechaAnio: '2026',
    nombre: 'Wilmer Antonio Centeno Ramos',
    cedula: '081-050390-0001B',
    cargo: 'Técnico de Campo y Catastro',
    area: 'Catastro y Urbanismo',
    diaInicio: '16',
    diaFin: '17',
    mesPermiso: 'Noviembre',
    anioPermiso: '2026',
    totalDias: '2',
    totalHoras: '16',
    tipoPermiso: 'otro',
    otroEspecificar: 'Capacitación INIFOM',
    motivo: 'Taller de actualización catastral municipal impartido por INIFOM en delegación departamental.',
    firmaSolicitante: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M10,35 Q60,15 110,45 T180,20" stroke="%231e3a8a" stroke-width="2" fill="none"/></svg>',
    estado: 'pendiente',
    observacionesRRHH: 'Pendiente de verificar convocatoria oficial de INIFOM.',
    responsableRRHH: 'Talento Humano',
  }
];

export function getSolicitudes(): SolicitudPermiso[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SOLICITUDES_INICIALES));
      return SOLICITUDES_INICIALES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SOLICITUDES_INICIALES;
  } catch (e) {
    console.error('Error leyendo solicitudes del storage', e);
    return SOLICITUDES_INICIALES;
  }
}

export function saveSolicitud(solicitud: Omit<SolicitudPermiso, 'id' | 'folio' | 'fechaCreacion' | 'estado'>): SolicitudPermiso {
  const current = getSolicitudes();
  const nextNum = current.length + 38 + 1;
  const now = new Date();
  
  const nueva: SolicitudPermiso = {
    ...solicitud,
    id: 'sol-' + Date.now(),
    folio: generarFolio(nextNum),
    fechaCreacion: now.toISOString(),
    estado: 'pendiente',
  };

  const updated = [nueva, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return nueva;
}

export function updateSolicitud(id: string, updates: Partial<SolicitudPermiso>): SolicitudPermiso | null {
  const current = getSolicitudes();
  const index = current.findIndex(s => s.id === id);
  if (index === -1) return null;

  current[index] = { ...current[index], ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  return current[index];
}

export function resetSolicitudes(): SolicitudPermiso[] {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SOLICITUDES_INICIALES));
  return SOLICITUDES_INICIALES;
}

export function exportarCSV(solicitudes: SolicitudPermiso[]): void {
  const headers = [
    'Folio',
    'Fecha Solicitud',
    'Trabajador',
    'Cédula',
    'Cargo',
    'Área',
    'Días Solicitados',
    'Total Días',
    'Total Horas',
    'Tipo de Permiso',
    'Motivo',
    'Estado',
    'Observaciones RRHH'
  ];

  const rows = solicitudes.map(s => [
    `"${s.folio}"`,
    `"${s.fechaDia}/${s.fechaMes}/${s.fechaAnio}"`,
    `"${s.nombre.replace(/"/g, '""')}"`,
    `"${s.cedula}"`,
    `"${s.cargo.replace(/"/g, '""')}"`,
    `"${s.area.replace(/"/g, '""')}"`,
    `"${s.diaInicio} al ${s.diaFin} de ${s.mesPermiso} ${s.anioPermiso}"`,
    `"${s.totalDias}"`,
    `"${s.totalHoras}"`,
    `"${s.tipoPermiso === 'vacaciones' ? 'A cuenta de vacaciones' : s.tipoPermiso === 'especial' ? 'Permiso Especial' : s.otroEspecificar || 'Otro'}"`,
    `"${(s.motivo || '').replace(/"/g, '""')}"`,
    `"${s.estado.toUpperCase()}"`,
    `"${(s.observacionesRRHH || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Permisos_Alcaldia_San_Pedro_del_Norte_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
