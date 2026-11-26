import React, { useState } from 'react';
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
} from 'lucide-react';
import { api, type Sitio } from '../lib/api';
import { navegar } from '../lib/router';

export const PortalContacto: React.FC<{ sitio: Sitio | null }> = ({ sitio }) => {
  const [form, setForm] = useState({ nombre: '', correo: '', telefono: '', asunto: '', mensaje: '' });
  const [enviando, setEnviando] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState('');

  const cambiar = (campo: keyof typeof form, valor: string) => setForm((f) => ({ ...f, [campo]: valor }));

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      await api.contacto(form);
      setOk(true);
      setForm({ nombre: '', correo: '', telefono: '', asunto: '', mensaje: '' });
    } catch (err: any) {
      setError(err.message || 'No se pudo enviar el mensaje.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="bg-[#f6f7f9]">
      <div className="bg-[#0f3d6e] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.14]">
          <svg viewBox="0 0 1200 240" className="w-full h-full" preserveAspectRatio="none">
            <rect width="1200" height="240" fill="url(#noticias-grid)" />
          </svg>
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-12">
          <nav className="flex items-center gap-1.5 text-[11px] text-sky-100/70 mb-4">
            <button onClick={() => navegar('/')} className="hover:text-white transition-colors cursor-pointer">
              Inicio
            </button>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-semibold">Contacto</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Contacto y atención ciudadana</h1>
          <p className="text-[14px] text-sky-100/80 mt-2 max-w-2xl">
            Estamos para servirle. Envíenos su consulta, solicitud o sugerencia y el equipo municipal le dará
            seguimiento.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 grid lg:grid-cols-[0.9fr_1.1fr] gap-8">
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-[15px] font-extrabold text-[#0d2c4d] mb-4">Datos de la Alcaldía</h2>
            <ul className="space-y-4 text-[13px]">
              <li className="flex gap-3">
                <span className="w-9 h-9 rounded-lg bg-[#0f3d6e]/8 text-[#0f3d6e] flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </span>
                <div>
                  <p className="font-bold text-slate-800">Dirección</p>
                  <p className="text-slate-600 leading-relaxed">
                    {sitio?.direccion || 'Costado Sur del Parque Municipal, San Pedro del Norte, Chinandega'}
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-9 h-9 rounded-lg bg-[#146c43]/10 text-[#146c43] flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </span>
                <div>
                  <p className="font-bold text-slate-800">Teléfono</p>
                  <a
                    href={`tel:${(sitio?.telefono || '').replace(/\s/g, '')}`}
                    className="text-slate-600 hover:text-[#0f3d6e]"
                  >
                    {sitio?.telefono || '+505 2345 6789'}
                  </a>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-9 h-9 rounded-lg bg-[#c8963e]/15 text-[#a87823] flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </span>
                <div>
                  <p className="font-bold text-slate-800">Correo electrónico</p>
                  <a
                    href={`mailto:${sitio?.correo || ''}`}
                    className="text-slate-600 hover:text-[#0f3d6e] break-all"
                  >
                    {sitio?.correo || 'info@alcaldiasanpedrodelnorte.gob.ni'}
                  </a>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </span>
                <div>
                  <p className="font-bold text-slate-800">Horario de atención</p>
                  <p className="text-slate-600">{sitio?.horario || 'Lunes a viernes, 8:00 a.m. — 5:00 p.m.'}</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-[#0f3d6e] rounded-2xl p-6 text-white">
            <MessageSquare className="w-6 h-6 text-[#d8b36a]" />
            <h3 className="mt-3 text-[15px] font-extrabold">Atención presencial</h3>
            <p className="text-[12.5px] text-sky-100/80 mt-1.5 leading-relaxed">
              Visítenos en las oficinas de la Alcaldía Municipal. Ventanilla de atención ciudadana en la planta baja
              del edificio municipal.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-extrabold text-[#0d2c4d]">Envíenos un mensaje</h2>
          <p className="text-[12.5px] text-slate-500 mt-1 mb-5">
            Los campos marcados con <span className="text-red-500">*</span> son obligatorios.
          </p>

          {ok && (
            <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-[13px] font-bold text-emerald-800">¡Mensaje enviado!</p>
                <p className="text-[12px] text-emerald-700">
                  Su mensaje fue recibido por la Alcaldía. Le responderemos a la brevedad posible.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={enviar} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-[12px] font-bold text-slate-700">
                  Nombre completo <span className="text-red-500">*</span>
                </span>
                <input
                  required
                  value={form.nombre}
                  onChange={(e) => cambiar('nombre', e.target.value)}
                  className="mt-1.5 w-full px-3 py-2.5 text-[13px] rounded-lg border border-slate-300 focus:border-[#0f3d6e] focus:ring-2 focus:ring-[#0f3d6e]/15 outline-none transition"
                  placeholder="Ej. María López"
                />
              </label>
              <label className="block">
                <span className="text-[12px] font-bold text-slate-700">
                  Correo electrónico <span className="text-red-500">*</span>
                </span>
                <input
                  required
                  type="email"
                  value={form.correo}
                  onChange={(e) => cambiar('correo', e.target.value)}
                  className="mt-1.5 w-full px-3 py-2.5 text-[13px] rounded-lg border border-slate-300 focus:border-[#0f3d6e] focus:ring-2 focus:ring-[#0f3d6e]/15 outline-none transition"
                  placeholder="correo@ejemplo.com"
                />
              </label>
              <label className="block">
                <span className="text-[12px] font-bold text-slate-700">Teléfono</span>
                <input
                  value={form.telefono}
                  onChange={(e) => cambiar('telefono', e.target.value)}
                  className="mt-1.5 w-full px-3 py-2.5 text-[13px] rounded-lg border border-slate-300 focus:border-[#0f3d6e] focus:ring-2 focus:ring-[#0f3d6e]/15 outline-none transition"
                  placeholder="+505 8888 8888"
                />
              </label>
              <label className="block">
                <span className="text-[12px] font-bold text-slate-700">Asunto</span>
                <input
                  value={form.asunto}
                  onChange={(e) => cambiar('asunto', e.target.value)}
                  className="mt-1.5 w-full px-3 py-2.5 text-[13px] rounded-lg border border-slate-300 focus:border-[#0f3d6e] focus:ring-2 focus:ring-[#0f3d6e]/15 outline-none transition"
                  placeholder="Motivo de su mensaje"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-[12px] font-bold text-slate-700">
                Mensaje <span className="text-red-500">*</span>
              </span>
              <textarea
                required
                rows={6}
                value={form.mensaje}
                onChange={(e) => cambiar('mensaje', e.target.value)}
                className="mt-1.5 w-full px-3 py-2.5 text-[13px] rounded-lg border border-slate-300 focus:border-[#0f3d6e] focus:ring-2 focus:ring-[#0f3d6e]/15 outline-none transition resize-y"
                placeholder="Escriba su consulta o solicitud..."
              />
            </label>

            <button
              type="submit"
              disabled={enviando}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0f3d6e] hover:bg-[#0a2a4d] disabled:opacity-60 text-white text-[13px] font-bold transition-colors cursor-pointer"
            >
              {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {enviando ? 'Enviando...' : 'Enviar mensaje'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
