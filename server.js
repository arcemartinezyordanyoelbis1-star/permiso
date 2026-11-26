/**
 * Servidor institucional — Alcaldía Municipal de San Pedro del Norte
 * API de noticias + autenticación de administrador + sitio público (dist).
 */
import express from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const DIST_DIR = path.join(__dirname, 'dist');

const PORT = Number(process.env.PORT) || 3000;
const ADMIN_USER = (process.env.ADMIN_USER || 'administrador').trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const SESSION_HOURS = 12;
const MAX_IMAGE_CHARS = 4_200_000; // ~3 MB por imagen
const MAX_GALERIA = 8;

/* ------------------------------------------------------------------ */
/* Almacenamiento                                                      */
/* ------------------------------------------------------------------ */

const CATEGORIAS = [
  'Obras Públicas',
  'Comunicados',
  'Desarrollo Social',
  'Medio Ambiente',
  'Eventos',
  'Servicios Municipales',
  'Salud',
  'Cultura y Deportes',
];

function svgCover(etiqueta, c1, c2) {
  const safe = String(etiqueta)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="1200" height="675" fill="url(#g)"/><circle cx="1040" cy="90" r="260" fill="#ffffff" opacity="0.09"/><circle cx="150" cy="640" r="200" fill="#ffffff" opacity="0.07"/><path d="M0 470 Q300 400 600 470 T1200 450 L1200 675 L0 675 Z" fill="#000000" opacity="0.16"/><g fill="#ffffff" opacity="0.9"><rect x="80" y="70" width="86" height="8" rx="4"/><rect x="80" y="96" width="150" height="8" rx="4" opacity="0.55"/></g><text x="80" y="560" font-family="Georgia, 'Times New Roman', serif" font-size="62" font-weight="700" fill="#ffffff">${safe}</text><text x="80" y="608" font-family="Helvetica, Arial, sans-serif" font-size="26" letter-spacing="4" fill="#ffffff" opacity="0.75">ALCALDÍA DE SAN PEDRO DEL NORTE</text></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

const SITIO_INICIAL = {
  nombre: 'Alcaldía Municipal de San Pedro del Norte',
  lema: 'Somos Pueblo Que Vence',
  departamento: 'Chinandega, Nicaragua',
  heroTitulo: 'Trabajamos por un San Pedro del Norte próspero y seguro',
  heroSubtitulo:
    'Portal oficial de noticias, trámites y servicios de la Alcaldía Municipal. Transparencia, cercanía y resultados para todas las familias del municipio.',
  alcalde: 'Lic. José Ramón Centeno López',
  cargoAlcalde: 'Alcalde Municipal',
  mensajeAlcalde:
    'Con el compromiso de servir a nuestra gente, en la Alcaldía de San Pedro del Norte trabajamos cada día para llevar obras, servicios y oportunidades a cada comarca y barrio del municipio. Este portal es un canal directo de información y transparencia: aquí encontrará nuestras noticias, convocatorias y avances de gestión. La puerta de la Alcaldía está abierta para todas y todos.',
  direccion: 'Costado Sur del Parque Municipal, San Pedro del Norte, Chinandega',
  telefono: '+505 2345 6789',
  correo: 'info@alcaldiasanpedrodelnorte.gob.ni',
  horario: 'Lunes a viernes, 8:00 a.m. — 5:00 p.m.',
  facebook: 'https://www.facebook.com/',
  actualizadoEn: new Date().toISOString(),
};

function seedNoticias() {
  const ahora = Date.now();
  const dia = 86_400_000;
  const base = [
    {
      titulo: 'Inauguran nuevo parque central con áreas de recreación para las familias',
      categoria: 'Obras Públicas',
      resumen:
        'La Alcaldía entregó a la población la remodelación completa del parque central, con nuevas áreas verdes, iluminación LED y espacio de juegos infantiles.',
      contenido:
        'La Alcaldía Municipal de San Pedro del Norte inauguró la remodelación integral del parque central del municipio, una obra esperada por años por las familias sampedreñas.\n\nEl proyecto incluyó la rehabilitación de andenes, la instalación de iluminación LED de bajo consumo, la siembra de áreas verdes, bancas, basureros y un espacio seguro de juegos infantiles. También se mejoró el sistema de drenaje pluvial para evitar inundaciones en la temporada de invierno.\n\nDurante el acto inaugural, las autoridades municipales destacaron que la obra se ejecutó con fondos de inversión municipal y con la participación de las comisiones ciudadanas que acompañaron el diseño del proyecto.\n\n"Este parque es de todas las familias. Cuidémoslo juntos", expresó el alcalde municipal al entregar oficialmente el espacio a la comunidad.',
      portada: svgCover('Nuevo parque central', '#0f3d6e', '#1c7a5e'),
      destacada: true,
      publicada: true,
      autor: 'Oficina de Comunicación',
      fecha: new Date(ahora - 2 * dia).toISOString(),
      vistas: 428,
    },
    {
      titulo: 'Entregan títulos de propiedad a 120 familias de las comarcas del norte',
      categoria: 'Desarrollo Social',
      resumen:
        'Con el acompañamiento de la Procuraduría General de la República, familias de cinco comarcas recibieron su título de propiedad legalmente inscrito.',
      contenido:
        'Un total de 120 familias de las comarcas del norte del municipio recibieron sus títulos de propiedad, documento que les da seguridad jurídica sobre sus viviendas y terrenos.\n\nEl proceso fue acompañado por la Alcaldía Municipal, la Procuraduría General de la República y los gabinetes de la familia y la comunidad, que realizaron la medición y verificación de cada predio.\n\nLas autoridades explicaron que la entrega de títulos permite a las familias acceder a créditos, programas de vivienda y proyectos productivos, además de garantizar la permanencia de sus hogares.\n\nEl acto se realizó en la cancha municipal con la presencia de líderes comunitarios y beneficiarios de las comarcas El Zapote, Santa Rosa, Los Limones, El Jícaro y La Montaña.',
      portada: svgCover('Títulos de propiedad', '#0b3a5c', '#c8963e'),
      destacada: true,
      publicada: true,
      autor: 'Oficina de Comunicación',
      fecha: new Date(ahora - 6 * dia).toISOString(),
      vistas: 312,
    },
    {
      titulo: 'Jornada de reforestación y limpieza en la cuenca del río',
      categoria: 'Medio Ambiente',
      resumen:
        'Más de 300 jóvenes y brigadistas sembraron 2,500 árboles y recolectaron residuos sólidos en las riberas del río del municipio.',
      contenido:
        'La Alcaldía Municipal, junto al Movimiento Ambiental Municipal y la brigada ecológica de los institutos de secundaria, realizó una jornada de reforestación y limpieza en la cuenca del río.\n\nDurante la actividad se sembraron 2,500 árboles de especies nativas como cedro, caoba y madroño, y se recolectaron más de tres toneladas de residuos sólidos.\n\nLa dirección de Medio Ambiente informó que se dará seguimiento al crecimiento de los árboles sembrados durante los próximos dos años, con el apoyo de las escuelas rurales del municipio.\n\nLa jornada forma parte del plan municipal de adaptación al cambio climático y de protección de las fuentes de agua para consumo humano.',
      portada: svgCover('Reforestación', '#14532d', '#2f855a'),
      destacada: false,
      publicada: true,
      autor: 'Dirección de Medio Ambiente',
      fecha: new Date(ahora - 11 * dia).toISOString(),
      vistas: 187,
    },
    {
      titulo: 'Comunicado: calendario de pago del impuesto de matrícula municipal',
      categoria: 'Comunicados',
      resumen:
        'La Dirección de Recaudación informa a los contribuyentes las fechas, oficinas y formas de pago disponibles para el período fiscal en curso.',
      contenido:
        'La Dirección de Administración Tributaria de la Alcaldía Municipal de San Pedro del Norte informa a la población contribuyente el calendario de pago del impuesto de matrícula municipal.\n\nEl pago puede realizarse en la ventanilla de Recaudación, ubicada en la planta baja del edificio municipal, de lunes a viernes de 8:00 a.m. a 4:00 p.m., o mediante transferencia bancaria a la cuenta institucional.\n\nSe recuerda que el pago puntual permite acceder a los descuentos establecidos en la ordenanza municipal y evita recargos e intereses moratorios.\n\nPara consultas sobre el monto a pagar, los contribuyentes pueden acercarse a la oficina con su cédula de identidad y número de matrícula.',
      portada: svgCover('Comunicado oficial', '#1e293b', '#0f3d6e'),
      destacada: false,
      publicada: true,
      autor: 'Dirección de Administración Tributaria',
      fecha: new Date(ahora - 15 * dia).toISOString(),
      vistas: 540,
    },
    {
      titulo: 'Inicia el bacheo y mejoramiento de calles en el casco urbano',
      categoria: 'Obras Públicas',
      resumen:
        'La comuna ejecuta la primera etapa de bacheo en doce cuadras del casco urbano, con recursos propios y maquinaria municipal.',
      contenido:
        'La Alcaldía Municipal inició la primera etapa del plan de bacheo y mejoramiento de calles del casco urbano, que contempla doce cuadras con mayor deterioro.\n\nLos trabajos incluyen la remoción del material dañado, la conformación de base y la colocación de concreto hidráulico en los puntos críticos, además de la limpieza de cunetas y tragantes.\n\nLa Dirección de Obras Públicas pidió a la población comprensión por las molestias temporales y recomendó utilizar rutas alternas mientras duren los trabajos.\n\nLa segunda etapa del plan se ejecutará en los barrios periféricos y se anunciará oportunamente a través de este portal.',
      portada: svgCover('Mejoramiento de calles', '#3b3b3b', '#b45309'),
      destacada: false,
      publicada: true,
      autor: 'Dirección de Obras Públicas',
      fecha: new Date(ahora - 21 * dia).toISOString(),
      vistas: 264,
    },
    {
      titulo: 'Feria del maíz y la cosecha reúne a productores de todo el municipio',
      categoria: 'Eventos',
      resumen:
        'Productores de las comarcas expusieron sus cosechas, participaron en concursos y recibieron asistencia técnica para mejorar la productividad.',
      contenido:
        'Con la participación de más de 40 productores, se realizó la Feria del Maíz y la Cosecha en la plaza municipal, un espacio para promover la producción local y el intercambio de experiencias.\n\nDurante la feria se realizaron concursos de la mejor mazorca, la mejor rosquilla y el mejor plato típico, además de presentaciones culturales de los grupos de danza de los institutos.\n\nLa Unidad de Desarrollo Agropecuario brindó asistencia técnica sobre manejo de semillas, control de plagas y conservación de suelos, y entregó semilla mejorada a los productores participantes.\n\nLas autoridades municipales reafirmaron su compromiso de seguir apoyando al sector productivo, motor principal de la economía del municipio.',
      portada: svgCover('Feria de la cosecha', '#7c2d12', '#c8963e'),
      destacada: false,
      publicada: true,
      autor: 'Unidad de Desarrollo Agropecuario',
      fecha: new Date(ahora - 30 * dia).toISOString(),
      vistas: 198,
    },
  ];

  return base.map((n, i) => ({
    id: `not-${String(i + 1).padStart(4, '0')}`,
    ...n,
    galeria: [],
    creadoEn: n.fecha,
    actualizadoEn: n.fecha,
  }));
}

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(String(password), salt, 120_000, 32, 'sha256').toString('hex');
}

