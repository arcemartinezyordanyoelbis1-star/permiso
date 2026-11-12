export type TipoPermiso = 'vacaciones' | 'especial' | 'otro';

export type EstadoSolicitud = 'pendiente' | 'aprobado_rrhh' | 'aprobado_alcalde' | 'rechazado';

export interface SolicitudPermiso {
  id: string;
  folio: string;
  fechaCreacion: string; // ISO string
  fechaDia: string;
  fechaMes: string;
  fechaAnio: string;
  
  // Datos del trabajador
  nombre: string;
  cedula: string;
  cargo: string;
  area: string;

  // Fechas del permiso
  diaInicio: string;
  diaFin: string;
  mesPermiso: string;
  anioPermiso: string;
  totalDias: string;
  totalHoras: string;

  // Tipo y motivo
  tipoPermiso: TipoPermiso;
  otroEspecificar?: string;
  motivo?: string;

  // Firma del solicitante en base64
  firmaSolicitante: string;

  // Gestión de Talento Humano
  estado: EstadoSolicitud;
  observacionesRRHH?: string;
  firmaRRHH?: string; // base64 de firma o sello
  firmaAlcalde?: string; // base64 de firma o sello
  fechaAprobacion?: string;
  responsableRRHH?: string;
}

export interface AreaMunicipal {
  id: string;
  nombre: string;
}
