import React from 'react';
import { ArrowRight, CalendarDays, Eye, Star } from 'lucide-react';
import { fechaLarga, type NoticiaResumen } from '../lib/api';
import { navegar } from '../lib/router';

export const PortadaFallback: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`relative w-full h-full overflow-hidden bg-gradient-to-br from-[#0f3d6e] via-[#14507f] to-[#146c43] ${className}`}
  >
    <div className="absolute inset-0 opacity-[0.13]">
      <svg viewBox="0 0 400 300" className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <pattern id="spn-grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M32 0H0v32" fill="none" stroke="#ffffff" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="400" height="300" fill="url(#spn-grid)" />
      </svg>
    </div>
    <div className="absolute inset-0 flex items-center justify-center">
      <img
        src="/assets/logos/logo_escudo_spn.png"
        alt="Escudo de San Pedro del Norte"
        className="w-20 h-20 object-contain opacity-70"
      />
    </div>
  </div>
);

export const NoticiaCard: React.FC<{
  noticia: NoticiaResumen;
  destacada?: boolean;
}> = ({ noticia, destacada = false }) => (
  <article
    onClick={() => navegar(`/noticia/${noticia.id}`)}
    className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
  >
    <div className={`relative overflow-hidden ${destacada ? 'aspect-[16/9]' : 'aspect-[16/10]'}`}>
      {noticia.portada ? (
        <img
          src={noticia.portada}
          alt={noticia.titulo}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <PortadaFallback />
      )}
      <div className="absolute top-3 left-3 flex flex-wrap gap-2">
        <span className="px-2.5 py-1 rounded-md bg-[#0f3d6e] text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
          {noticia.categoria}
        </span>
        {noticia.destacada && (
          <span className="px-2 py-1 rounded-md bg-[#c8963e] text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
            <Star className="w-3 h-3 fill-current" />
            Destacada
          </span>
        )}
      </div>
      {!noticia.publicada && (
        <span className="absolute top-3 right-3 px-2 py-1 rounded-md bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
          Borrador
        </span>
      )}
    </div>

    <div className="p-5 flex flex-col flex-1">
      <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium mb-2">
        <span className="flex items-center gap-1.5">
          <CalendarDays className="w-3.5 h-3.5 text-[#146c43]" />
          {fechaLarga(noticia.fecha)}
        </span>
        <span className="flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-slate-400" />
          {noticia.vistas}
        </span>
      </div>

      <h3
        className={`font-extrabold text-[#0d2c4d] leading-snug group-hover:text-[#146c43] transition-colors ${
          destacada ? 'text-lg sm:text-xl' : 'text-[15px] sm:text-base'
        }`}
      >
        {noticia.titulo}
      </h3>

      <p className="text-[13px] text-slate-600 leading-relaxed mt-2 line-clamp-3 flex-1">{noticia.resumen}</p>

      <span className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-bold text-[#0f3d6e] group-hover:gap-2.5 transition-all">
        Leer noticia completa
        <ArrowRight className="w-3.5 h-3.5" />
      </span>
    </div>
  </article>
);