function nuevoSeed() {
  const salt = crypto.randomBytes(16).toString('hex');
  return {
    version: 1,
    meta: {
      secret: crypto.randomBytes(32).toString('hex'),
      auth: {
        usuario: ADMIN_USER,
        salt,
        hash: hashPassword(ADMIN_PASSWORD, salt),
        actualizadoEn: new Date().toISOString(),
      },
    },
    sitio: SITIO_INICIAL,
    noticias: seedNoticias(),
    mensajes: [],
  };
}

let db = null;

function cargarDB() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (fs.existsSync(DB_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      if (parsed && Array.isArray(parsed.noticias) && parsed.meta?.auth) {
        parsed.mensajes = Array.isArray(parsed.mensajes) ? parsed.mensajes : [];
        parsed.sitio = { ...SITIO_INICIAL, ...(parsed.sitio || {}) };
        return parsed;
      }
      fs.renameSync(DB_FILE, `${DB_FILE}.corrupt-${Date.now()}`);
    }
  } catch (err) {
    console.error('[db] no se pudo leer la base local, se regenera:', err.message);
  }
  const inicial = nuevoSeed();
  escribirDB(inicial);
  return inicial;
}

function escribirDB(data) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    const tmp = `${DB_FILE}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
    fs.renameSync(tmp, DB_FILE);
  } catch (err) {
    console.error('[db] error al guardar:', err.message);
  }
}

function guardar() {
  escribirDB(db);
}

db = cargarDB();

/* ------------------------------------------------------------------ */
/* Sesiones                                                            */
/* ------------------------------------------------------------------ */

function firmar(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto
    .createHmac('sha256', db.meta.secret)
    .update(body)
    .digest('base64url');
  return `${body}.${sig}`;
}

function verificarToken(token) {
  if (typeof token !== 'string' || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const esperado = crypto
    .createHmac('sha256', db.meta.secret)
    .update(body)
    .digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(esperado);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (!payload?.exp || payload.exp < Date.now()) return null;
    if (payload.u !== db.meta.auth.usuario) return null;
    return payload;
  } catch {
    return null;
  }
}

function crearToken(usuario) {
  return firmar({
    u: usuario,
    iat: Date.now(),
    exp: Date.now() + SESSION_HOURS * 3_600_000,
  });
}

/* ------------------------------------------------------------------ */
/* Utilidades                                                          */
/* ------------------------------------------------------------------ */

const intentos = new Map();

function limitarIntentos(ip) {
  const ahora = Date.now();
  const ventana = 15 * 60_000;
  const registro = intentos.get(ip) || { n: 0, desde: ahora };
  if (ahora - registro.desde > ventana) {
    registro.n = 0;
    registro.desde = ahora;
  }
  registro.n += 1;
  intentos.set(ip, registro);
  return registro.n;
}

function limpiarIntentos(ip) {
  intentos.delete(ip);
}

function texto(valor, min, max) {
  if (typeof valor !== 'string') return null;
  const v = valor.trim();
  if (v.length < min || v.length > max) return null;
  return v;
}

function esImagenValida(valor) {
  if (valor === null || valor === undefined || valor === '') return true;
  if (typeof valor !== 'string') return false;
  if (valor.length > MAX_IMAGE_CHARS) return false;
  if (/^data:image\/(png|jpe?g|webp|gif|svg\+xml);base64,[A-Za-z0-9+/=]+$/.test(valor)) return true;
  if (/^https?:\/\/[^\s"'<>]+$/i.test(valor) && valor.length < 800) return true;
  if (/^\/assets\/[^\s"'<>]+$/.test(valor)) return true;
  return false;
}

function normalizarNoticia(body, existente) {
  const errores = [];
  const titulo = texto(body.titulo, 5, 160);
  if (!titulo) errores.push('El título debe tener entre 5 y 160 caracteres.');

  const categoria = texto(body.categoria, 2, 40) || 'Comunicados';
  const resumen = texto(body.resumen, 10, 400);
  if (!resumen) errores.push('El resumen debe tener entre 10 y 400 caracteres.');

  const contenido = texto(body.contenido, 10, 20_000);
  if (!contenido) errores.push('El contenido debe tener entre 10 y 20,000 caracteres.');

  const portada = body.portada ?? existente?.portada ?? '';
  if (!esImagenValida(portada)) errores.push('La imagen de portada no es válida o excede 3 MB.');

  let galeria = Array.isArray(body.galeria) ? body.galeria.slice(0, MAX_GALERIA) : existente?.galeria ?? [];
  galeria = galeria.filter((g) => typeof g === 'string' && esImagenValida(g) && g);
  if (galeria.length !== (Array.isArray(body.galeria) ? Math.min(body.galeria.length, MAX_GALERIA) : galeria.length)) {
    if (!errores.includes('Una de las fotos de la galería no es válida o excede 3 MB.')) {
      errores.push('Una de las fotos de la galería no es válida o excede 3 MB.');
    }
  }

  const fechaRaw = body.fecha ? new Date(body.fecha) : new Date();
  const fecha = Number.isNaN(fechaRaw.getTime()) ? new Date() : fechaRaw;

  return {
    errores,
    datos: {
      titulo,
      categoria,
      resumen,
      contenido,
      portada: portada || '',
      galeria,
      autor: texto(body.autor, 2, 80) || existente?.autor || 'Oficina de Comunicación',
      fecha: fecha.toISOString(),
      destacada: Boolean(body.destacada),
      publicada: body.publicada === undefined ? true : Boolean(body.publicada),
    },
  };
}

/* ------------------------------------------------------------------ */
/* Servidor                                                            */
/* ------------------------------------------------------------------ */

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '30mb' }));

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) res.setHeader('Cache-Control', 'no-store');
  next();
});

function requiereAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const sesion = verificarToken(token);
  if (!sesion) {
    return res.status(401).json({ error: 'Sesión no válida o expirada. Inicie sesión nuevamente.' });
  }
  req.admin = sesion;
  next();
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, servicio: 'portal-alcaldia-spn', noticias: db.noticias.length });
});

app.get('/api/sitio', (_req, res) => {
  res.json({ sitio: db.sitio, categorias: CATEGORIAS });
});

app.get('/api/noticias', (req, res) => {
  const header = req.headers.authorization || '';
  const esAdmin = Boolean(verificarToken(header.startsWith('Bearer ') ? header.slice(7) : ''));

  let lista = db.noticias.slice();
  if (!esAdmin) lista = lista.filter((n) => n.publicada);

  const categoria = typeof req.query.categoria === 'string' ? req.query.categoria : '';
  if (categoria && categoria !== 'todas') {
    lista = lista.filter((n) => n.categoria === categoria);
  }

  const q = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';
  if (q) {
    lista = lista.filter((n) =>
      `${n.titulo} ${n.resumen} ${n.contenido} ${n.categoria}`.toLowerCase().includes(q),
    );
  }

  lista.sort((a, b) => {
    if (Boolean(b.destacada) !== Boolean(a.destacada)) return b.destacada ? 1 : -1;
    return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
  });

  res.json({
    noticias: lista.map((n) => ({
      id: n.id,
      titulo: n.titulo,
      categoria: n.categoria,
      resumen: n.resumen,
      contenido: esAdmin ? n.contenido : undefined,
      portada: n.portada,
      galeria: n.galeria?.length || 0,
      autor: n.autor,
      fecha: n.fecha,
      destacada: n.destacada,
      publicada: n.publicada,
      vistas: n.vistas || 0,
    })),
    total: lista.length,
  });
});

app.get('/api/noticias/:id', (req, res) => {
  const noticia = db.noticias.find((n) => n.id === req.params.id);
  if (!noticia) return res.status(404).json({ error: 'La noticia no existe.' });

  const header = req.headers.authorization || '';
  const esAdmin = Boolean(verificarToken(header.startsWith('Bearer ') ? header.slice(7) : ''));
  if (!noticia.publicada && !esAdmin) {
    return res.status(404).json({ error: 'La noticia no está publicada.' });
  }

  if (!esAdmin) {
    noticia.vistas = (noticia.vistas || 0) + 1;
    guardar();
  }
  res.json({ noticia });
});

app.post('/api/noticias', requiereAdmin, (req, res) => {
  const { errores, datos } = normalizarNoticia(req.body || {});
  if (errores.length) return res.status(400).json({ error: errores[0], errores });

  const ahora = new Date().toISOString();
  const noticia = {
    id: `not-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    ...datos,
    galeria: datos.galeria,
    vistas: 0,
    creadoEn: ahora,
    actualizadoEn: ahora,
  };
  db.noticias.unshift(noticia);
  guardar();
  res.status(201).json({ noticia });
});

