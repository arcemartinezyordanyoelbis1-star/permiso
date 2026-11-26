import React, { useState } from 'react';
import {
  Building2,
  ChevronRight,
  Clock,
  Facebook,
  Mail,
  MapPin,
  Menu,
  Phone,
  ShieldCheck,
  X,
} from 'lucide-react';
import type { Sitio } from '../lib/api';
import { navegar } from '../lib/router';

interface Enlace {
  etiqueta: string;
  ruta: string;
}

const ENLACES: Enlace[] = [
  { etiqueta: 'Inicio', ruta: '/' },
  { etiqueta: 'Noticias', ruta: '/noticias' },
  { etiqueta: 'Trámites en línea', ruta: '/tramites' },
  { etiqueta: 'Contacto', ruta: '/contacto' },
];

export const PortalLayout: React.FC<{
  ruta: string;
  sitio: Sitio | null;
  children: React.ReactNode;
}> = ({ ruta, sitio, children }) => {
  const [menuAbierto, setMenuAbierto] = useState(false);

  const ir = (destino: string) => {
    setMenuAbierto(false);
    navegar(destino);
  };

  const activo = (destino: string) =>
    destino === '/' ? ruta === '/' : ruta === destino || ruta.startsWith(`${destino}/`);

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f7f9] text-slate-800">
      {/* Franja institucional */}
      <div className="bg-[#08213d] text-[11px] sm:text-xs text-sky-100/80">
        <div className="mx-auto max-w-6xl px-4 h-9 flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 truncate">
            <ShieldCheck className="w-3.5 h-3.5 text-[#d8b36a] shrink-0" />
            <span className="truncate">Gobierno de Reconciliación y Unidad Nacional</span>
          </span>
          <div className="hidden sm:flex items-center gap-4 shrink-0">
            <a href={`tel:${(sitio?.telefono || '').replace(/\s/g, '')}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone className="w-3.5 h-3.5" />
              {sitio?.telefono || '+505 2345 6789'}
            </a>
            <a href={`mailto:${sitio?.correo || 'info@alcaldiasanpedrodelnorte.gob.ni'}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Mail className="w-3.5 h-3.5" />
              <span className="truncate max-w-[190px]">{sitio?.correo || 'info@alcaldiasanpedrodelnorte.gob.ni'}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Encabezado principal */}
      <header className="sticky top-0 z-40 bg-white/97 backdrop-blur-md border-b border-slate-200 shadow-[0_1px_12px_rgba(15,61,110,0.08)]">
        <div className="mx-auto max-w-6xl px-4 h-[68px] flex items-center justify-between gap-4">
          <button onClick={() => ir('/')} className="flex items-center gap-3 text-left cursor-pointer group min-w-0">
            <img
              src="/assets/logos/logo_escudo_spn.png"
              alt="Escudo oficial de la Alcaldía de San Pedro del Norte"
              className="w-11 h-11 object-contain shrink-0"
            />
            <span className="min-w-0">
              <span className="block text-[13px] sm:text-[15px] font-extrabold leading-tight tracking-tight text-[#0f3d6e] truncate group-hover:text-[#146c43] transition-colors">
                {sitio?.nombre || 'Alcaldía Municipal de San Pedro del Norte'}
              </span>
              <span className="block text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-[#c8963e] truncate">
                {sitio?.departamento || 'Chinandega, Nicaragua'}
              </span>
            </span>
          </button>

          <nav className="hidden lg:flex items-center gap-1">
            {ENLACES.map((enlace) => (
              <button
                key={enlace.ruta}
                onClick={() => ir(enlace.ruta)}
                className={`px-3.5 py-2 rounded-lg text-[13px] font-bold transition-colors cursor-pointer ${
                  activo(enlace.ruta)
                    ? 'bg-[#0f3d6e]/8 text-[#0f3d6e]'
                    : 'text-slate-600 hover:text-[#0f3d6e] hover:bg-slate-50'
                }`}
              >
                {enlace.etiqueta}
              </button>
            ))}
            <button
              onClick={() => ir('/admin')}
              className="ml-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-bold text-white bg-[#0f3d6e] hover:bg-[#0a2a4d] shadow-sm transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              Administrador
            </button>
          </nav>

          <button
            onClick={() => setMenuAbierto((v) => !v)}
            className="lg:hidden p-2 -mr-1 rounded-lg text-slate-700 hover:bg-slate-100 cursor-pointer"
            aria-label="Abrir menú de navegación"
          >
            {menuAbierto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {menuAbierto && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
            {ENLACES.map((enlace) => (
              <button
                key={enlace.ruta}
                onClick={() => ir(enlace.ruta)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold cursor-pointer ${
                  activo(enlace.ruta) ? 'bg-[#0f3d6e]/8 text-[#0f3d6e]' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {enlace.etiqueta}
                <ChevronRight className="w-4 h-4 opacity-40" />
              </button>
            ))}
            <button
              onClick={() => ir('/admin')}
              className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold text-white bg-[#0f3d6e] cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              Acceso administrador
            </button>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      {/* Pie de página institucional */}
      <footer className="bg-[#08213d] text-slate-300 mt-auto">
        <div className="mx-auto max-w-6xl px-4 py-12 grid gap-10 md:grid-cols-[1.4fr_1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-3">
              <img
                src="/assets/logos/logo_escudo_spn.png"
                alt="Escudo de San Pedro del Norte"
                className="w-14 h-14 object-contain bg-white/5 rounded-full p-1"
              />
              <div>
                <p className="text-white font-extrabold text-sm leading-tight">
                  {sitio?.nombre || 'Alcaldía Municipal de San Pedro del Norte'}
                </p>
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#d8b36a] font-bold mt-0.5">
                  {sitio?.lema || 'Somos Pueblo Que Vence'}
                </p>
              </div>
            </div>
            <p className="text-[13px] leading-relaxed text-slate-400 mt-4 max-w-sm">
              Portal oficial de información municipal. Noticias, comunicados y servicios al servicio de las familias
              sampedreñas.
            </p>
            <a
              href={sitio?.facebook || 'https://www.facebook.com/'}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-[13px] font-semibold text-slate-300 hover:text-white transition-colors"
            >
              <Facebook className="w-4 h-4" />
              Facebook oficial
            </a>
          </div>

          <div>
            <h4 className="text-white text-[13px] font-bold uppercase tracking-[0.14em] mb-4">Enlaces</h4>
            <ul className="space-y-2.5 text-[13px]">
              {ENLACES.map((e) => (
                <li key={e.ruta}>
                  <button onClick={() => ir(e.ruta)} className="hover:text-white transition-colors cursor-pointer">
                    {e.etiqueta}
                  </button>
                </li>
              ))}
              <li>
                <button onClick={() => ir('/admin')} className="hover:text-white transition-colors cursor-pointer">
                  Panel administrativo
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-[13px] font-bold uppercase tracking-[0.14em] mb-4">Contacto</h4>
            <ul className="space-y-3 text-[13px]">
              <li className="flex gap-2.5">
                <MapPin className="w-4 h-4 text-[#d8b36a] shrink-0 mt-0.5" />
                <span>{sitio?.direccion || 'Costado Sur del Parque Municipal, Chinandega'}</span>
              </li>
              <li className="flex gap-2.5">
                <Phone className="w-4 h-4 text-[#d8b36a] shrink-0 mt-0.5" />
                <a href={`tel:${(sitio?.telefono || '').replace(/\s/g, '')}`} className="hover:text-white transition-colors">
                  {sitio?.telefono || '+505 2345 6789'}
                </a>
              </li>
              <li className="flex gap-2.5">
                <Mail className="w-4 h-4 text-[#d8b36a] shrink-0 mt-0.5" />
                <a href={`mailto:${sitio?.correo || ''}`} className="hover:text-white transition-colors break-all">
                  {sitio?.correo || 'info@alcaldiasanpedrodelnorte.gob.ni'}
                </a>
              </li>
              <li className="flex gap-2.5">
                <Clock className="w-4 h-4 text-[#d8b36a] shrink-0 mt-0.5" />
                <span>{sitio?.horario || 'Lunes a viernes, 8:00 a.m. — 5:00 p.m.'}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto max-w-6xl px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              © {new Date().getFullYear()} Alcaldía Municipal de San Pedro del Norte · Chinandega, Nicaragua
            </span>
            <span>Todos los derechos reservados</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
