import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Loader2,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  api,
  fechaCorta,
  type DatosNoticia,
  type Estadisticas,
  type NoticiaDetalle,
  type NoticiaResumen,
} from '../lib/api';
import { comprimirImagen, comprimirVarias } from '../lib/imagenes';

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

function aInputLocal(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 16);
}

const FORM_VACIO = (): DatosNoticia => ({
  titulo: '',
  categoria: 'Comunicados',
  resumen: '',
  contenido: '',
  portada: '',
  galeria: [],
  autor: 'Oficina de Comunicación',
  fecha: aInputLocal(new Date().toISOString()),
  destacada: false,
  publicada: true,
});

interface Props {
  onSesionExpirada: () => void;
}

export const NoticiasAdmin: React.FC<Props> = ({ onSesionExpirada }) => {
  const [noticias, setNoticias] = useState<NoticiaResumen[]>([]);
  const [stats, setStats] = useState<Estadisticas | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');

  const [editorAbierto, setEditorAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState<DatosNoticia>(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [erroresForm, setErroresForm] = useState<string[]>([]);
  const [subiendo, setSubiendo] = useState<'portada' | 'galeria' | null>(null);

  const [porEliminar, setPorEliminar] = useState<NoticiaResumen | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const portadaRef = useRef<HTMLInputElement>(null);
  const galeriaRef = useRef<HTMLInputElement>(null);

  const manejarError = (e: any) => {
    const msg = e?.message || 'Ocurrió un error.';
    if (/sesión|session/i.test(msg)) {
      onSesionExpirada();
      return;
    }
    setError(msg);
  };

  const cargar = async (silencioso = false) => {
    if (!silencioso) setCargando(true);
    try {
      const [lista, est] = await Promise.all([api.noticias(), api.estadisticas()]);
      setNoticias(lista.noticias);
      setStats(est);
      setError('');
    } catch (e) {
      manejarError(e);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return noticias;
    return noticias.filter((n) =>
      `${n.titulo} ${n.categoria} ${n.resumen} ${n.autor}`.toLowerCase().includes(q),
    );
  }, [noticias, busqueda]);

  const abrirNueva = () => {
    setEditandoId(null);
    setForm(FORM_VACIO());
    setErroresForm([]);
    setEditorAbierto(true);
  };

  const abrirEditar = async (noticia: NoticiaResumen) => {
    setError('');
    try {
      const { noticia: completa } = await api.noticia(noticia.id);
      setEditandoId(completa.id);
      setForm({
        titulo: completa.titulo,
        categoria: completa.categoria,
        resumen: completa.resumen,
        contenido: completa.contenido || '',
        portada: completa.portada || '',
        galeria: Array.isArray(completa.galeria) ? completa.galeria : [],
        autor: completa.autor,
        fecha: aInputLocal(completa.fecha),
        destacada: completa.destacada,
        publicada: completa.publicada,
      });
      setErroresForm([]);
      setEditorAbierto(true);
    } catch (e) {
      manejarError(e);
    }
  };

  const subirPortada = async (archivo: File | undefined) => {
    if (!archivo) return;
    setSubiendo('portada');
    try {
      const dataUrl = await comprimirImagen(archivo);
      setForm((f) => ({ ...f, portada: dataUrl }));
    } catch (e: any) {
      setErroresForm([e.message]);
    } finally {
      setSubiendo(null);
    }
  };

  const subirGaleria = async (archivos: FileList | null) => {
    if (!archivos || !archivos.length) return;
    setSubiendo('galeria');
    try {
      const espacio = Math.max(0, 8 - form.galeria.length);
      if (espacio === 0) {
        setErroresForm(['La galería admite un máximo de 8 fotos.']);
        return;
      }
      const nuevas = await comprimirVarias(archivos, espacio);
      setForm((f) => ({ ...f, galeria: [...f.galeria, ...nuevas].slice(0, 8) }));
    } catch (e: any) {
      setErroresForm([e.message]);
    } finally {
      setSubiendo(null);
    }
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setErroresForm([]);
    try {
      const payload: DatosNoticia = {
        ...form,
        fecha: form.fecha ? new Date(form.fecha).toISOString() : new Date().toISOString(),
      };
      if (editandoId) {
        await api.actualizarNoticia(editandoId, payload);
        setAviso('Noticia actualizada correctamente.');
      } else {
        await api.crearNoticia(payload);
        setAviso('Noticia publicada correctamente.');
      }
      setEditorAbierto(false);
      await cargar(true);
      setTimeout(() => setAviso(''), 4000);
    } catch (err: any) {
      if (/sesión|session/i.test(err.message || '')) return onSesionExpirada();
      setErroresForm(err.message ? [err.message] : ['No se pudo guardar la noticia.']);
    } finally {
      setGuardando(false);
    }
  };

  const alternarDestacada = async (noticia: NoticiaResumen) => {
    try {
      const { noticia: completa } = await api.noticia(noticia.id);
      await api.actualizarNoticia(noticia.id, {
        titulo: completa.titulo,
        categoria: completa.categoria,
        resumen: completa.resumen,
        contenido: completa.contenido || '',
        portada: completa.portada || '',
        galeria: Array.isArray(completa.galeria) ? completa.galeria : [],
        autor: completa.autor,
        fecha: completa.fecha,
        destacada: !completa.destacada,
        publicada: completa.publicada,
      });
      await cargar(true);
    } catch (e) {
      manejarError(e);
    }
  };

  const alternarPublicada = async (noticia: NoticiaResumen) => {
    try {
      const { noticia: completa } = await api.noticia(noticia.id);
      await api.actualizarNoticia(noticia.id, {
        titulo: completa.titulo,
        categoria: completa.categoria,
        resumen: completa.resumen,
        contenido: completa.contenido || '',
        portada: completa.portada || '',
        galeria: Array.isArray(completa.galeria) ? completa.galeria : [],
        autor: completa.autor,
        fecha: completa.fecha,
        destacada: completa.destacada,
        publicada: !completa.publicada,
      });
      await cargar(true);
    } catch (e) {
      manejarError(e);
    }
  };

  const confirmarEliminar = async () => {
    if (!porEliminar) return;
    setEliminando(true);
    try {
      await api.eliminarNoticia(porEliminar.id);
      setPorEliminar(null);
      setAviso('Noticia eliminada.');
      await cargar(true);
      setTimeout(() => setAviso(''), 4000);
    } catch (e) {
      manejarError(e);
    } finally {
      setEliminando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { etiqueta: 'Noticias totales', valor: stats?.total ?? 0, color: 'text-[#0f3d6e]', fondo: 'bg-[#0f3d6e]/8' },
          { etiqueta: 'Publicadas', valor: stats?.publicadas ?? 0, color: 'text-[#146c43]', fondo: 'bg-[#146c43]/10' },
          { etiqueta: 'Destacadas', valor: stats?.destacadas ?? 0, color: 'text-[#a87823]', fondo: 'bg-[#c8963e]/15' },
          { etiqueta: 'Lecturas', valor: stats?.vistas ?? 0, color: 'text-slate-700', fondo: 'bg-slate-100' },
        ].map((s) => (
          <div key={s.etiqueta} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className={`w-9 h-9 rounded-lg ${s.fondo} flex items-center justify-center mb-2.5`}>
              <span className={`text-[13px] font-black ${s.color}`}>#</span>
            </div>
            <p className="text-2xl font-black text-slate-900 leading-none">{s.valor}</p>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mt-1.5">{s.etiqueta}</p>
          </div>
        ))}
      </div>

      {aviso && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] font-semibold text-emerald-800">
          {aviso}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700 flex items-center justify-between gap-3">
          <span>{error}</span>
          <button onClick={() => setError('')} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Barra de acciones */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar noticia por título, categoría o autor..."
            className="w-full pl-9 pr-3 py-2.5 text-[13px] rounded-lg border border-slate-300 focus:border-[#0f3d6e] focus:ring-2 focus:ring-[#0f3d6e]/15 outline-none transition"
          />
        </div>
        <button
          onClick={abrirNueva}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#0f3d6e] hover:bg-[#0a2a4d] text-white text-[13px] font-bold transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Nueva noticia
        </button>
      </div>

      {/* Listado */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="hidden md:grid grid-cols-[80px_1fr_150px_120px_150px_130px] gap-3 px-4 py-3 bg-slate-50 border-b border-slate-200 text-[10.5px] font-black uppercase tracking-wider text-slate-500">
          <span>Foto</span>
          <span>Noticia</span>
          <span>Categoría</span>
          <span>Fecha</span>
          <span>Estado</span>
          <span className="text-right">Acciones</span>
        </div>

        {cargando ? (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-500 text-sm">
            <Loader2 className="w-5 h-5 animate-spin" /> Cargando noticias...
          </div>
        ) : visibles.length === 0 ? (
          <div className="py-16 text-center">
            <ImageIcon className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="mt-3 font-bold text-slate-700">No hay noticias que mostrar</p>
            <p className="text-[12.5px] text-slate-500 mt-1">Cree la primera publicación con el botón "Nueva noticia".</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {visibles.map((n) => (
              <li
                key={n.id}
                className="grid md:grid-cols-[80px_1fr_150px_120px_150px_130px] gap-3 px-4 py-3 items-center hover:bg-slate-50/70 transition-colors"
              >
                <div className="w-16 h-12 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  {n.portada ? (
                    <img src={n.portada} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#0f3d6e] to-[#146c43]" />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-slate-800 leading-snug line-clamp-2">{n.titulo}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                    <span>{n.autor}</span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {n.vistas}
                    </span>
                  </p>
                </div>

                <div className="text-[11.5px]">
                  <span className="inline-block px-2 py-1 rounded bg-[#0f3d6e]/8 text-[#0f3d6e] font-bold">
                    {n.categoria}
                  </span>
                </div>

                <div className="text-[11.5px] text-slate-600 flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                  {fechaCorta(n.fecha)}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => alternarPublicada(n)}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10.5px] font-bold cursor-pointer transition-colors ${
                      n.publicada
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                    }`}
                    title={n.publicada ? 'Ocultar del sitio público' : 'Publicar en el sitio'}
                  >
                    {n.publicada ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {n.publicada ? 'Publicada' : 'Borrador'}
                  </button>
                  {n.destacada && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10.5px] font-bold bg-[#c8963e]/15 text-[#8a6117]">
                      <Star className="w-3 h-3 fill-current" />
                      Destacada
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => alternarDestacada(n)}
                    title={n.destacada ? 'Quitar de destacadas' : 'Marcar como destacada'}
                    className="p-2 rounded-lg text-slate-500 hover:text-[#a87823] hover:bg-[#c8963e]/10 transition-colors cursor-pointer"
                  >
                    <Star className={`w-4 h-4 ${n.destacada ? 'fill-[#c8963e] text-[#c8963e]' : ''}`} />
                  </button>
                  <button
                    onClick={() => abrirEditar(n)}
                    title="Editar noticia"
                    className="p-2 rounded-lg text-slate-500 hover:text-[#0f3d6e] hover:bg-[#0f3d6e]/8 transition-colors cursor-pointer"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPorEliminar(n)}
                    title="Eliminar noticia"
                    className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Editor */}
      {editorAbierto && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm overflow-y-auto p-3 sm:p-6">
          <form
            onSubmit={guardar}
            className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="px-5 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-50">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEditorAbierto(false)}
                  className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-200 cursor-pointer"
                  aria-label="Volver"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-[15px] font-extrabold text-[#0d2c4d]">
                    {editandoId ? 'Editar noticia' : 'Nueva noticia'}
                  </h2>
                  <p className="text-[11.5px] text-slate-500">
                    Complete la información y adjunte las fotografías de la publicación.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditorAbierto(false)}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-200 cursor-pointer"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-5 max-h-[calc(100vh-190px)] overflow-y-auto">
              {erroresForm.length > 0 && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-[12.5px] font-bold text-red-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> Revise los siguientes datos:
                  </p>
                  <ul className="mt-1.5 space-y-1 text-[12px] text-red-700 list-disc list-inside">
                    {erroresForm.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}

              <label className="block">
                <span className="text-[12px] font-bold text-slate-700">
                  Título de la noticia <span className="text-red-500">*</span>
                </span>
                <input
                  required
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  maxLength={160}
                  placeholder="Ej. Inauguran nuevas calles en el barrio central"
                  className="mt-1.5 w-full px-3 py-2.5 text-[13px] rounded-lg border border-slate-300 focus:border-[#0f3d6e] focus:ring-2 focus:ring-[#0f3d6e]/15 outline-none transition"
                />
                <span className="block text-[10.5px] text-slate-400 mt-1">{form.titulo.length}/160 caracteres</span>
              </label>

              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-[12px] font-bold text-slate-700">Categoría</span>
                  <select
                    value={form.categoria}
                    onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                    className="mt-1.5 w-full px-3 py-2.5 text-[13px] rounded-lg border border-slate-300 focus:border-[#0f3d6e] focus:ring-2 focus:ring-[#0f3d6e]/15 outline-none transition bg-white"
                  >
                    {CATEGORIAS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-[12px] font-bold text-slate-700">Fecha de publicación</span>
                  <input
                    type="datetime-local"
                    value={form.fecha}
                    onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                    className="mt-1.5 w-full px-3 py-2.5 text-[13px] rounded-lg border border-slate-300 focus:border-[#0f3d6e] focus:ring-2 focus:ring-[#0f3d6e]/15 outline-none transition"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-[12px] font-bold text-slate-700">Autor / oficina responsable</span>
                <input
                  value={form.autor}
                  onChange={(e) => setForm({ ...form, autor: e.target.value })}
                  maxLength={80}
                  className="mt-1.5 w-full px-3 py-2.5 text-[13px] rounded-lg border border-slate-300 focus:border-[#0f3d6e] focus:ring-2 focus:ring-[#0f3d6e]/15 outline-none transition"
                />
              </label>

              <label className="block">
                <span className="text-[12px] font-bold text-slate-700">
                  Resumen <span className="text-red-500">*</span>
                </span>
                <textarea
                  required
                  rows={2}
                  value={form.resumen}
                  onChange={(e) => setForm({ ...form, resumen: e.target.value })}
                  maxLength={400}
                  placeholder="Breve descripción que aparecerá en las tarjetas del portal."
                  className="mt-1.5 w-full px-3 py-2.5 text-[13px] rounded-lg border border-slate-300 focus:border-[#0f3d6e] focus:ring-2 focus:ring-[#0f3d6e]/15 outline-none transition resize-y"
                />
              </label>

              <label className="block">
                <span className="text-[12px] font-bold text-slate-700">
                  Contenido completo <span className="text-red-500">*</span>
                </span>
                <textarea
                  required
                  rows={9}
                  value={form.contenido}
                  onChange={(e) => setForm({ ...form, contenido: e.target.value })}
                  placeholder="Escriba la noticia completa. Separe los párrafos con una línea en blanco."
                  className="mt-1.5 w-full px-3 py-2.5 text-[13px] rounded-lg border border-slate-300 focus:border-[#0f3d6e] focus:ring-2 focus:ring-[#0f3d6e]/15 outline-none transition resize-y leading-relaxed"
                />
              </label>

              {/* Portada */}
              <div>
                <span className="text-[12px] font-bold text-slate-700">Fotografía de portada</span>
                <div className="mt-1.5 grid sm:grid-cols-[200px_1fr] gap-3">
                  <div className="aspect-[16/10] rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
                    {form.portada ? (
                      <img src={form.portada} alt="Portada" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-slate-400">
                        <ImageIcon className="w-7 h-7 mx-auto" />
                        <p className="text-[10.5px] mt-1 font-semibold">Sin portada</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <input
                      ref={portadaRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => subirPortada(e.target.files?.[0])}
                    />
                    <button
                      type="button"
                      onClick={() => portadaRef.current?.click()}
                      disabled={subiendo === 'portada'}
                      className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-[12.5px] font-bold text-slate-700 cursor-pointer disabled:opacity-60"
                    >
                      {subiendo === 'portada' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      {form.portada ? 'Cambiar fotografía' : 'Subir fotografía'}
                    </button>
                    {form.portada && (
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, portada: '' })}
                        className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[12px] font-semibold text-red-600 hover:bg-red-50 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Quitar portada
                      </button>
                    )}
                    <p className="text-[10.5px] text-slate-400 leading-relaxed">
                      JPG, PNG o WEBP. La imagen se optimiza automáticamente antes de guardarse.
                    </p>
                  </div>
                </div>
              </div>

              {/* Galería */}
              <div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[12px] font-bold text-slate-700">
                    Galería de fotos ({form.galeria.length}/8)
                  </span>
                  <input
                    ref={galeriaRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      subirGaleria(e.target.files);
                      if (galeriaRef.current) galeriaRef.current.value = '';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => galeriaRef.current?.click()}
                    disabled={subiendo === 'galeria' || form.galeria.length >= 8}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#146c43]/10 text-[#146c43] text-[11.5px] font-bold hover:bg-[#146c43]/15 cursor-pointer disabled:opacity-50"
                  >
                    {subiendo === 'galeria' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    Agregar fotos
                  </button>
                </div>

                {form.galeria.length === 0 ? (
                  <p className="mt-2 text-[11.5px] text-slate-400">
                    Puede adjuntar hasta 8 fotografías adicionales para la noticia.
                  </p>
                ) : (
                  <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {form.galeria.map((src, i) => (
                      <div key={i} className="relative aspect-[4/3] rounded-lg overflow-hidden border border-slate-200 group">
                        <img src={src} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, galeria: form.galeria.filter((_, j) => j !== i) })}
                          className="absolute top-1 right-1 p-1 rounded-md bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          aria-label="Quitar foto"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:border-[#0f3d6e]/40">
                  <input
                    type="checkbox"
                    checked={form.publicada}
                    onChange={(e) => setForm({ ...form, publicada: e.target.checked })}
                    className="w-4 h-4 accent-[#0f3d6e]"
                  />
                  <span>
                    <span className="block text-[12.5px] font-bold text-slate-800">Publicar en el sitio</span>
                    <span className="block text-[10.5px] text-slate-500">
                      Si se desmarca, quedará como borrador.
                    </span>
                  </span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:border-[#c8963e]/60">
                  <input
                    type="checkbox"
                    checked={form.destacada}
                    onChange={(e) => setForm({ ...form, destacada: e.target.checked })}
                    className="w-4 h-4 accent-[#c8963e]"
                  />
                  <span>
                    <span className="block text-[12.5px] font-bold text-slate-800">Marcar como destacada</span>
                    <span className="block text-[10.5px] text-slate-500">Aparece primero en el portal.</span>
                  </span>
                </label>
              </div>
            </div>

            <div className="px-5 sm:px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-2 sm:justify-end">
              <button
                type="button"
                onClick={() => setEditorAbierto(false)}
                className="px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-[13px] font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#0f3d6e] hover:bg-[#0a2a4d] text-white text-[13px] font-bold disabled:opacity-60 cursor-pointer"
              >
                {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pencil className="w-4 h-4" />}
                {guardando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Publicar noticia'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Confirmación de eliminación */}
      {porEliminar && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="mt-4 text-[16px] font-extrabold text-slate-900">¿Eliminar esta noticia?</h3>
            <p className="text-[13px] text-slate-600 mt-1.5 leading-relaxed">
              Se eliminará permanentemente <strong className="text-slate-800">"{porEliminar.titulo}"</strong> junto con
              sus fotografías. Esta acción no se puede deshacer.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setPorEliminar(null)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 text-[13px] font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminar}
                disabled={eliminando}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[13px] font-bold disabled:opacity-60 cursor-pointer"
              >
                {eliminando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