app.put('/api/noticias/:id', requiereAdmin, (req, res) => {
  const noticia = db.noticias.find((n) => n.id === req.params.id);
  if (!noticia) return res.status(404).json({ error: 'La noticia no existe.' });

  const { errores, datos } = normalizarNoticia(req.body || {}, noticia);
  if (errores.length) return res.status(400).json({ error: errores[0], errores });

  Object.assign(noticia, datos, { actualizadoEn: new Date().toISOString() });
  guardar();
  res.json({ noticia });
});

app.delete('/api/noticias/:id', requiereAdmin, (req, res) => {
  const indice = db.noticias.findIndex((n) => n.id === req.params.id);
  if (indice === -1) return res.status(404).json({ error: 'La noticia no existe.' });
  const [eliminada] = db.noticias.splice(indice, 1);
  guardar();
  res.json({ ok: true, id: eliminada.id });
});

app.post('/api/contacto', (req, res) => {
  const body = req.body || {};
  const nombre = texto(body.nombre, 2, 80);
  const correo = texto(body.correo, 5, 120);
  const mensaje = texto(body.mensaje, 10, 2_000);
  const errores = [];
  if (!nombre) errores.push('Indique su nombre completo.');
  if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo)) errores.push('Indique un correo válido.');
  if (!mensaje) errores.push('Escriba su mensaje (mínimo 10 caracteres).');
  if (errores.length) return res.status(400).json({ error: errores[0], errores });

  const registro = {
    id: `msg-${Date.now().toString(36)}`,
    nombre,
    correo,
    telefono: texto(body.telefono, 0, 40) || '',
    asunto: texto(body.asunto, 0, 120) || 'Consulta desde el portal',
    mensaje,
    leido: false,
    creadoEn: new Date().toISOString(),
  };
  db.mensajes.unshift(registro);
  if (db.mensajes.length > 500) db.mensajes = db.mensajes.slice(0, 500);
  guardar();
  res.status(201).json({ ok: true, mensaje: 'Su mensaje fue recibido por la Alcaldía.' });
});

