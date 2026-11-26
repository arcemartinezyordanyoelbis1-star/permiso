import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  HeartHandshake,
  Leaf,
  Mail,
  MapPin,
  Megaphone,
  Phone,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
  Wrench,
} from 'lucide-react';
import { api, type NoticiaResumen, type Sitio } from '../lib/api';
import { navegar } from '../lib/router';
import { NoticiaCard } from './NoticiaCard';

const SERVICIOS = [
  { icono: Wrench, titulo: 'Obras Públicas', texto: 'Calles, drenaje, parques y espacios comunitarios.' },
  { icono: HeartHandshake, titulo: 'Desarrollo Social', texto: 'Programas para familias, niñez y adultos mayores.' },
  { icono: Stethoscope, titulo: 'Salud Municipal', texto: 'Jornadas médicas y prevención en las comarcas.' },
  { icono: Leaf, titulo: 'Medio Ambiente', texto: 'Reforestación, limpieza y cuido del agua.' },
  { icono: Users, titulo: 'Atención Ciudadana', texto: 'Trámites, constancias y servicio al contribuyente.' },
  { icono: FileText, titulo: 'Trámites en línea', texto: 'Solicitud de permisos laborales del personal municipal.' },
];

export const PortalHome: React.FC<{ sitio: Sitio | null }> = ({ sitio }) => {
  const [noticias, setNoticias] = useState<NoticiaResumen[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let vivo = true;
    api
      .noticias()
      .then((r) => vivo && setNoticias(r.noticias))
      .catch(() => vivo && setNoticias([]))
      .finally(() => vivo && setCargando(false));
    return () => {
      vivo = false;
    };
  }, []);

  const destacada = noticias.find((n) => n.destacada) || noticias[0];
  const resto = noticias.filter((n) => n.id !== destacada?.id).slice(0, 3);

  return (
    <div>
      {/* Hero institucional */}
      <section className="relative overflow-hidden bg-[#0a2a4d]">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a2a4d] via-[#0f3d6e] to-[#146c43]" />
          <div className="absolute inset-0 opacity-[0.16]">
            <svg viewBox="0 0 1200 600" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
              <defs>
                <pattern id="hero-grid" width="48" height="48" patternUnits="userSpaceOnUse">
                  <path d="M48 0H0v48" fill="none" stroke="#ffffff" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="1200" height="600" fill="url(#hero-grid)" />
            </svg>
          </div>
          <div className="absolute -right-24 -top-24 w-[520px] h-[520px] rounded-full bg-[#c8963e]/12 blur-3xl" />
          <div className="absolute -left-32 bottom-0 w-[420px] h-[420px] rounded-full bg-white/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:py-20 grid lg:grid-cols-[1.15fr_0.85fr] gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-[11px] font-bold uppercase tracking-[0.16em] text-[#e6cf9a]">
              <ShieldCheck className="w-3.5 h-3.5" />
              Portal oficial del municipio
            </span>

            <h1 className="mt-5 text-3xl sm:text-4xl lg:text-[42px] font-black leading-[1.12] text-white tracking-tight">
              {sitio?.heroTitulo || 'Trabajamos por un San Pedro del Norte próspero y seguro'}
            </h1>

            <p className="mt-4 text-[15px] sm:text-base leading-relaxed text-sky-100/85 max-w-xl">
              {sitio?.heroSubtitulo ||
                'Portal oficial de noticias, trámites y servicios de la Alcaldía Municipal. Transparencia, cercanía y resultados para todas las familias del municipio.'}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={() => navegar('/noticias')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#c8963e] hover:bg-[#b5852f] text-[#20180a] text-sm font-bold shadow-lg shadow-black/20 transition-colors cursor-pointer"
              >
                <Megaphone className="w-4 h-4" />
                Ver todas las noticias
              </button>
              <button
                onClick={() => navegar('/tramites')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 text-white text-sm font-bold transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                Trámites en línea
              </button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[12px] text-sky-100/70">
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#d8b36a]" />
                {sitio?.departamento || 'Chinandega, Nicaragua'}
              </span>
              <span className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#d8b36a]" />
                {sitio?.telefono || '+505 2345 6789'}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#d8b36a]" />
                {sitio?.horario || 'Lun a Vie · 8:00 a.m. — 5:00 p.m.'}
              </span>
            </div>
          </div>

          {/* Noticia más reciente */}
          <div className="relative">
            <div className="absolute -inset-2 bg-white/5 rounded-3xl blur-xl" />
            <div className="relative bg-white/95 backdrop-blur rounded-2xl overflow-hidden shadow-2xl border border-white/40">
              <div className="px-4 py-3 bg-[#0f3d6e] flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/90">
                  Última publicación
                </span>
                <Sparkles className="w-4 h-4 text-[#d8b36a]" />
              </div>
              {cargando ? (
                <div className="p-5 space-y-3">
                  <div className="h-40 bg-slate-200 rounded-xl animate-pulse" />
                  <div className="h-3.5 bg-slate-200 rounded w-4/5 animate-pulse" />
                  <div className="h-3 bg-slate-100 rounded w-full animate-pulse" />
                </div>
              ) : destacada ? (
                <div className="cursor-pointer group" onClick={() => navegar(`/noticia/${destacada.id}`)}>
                  <div className="aspect-[16/9] overflow-hidden">
                    {destacada.portada ? (
                      <img
                        src={destacada.portada}
                        alt={destacada.titulo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#0f3d6e] to-[#146c43]" />
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-[#146c43]">
                      <span className="px-2 py-0.5 rounded bg-[#146c43]/10 uppercase tracking-wider">
                        {destacada.categoria}
                      </span>
                      <span className="text-slate-500 flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        {new Date(destacada.fecha).toLocaleDateString('es-NI', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <h2 className="mt-2 text-[15px] font-extrabold leading-snug text-[#0d2c4d] group-hover:text-[#146c43] transition-colors">
                      {destacada.titulo}
                    </h2>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-bold text-[#0f3d6e]">
                      Leer más <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-sm text-slate-600">
                  Aún no hay noticias publicadas. Ingrese al panel de administrador para crear la primera.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="relative border-t border-white/10 bg-black/15">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-center gap-2 text-[11px] sm:text-xs text-sky-100/70 text-center">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#d8b36a] shrink-0" />
            <span>
              Información oficial y verificada por la Oficina de Comunicación de la Alcaldía Municipal
            </span>
          </div>
        </div>
      </section>

      {/* Accesos rápidos */}
      <section className="mx-auto max-w-6xl px-4 -mt-6 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { icono: Megaphone, titulo: 'Noticias', texto: 'Comunicados y avances', ruta: '/noticias' },
            { icono: FileText, titulo: 'Trámites', texto: 'Permisos del personal', ruta: '/tramites' },
            { icono: Building2, titulo: 'La Alcaldía', texto: 'Quiénes somos', ruta: '/contacto' },
            { icono: Mail, titulo: 'Contacto', texto: 'Escríbanos', ruta: '/contacto' },
          ].map(({ icono: Icono, titulo, texto, ruta }) => (
            <button
              key={titulo}
              onClick={() => navegar(ruta)}
              className="group bg-white rounded-xl border border-slate-200 p-4 text-left shadow-sm hover:shadow-md hover:border-[#0f3d6e]/30 transition-all cursor-pointer"
            >
              <span className="w-10 h-10 rounded-lg bg-[#0f3d6e]/8 text-[#0f3d6e] flex items-center justify-center group-hover:bg-[#0f3d6e] group-hover:text-white transition-colors">
                <Icono className="w-5 h-5" />
              </span>
              <p className="mt-3 text-[13px] font-extrabold text-[#0d2c4d]">{titulo}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{texto}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Noticias */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-7">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#146c43]">
              Sala de prensa
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0d2c4d] tracking-tight mt-1">
              Noticias y comunicados
            </h2>
            <p className="text-[13px] text-slate-600 mt-1">
              Manténgase informado sobre la gestión municipal y las actividades del municipio.
            </p>
          </div>
          <button
            onClick={() => navegar('/noticias')}
            className="inline-flex items-center gap-2 text-[13px] font-bold text-[#0f3d6e] hover:gap-3 transition-all cursor-pointer"
          >
            Ver todas <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {cargando ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="aspect-[16/10] bg-slate-200 animate-pulse" />
                <div className="p-5 space-y-2.5">
                  <div className="h-3 bg-slate-200 rounded w-1/3 animate-pulse" />
                  <div className="h-4 bg-slate-200 rounded w-full animate-pulse" />
                  <div className="h-3 bg-slate-100 rounded w-4/5 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : noticias.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center">
            <Megaphone className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="mt-3 font-bold text-slate-700">Todavía no hay noticias publicadas</p>
            <p className="text-[13px] text-slate-500 mt-1">
              Las publicaciones aparecerán aquí en cuanto el administrador las cree.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {(resto.length ? resto : noticias.slice(0, 3)).map((n) => (
              <NoticiaCard key={n.id} noticia={n} />
            ))}
          </div>
        )}
      </section>

      {/* Mensaje del alcalde */}
      <section className="bg-white border-y border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-14 grid lg:grid-cols-[0.85fr_1.15fr] gap-10 items-center">
          <div className="relative">
            <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#0f3d6e] to-[#146c43] p-8 text-center shadow-xl">
              <img
                src="/assets/logos/logo_escudo_spn.png"
                alt="Escudo municipal"
                className="w-24 h-24 object-contain mx-auto drop-shadow-lg"
              />
              <p className="mt-5 text-white font-extrabold text-lg leading-tight">
                {sitio?.alcalde || 'Lic. José Ramón Centeno López'}
              </p>
              <p className="text-[11px] uppercase tracking-[0.16em] text-[#e6cf9a] font-bold mt-1">
                {sitio?.cargoAlcalde || 'Alcalde Municipal'}
              </p>
              <div className="mt-4 h-px bg-white/20" />
              <p className="mt-4 text-[12px] text-sky-100/80">
                {sitio?.nombre || 'Alcaldía Municipal de San Pedro del Norte'}
              </p>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#146c43]">
              Mensaje del alcalde
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0d2c4d] tracking-tight mt-1">
              Un municipio que avanza con su gente
            </h2>
            <blockquote className="mt-4 pl-4 border-l-4 border-[#c8963e] text-[14px] sm:text-[15px] leading-relaxed text-slate-700">
              {sitio?.mensajeAlcalde ||
                'Trabajamos cada día para llevar obras, servicios y oportunidades a cada comarca y barrio del municipio. La puerta de la Alcaldía está abierta para todas y todos.'}
            </blockquote>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { valor: '9', etiqueta: 'Comarcas atendidas' },
                { valor: '24/7', etiqueta: 'Atención en línea' },
                { valor: '100%', etiqueta: 'Compromiso' },
              ].map((item) => (
                <div key={item.etiqueta} className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-center">
                  <p className="text-lg font-black text-[#0f3d6e]">{item.valor}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mt-0.5">
                    {item.etiqueta}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="text-center max-w-2xl mx-auto mb-9">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#146c43]">Servicios</span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0d2c4d] tracking-tight mt-1">
            Servicios municipales
          </h2>
          <p className="text-[13px] text-slate-600 mt-2">
            Áreas de trabajo de la Alcaldía al servicio de la comunidad sampedreña.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SERVICIOS.map(({ icono: Icono, titulo, texto }) => (
            <div
              key={titulo}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:border-[#146c43]/40 hover:shadow-md transition-all"
            >
              <span className="w-11 h-11 rounded-lg bg-[#146c43]/10 text-[#146c43] flex items-center justify-center">
                <Icono className="w-5 h-5" />
              </span>
              <h3 className="mt-3.5 text-[14px] font-extrabold text-[#0d2c4d]">{titulo}</h3>
              <p className="text-[12.5px] text-slate-600 mt-1 leading-relaxed">{texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Franja de contacto */}
      <section className="bg-[#0f3d6e] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.12]">
          <svg viewBox="0 0 1200 200" className="w-full h-full" preserveAspectRatio="none">
            <rect width="1200" height="200" fill="url(#hero-grid)" />
          </svg>
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              ¿Necesita ayuda o desea presentar una solicitud?
            </h2>
            <p className="text-[13px] text-sky-100/80 mt-1.5">
              Escríbanos y nuestro equipo de atención ciudadana le responderá a la brevedad.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navegar('/contacto')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#c8963e] hover:bg-[#b5852f] text-[#20180a] text-sm font-bold transition-colors cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              Escribir a la Alcaldía
            </button>
            <a
              href={`tel:${(sitio?.telefono || '').replace(/\s/g, '')}`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 text-white text-sm font-bold transition-colors"
            >
              <Phone className="w-4 h-4" />
              Llamar ahora
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
