import React, { useEffect, useState } from 'react';
import { ChevronRight, Loader2, Megaphone, Search, SlidersHorizontal } from 'lucide-react';
import { api, type NoticiaResumen } from '../lib/api';
import { navegar } from '../lib/router';
import { NoticiaCard } from './NoticiaCard';

export const PortalNoticias: React.FC = () => {
  const [noticias, setNoticias] = useState<NoticiaResumen[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [categoria, setCategoria] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .sitio()
      .then((r) => setCategorias(r.categorias))
      .catch(() => setCategorias([]));
  }, []);

  useEffect(() => {
    let vivo = true;
    setCargando(true);
    setError('');
    const temporizador = setTimeout(() => {
      api
        .noticias({ categoria, q: busqueda.trim() })
        .then((r) => vivo && setNoticias(r.noticias))
        .catch((e) => vivo && setError(e.message))
        .finally(() => vivo && setCargando(false));
    }, 220);
    return () => {
      vivo = false;
      clearTimeout(temporizador);
    };
  }, [categoria, busqueda]);

  return (
    <div className="bg-[#f6f7f9]">
      {/* Encabezado de sección */}
      <div className="bg-[#0f3d6e] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.14]">
          <svg viewBox="0 0 1200 240" className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <pattern id="noticias-grid" width="44" height="44" patternUnits="userSpaceOnUse">
                <path d="M44 0H0v44" fill="none" stroke="#ffffff" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="1200" height="240" fill="url(#noticias-grid)" />
          </svg>
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-12">
          <nav className="flex items-center gap-1.5 text-[11px] text-sky-100/70 mb-4">
            <button onClick={() => navegar('/')} className="hover:text-white transition-colors cursor-pointer">
              Inicio
            </button>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-semibold">Noticias</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Noticias y comunicados</h1>
          <p className="text-[14px] text-sky-100/80 mt-2 max-w-2xl">
            Toda la información oficial de la Alcaldía Municipal de San Pedro del Norte: obras, programas sociales,
            comunicados y actividades de la comunidad.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Filtros */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm mb-7">
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por título, tema o palabra clave..."
                className="w-full pl-9 pr-3 py-2.5 text-[13px] rounded-lg border border-slate-300 focus:border-[#0f3d6e] focus:ring-2 focus:ring-[#0f3d6e]/15 outline-none transition"
              />
            </div>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {noticias.length} {noticias.length === 1 ? 'publicación' : 'publicaciones'}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {['todas', ...categorias].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoria(cat)}
                className={`px-3 py-1.5 rounded-full text-[11.5px] font-bold border transition-colors cursor-pointer ${
                  categoria === cat
                    ? 'bg-[#0f3d6e] text-white border-[#0f3d6e]'
                    : 'bg-white text-slate-600 border-slate-300 hover:border-[#0f3d6e]/50 hover:text-[#0f3d6e]'
                }`}
              >
                {cat === 'todas' ? 'Todas' : cat}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
            {error}
          </div>
        )}

        {cargando ? (
          <div className="flex items-center justify-center py-20 text-slate-500 gap-2 text-sm">
            <Loader2 className="w-5 h-5 animate-spin" />
            Cargando noticias...
          </div>
        ) : noticias.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-14 text-center">
            <Megaphone className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="mt-4 font-extrabold text-slate-700">No encontramos publicaciones</p>
            <p className="text-[13px] text-slate-500 mt-1">
              Intente con otra palabra clave o seleccione otra categoría.
            </p>
            <button
              onClick={() => {
                setBusqueda('');
                setCategoria('todas');
              }}
              className="mt-5 px-4 py-2 rounded-lg bg-[#0f3d6e] text-white text-[13px] font-bold cursor-pointer"
            >
              Ver todas las noticias
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {noticias.map((n) => (
              <NoticiaCard key={n.id} noticia={n} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