app.post('/api/auth/login', (req, res) => {
  const ip = req.ip || req.socket.remoteAddress || 'desconocido';
  if (limitarIntentos(ip) > 10) {
    return res.status(429).json({ error: 'Demasiados intentos. Espere 15 minutos e intente de nuevo.' });
  }

  const usuario = typeof req.body?.usuario === 'string' ? req.body.usuario.trim() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  const auth = db.meta.auth;
  const hash = hashPassword(password, auth.salt);
  const usuarioOk = usuario.toLowerCase() === auth.usuario.toLowerCase();
  const claveOk = hash.length === auth.hash.length && crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(auth.hash));

  if (!usuarioOk || !claveOk) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
  }

  limpiarIntentos(ip);
  res.json({
    token: crearToken(auth.usuario),
    usuario: auth.usuario,
    nombre: 'Administrador del Portal',
    expiraEn: new Date(Date.now() + SESSION_HOURS * 3_600_000).toISOString(),
  });
});

app.get('/api/auth/sesion', requiereAdmin, (req, res) => {
  res.json({ usuario: req.admin.u, nombre: 'Administrador del Portal' });
});

app.post('/api/auth/password', requiereAdmin, (req, res) => {
  const actual = typeof req.body?.actual === 'string' ? req.body.actual : '';
  const nueva = typeof req.body?.nueva === 'string' ? req.body.nueva : '';
  const auth = db.meta.auth;

  const hashActual = hashPassword(actual, auth.salt);
  if (!crypto.timingSafeEqual(Buffer.from(hashActual), Buffer.from(auth.hash))) {
    return res.status(401).json({ error: 'La contraseña actual no es correcta.' });
  }
  if (nueva.length < 8) {
    return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres.' });
  }

  const salt = crypto.randomBytes(16).toString('hex');
  db.meta.auth = {
    usuario: auth.usuario,
    salt,
    hash: hashPassword(nueva, salt),
    actualizadoEn: new Date().toISOString(),
  };
  guardar();
  res.json({ ok: true, token: crearToken(auth.usuario) });
});

