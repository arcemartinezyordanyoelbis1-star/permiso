import React, { useEffect, useState } from 'react';
import { ArrowLeft, CalendarDays, ChevronRight, Eye, Loader2, Share2, User, X } from 'lucide-react';
import { api, fechaLarga, type NoticiaDetalle } from '../lib/api';
import { navegar } from '../lib/router';
import { NoticiaCard, PortadaFallback } from './NoticiaCard';
import type { NoticiaResumen } from '../lib/api';

export const PortalNoticia: React.FC<{ id: string }> = ({ id }) => {
  const [noticia, setNoticia] = useState<NoticiaDetalle | null>(null);
  const [relacionadas, setRelacionadas] = useState<NoticiaResumen[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [foto, setFoto] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    let vivo = true;
    setCargando(true);
    setError('');
    api
      .noticia(id)
      .then((r) => {
        if (!vivo) return;
        setNoticia(r.noticia);
        return api.noticias().then((lista) => {
          if (vivo) setRelacionadas(lista.noticias.filter((n) => n.id !== r.noticia.id).slice(0, 3));
        });
      })
      .catch((e) => vivo && setError(e.message))
      .finally(() => vivo && setCargando(false));
    return () => {
      vivo = false;
    };
  }, [id]);

  const compartir = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: noticia?.titulo || 'Noticia', url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2200);
      }
    } catch {
      /* el usuario canceló */
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500 gap-2 text-sm">
        <Loader2 className="w-5 h-5 animate-spin" />
        Cargando noticia...
      </div>
    );
  }

  if (error || !noticia) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-lg font-extrabold text-slate-800">No pudimos mostrar esta noticia</p>
        <p className="text-[13px] text-slate-500 mt-2">{error || 'La publicación no existe o fue retirada.'}</p>
        <button
          onClick={() => navegar('/noticias')}
          className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0f3d6e] text-white text-[13px] font-bold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a noticias
        </button>
      </div>
    );
  }

  const parrafos = noticia.contenido.split(/\n{2,}/).filter((p) => p.trim());

  return (
    <article className="bg-white">
      <div className="bg-[#0a2a4d] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.12]">
          <svg viewBox="0 0 1200 200" className="w-full h-full" preserveAspectRatio="none">
            <rect width="1200" height="200" fill="url(#noticias-grid)" />
          </svg>
        </div>
        <div className="relative mx-auto max-w-4xl px-4 pt-6 pb-9">
          <nav className="flex items-center flex-wrap gap-1.5 text-[11px] text-sky-100/70 mb-4">
            <button onClick={() => navegar('/')} className="hover:text-white transition-colors cursor-pointer">
              Inicio
            </button>
            <ChevronRight className="w-3 h-3" />
            <button onClick={() => navegar('/noticias')} className="hover:text-white transition-colors cursor-pointer">
              Noticias
            </button>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#e6cf9a] font-semibold truncate max-w-[240px]">{noticia.categoria}</span>
          </nav>

          <span className="inline-block px-2.5 py-1 rounded-md bg-[#c8963e] text-[#20180a] text-[10px] font-black uppercase tracking-widest">
            {noticia.categoria}
          </span>
          <h1 className="mt-3 text-2xl sm:text-3xl lg:text-[34px] font-black leading-tight text-white tracking-tight">
            {noticia.titulo}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-sky-100/75">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-[#d8b36a]" />
              {fechaLarga(noticia.fecha)}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#d8b36a]" />
              {noticia.autor}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-[#d8b36a]" />
              {noticia.vistas} lecturas
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm aspect-[16/9] bg-slate-100">
          {noticia.portada ? (
            <img src={noticia.portada} alt={noticia.titulo} className="w-full h-full object-cover" />
          ) : (
            <PortadaFallback />
          )}
        </div>

        <div className="mt-8 grid lg:grid-cols-[1fr_240px] gap-10">
          <div>
            <p className="text-[15px] sm:text-base font-semibold text-slate-700 leading-relaxed border-l-4 border-[#c8963e] pl-4">
              {noticia.resumen}
            </p>

            <div className="mt-6 space-y-4">
              {parrafos.map((parrafo, i) => (
                <p key={i} className="text-[14.5px] leading-[1.85] text-slate-700">
                  {parrafo}
                </p>
              ))}
            </div>

            {noticia.galeria?.length > 0 && (
              <section className="mt-10">
                <h2 className="text-[15px] font-extrabold text-[#0d2c4d] mb-3 flex items-center gap-2">
                  <span className="w-1 h-4 bg-[#146c43] rounded-full" />
                  Galería de fotos
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {noticia.galeria.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setFoto(src)}
                      className="aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 hover:ring-2 hover:ring-[#0f3d6e]/40 transition cursor-pointer"
                    >
                      <img
                        src={src}
                        alt={`Fotografía ${i + 1} de la noticia`}
                        loading="lazy"
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </button>
                  ))}
                </div>
              </section>
            )}

            <div className="mt-10 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => navegar('/noticias')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[13px] font-bold transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver a noticias
              </button>
              <button
                onClick={compartir}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0f3d6e] hover:bg-[#0a2a4d] text-white text-[13px] font-bold transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                {copiado ? 'Enlace copiado' : 'Compartir'}
              </button>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#146c43]">Publicado por</p>
              <p className="mt-1.5 text-[13px] font-bold text-[#0d2c4d]">{noticia.autor}</p>
              <p className="text-[11.5px] text-slate-500 mt-0.5">
                Alcaldía Municipal de San Pedro del Norte
              </p>
            </div>
            <div className="rounded-xl bg-[#0f3d6e] p-4 text-white">
              <p className="text-[12px] font-bold">¿Tiene información para la Alcaldía?</p>
              <p className="text-[11.5px] text-sky-100/80 mt-1 leading-relaxed">
                Envíe su consulta o denuncia a través del formulario de contacto.
              </p>
              <button
                onClick={() => navegar('/contacto')}
                className="mt-3 w-full py-2 rounded-lg bg-[#c8963e] hover:bg-[#b5852f] text-[#20180a] text-[12px] font-bold cursor-pointer"
              >
                Contactar
              </button>
            </div>
          </aside>
        </div>
      </div>

      {relacionadas.length > 0 && (
        <section className="bg-[#f6f7f9] border-t border-slate-200">
          <div className="mx-auto max-w-6xl px-4 py-12">
            <h2 className="text-xl font-black text-[#0d2c4d] tracking-tight mb-5">Otras noticias</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {relacionadas.map((n) => (
                <NoticiaCard key={n.id} noticia={n} />
              ))}
            </div>
          </div>
        </section>
      )}

      {foto && (
        <div
          onClick={() => setFoto(null)}
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <button
            onClick={() => setFoto(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            aria-label="Cerrar imagen"
          >
            <X className="w-5 h-5" />
          </button>
          <img src={foto} alt="Fotografía ampliada" className="max-h-[90vh] max-w-full rounded-lg shadow-2xl" />
        </div>
      )}
    </article>
  );
};
