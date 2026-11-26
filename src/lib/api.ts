export interface NoticiaResumen {
  id: string;
  titulo: string;
  categoria: string;
  resumen: string;
  portada: string;
  galeria: number;
  autor: string;
  fecha: string;
  destacada: boolean;
  publicada: boolean;
  vistas: number;
}

export interface NoticiaDetalle extends Omit<NoticiaResumen, 'galeria'> {
  contenido: string;
  galeria: string[];
}

export interface Sitio {
  nombre: string;
  lema: string;
  departamento: string;
  heroTitulo: string;
  heroSubtitulo: string;
  alcalde: string;
  cargoAlcalde: string;
  mensajeAlcalde: string;
  direccion: string;
  telefono: string;
  correo: string;
  horario: string;
  facebook: string;
  actualizadoEn: string;
}

export interface MensajeContacto {
  id: string;
  nombre: string;
  correo: string;
  telefono: string;
  asunto: string;
  mensaje: string;
  leido: boolean;
  creadoEn: string;
}

export interface Estadisticas {
  total: number;
  publicadas: number;
  borradores: number;
  destacadas: number;
  vistas: number;
  mensajes: number;
  noLeidos: number;
}

export interface DatosNoticia {
  titulo: string;
  categoria: string;
  resumen: string;
  contenido: string;
  portada: string;
  galeria: string[];
  autor: string;
  fecha: string;
  destacada: boolean;
  publicada: boolean;
}

const TOKEN_KEY = 'spn_admin_token_v1';

export function guardarToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* almacenamiento no disponible */
  }
}

export function leerToken(): string {
  try {
    return localStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export function borrarToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* almacenamiento no disponible */
  }
}

async function pedir<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  const token = leerToken();
  const headers: Record<string, string> = { ...(opciones.headers as Record<string, string>) };
  if (opciones.body) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let respuesta: Response;
  try {
    respuesta = await fetch(`/api${ruta}`, { ...opciones, headers });
  } catch {
    throw new Error('No se pudo conectar con el servidor de la Alcaldía.');
  }

  const texto = await respuesta.text();
  let datos: any = {};
  if (texto) {
    try {
      datos = JSON.parse(texto);
    } catch {
      datos = {};
    }
  }

  if (!respuesta.ok) {
    if (respuesta.status === 401 && token) {
      borrarToken();
    }
    throw new Error(datos.error || `Error del servidor (${respuesta.status}).`);
  }
  return datos as T;
}

export const api = {
  sitio: () => pedir<{ sitio: Sitio; categorias: string[] }>('/sitio'),

  noticias: (params: { categoria?: string; q?: string } = {}) => {
    const qs = new URLSearchParams();
    if (params.categoria && params.categoria !== 'todas') qs.set('categoria', params.categoria);
    if (params.q) qs.set('q', params.q);
    const cola = qs.toString();
    return pedir<{ noticias: NoticiaResumen[]; total: number }>(`/noticias${cola ? `?${cola}` : ''}`);
  },

  noticia: (id: string) => pedir<{ noticia: NoticiaDetalle }>(`/noticias/${encodeURIComponent(id)}`),

  crearNoticia: (datos: DatosNoticia) =>
    pedir<{ noticia: NoticiaDetalle }>('/noticias', { method: 'POST', body: JSON.stringify(datos) }),

  actualizarNoticia: (id: string, datos: DatosNoticia) =>
    pedir<{ noticia: NoticiaDetalle }>(`/noticias/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(datos),
    }),

  eliminarNoticia: (id: string) =>
    pedir<{ ok: boolean }>(`/noticias/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  login: (usuario: string, password: string) =>
    pedir<{ token: string; usuario: string; nombre: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ usuario, password }),
    }),

  sesion: () => pedir<{ usuario: string; nombre: string }>('/auth/sesion'),

  cambiarPassword: (actual: string, nueva: string) =>
    pedir<{ ok: boolean; token: string }>('/auth/password', {
      method: 'POST',
      body: JSON.stringify({ actual, nueva }),
    }),

  contacto: (datos: { nombre: string; correo: string; telefono: string; asunto: string; mensaje: string }) =>
    pedir<{ ok: boolean; mensaje: string }>('/contacto', { method: 'POST', body: JSON.stringify(datos) }),

  mensajes: () => pedir<{ mensajes: MensajeContacto[]; noLeidos: number }>('/mensajes'),

  marcarMensaje: (id: string, leido: boolean) =>
    pedir<{ mensaje: MensajeContacto }>(`/mensajes/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ leido }),
    }),

  eliminarMensaje: (id: string) =>
    pedir<{ ok: boolean }>(`/mensajes/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  guardarSitio: (datos: Partial<Sitio>) =>
    pedir<{ sitio: Sitio }>('/sitio', { method: 'PUT', body: JSON.stringify(datos) }),

  estadisticas: () => pedir<Estadisticas>('/estadisticas'),
};

export function fechaLarga(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return '';
  return fecha.toLocaleDateString('es-NI', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function fechaCorta(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return '';
  return fecha.toLocaleDateString('es-NI', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function fechaHora(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return '';
  return `${fechaCorta(iso)} · ${fecha.toLocaleTimeString('es-NI', { hour: '2-digit', minute: '2-digit' })}`;
}