app.get('/api/mensajes', requiereAdmin, (_req, res) => {
  res.json({ mensajes: db.mensajes, noLeidos: db.mensajes.filter((m) => !m.leido).length });
});

app.patch('/api/mensajes/:id', requiereAdmin, (req, res) => {
  const msg = db.mensajes.find((m) => m.id === req.params.id);
  if (!msg) return res.status(404).json({ error: 'El mensaje no existe.' });
  msg.leido = req.body?.leido === undefined ? !msg.leido : Boolean(req.body.leido);
  guardar();
  res.json({ mensaje: msg });
});

app.delete('/api/mensajes/:id', requiereAdmin, (req, res) => {
  const i = db.mensajes.findIndex((m) => m.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'El mensaje no existe.' });
  db.mensajes.splice(i, 1);
  guardar();
  res.json({ ok: true });
});

app.put('/api/sitio', requiereAdmin, (req, res) => {
  const body = req.body || {};
  const campos = [
    ['nombre', 3, 120],
    ['lema', 2, 80],
    ['departamento', 2, 80],
    ['heroTitulo', 5, 160],
    ['heroSubtitulo', 10, 400],
    ['alcalde', 2, 100],
    ['cargoAlcalde', 2, 80],
    ['mensajeAlcalde', 10, 2_000],
    ['direccion', 5, 200],
    ['telefono', 5, 60],
    ['correo', 5, 120],
    ['horario', 3, 120],
    ['facebook', 0, 300],
  ];
  const nuevo = { ...db.sitio };
  for (const [clave, min, max] of campos) {
    if (body[clave] === undefined) continue;
    const valor = texto(body[clave], min, max);
    if (valor === null) {
      return res.status(400).json({ error: `El campo "${clave}" no es válido.` });
    }
    nuevo[clave] = valor;
  }
  nuevo.actualizadoEn = new Date().toISOString();
  db.sitio = nuevo;
  guardar();
  res.json({ sitio: db.sitio });
});

app.get('/api/estadisticas', requiereAdmin, (_req, res) => {
  const total = db.noticias.length;
  res.json({
    total,
    publicadas: db.noticias.filter((n) => n.publicada).length,
    borradores: db.noticias.filter((n) => !n.publicada).length,
    destacadas: db.noticias.filter((n) => n.destacada).length,
    vistas: db.noticias.reduce((acc, n) => acc + (n.vistas || 0), 0),
    mensajes: db.mensajes.length,
    noLeidos: db.mensajes.filter((m) => !m.leido).length,
  });
});

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Recurso no encontrado.' });
});

/* Sitio público */
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR, { index: false, maxAge: '1h' }));
  app.get('*', (req, res, next) => {
    if (req.method !== 'GET') return next();
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
} else {
  app.get('*', (_req, res) => {
    res
      .status(503)
      .type('html')
      .send('<h1>Portal en construcción</h1><p>Ejecute <code>npm run build</code> para generar el sitio.</p>');
  });
}

app.use((err, _req, res, _next) => {
  console.error('[server]', err?.message || err);
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Las imágenes enviadas son demasiado grandes.' });
  }
  res.status(500).json({ error: 'Ocurrió un error en el servidor. Intente nuevamente.' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Portal Alcaldía San Pedro del Norte escuchando en http://0.0.0.0:${PORT}`);
  console.log(`Noticias cargadas: ${db.noticias.length} · Usuario admin: ${db.meta.auth.usuario}`);
});
