import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  ExternalLink,
  Inbox,
  KeyRound,
  Loader2,
  Lock,
  LogOut,
  Mail,
  MailOpen,
  Menu,
  Newspaper,
  Save,
  Settings2,
  ShieldCheck,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { api, borrarToken, fechaHora, guardarToken, leerToken, type MensajeContacto, type Sitio } from '../lib/api';
import { navegar } from '../lib/router';
import { NoticiasAdmin } from './NoticiasAdmin';

type Pestana = 'noticias' | 'mensajes' | 'portal' | 'seguridad';

/* ------------------------------------------------------------------ */
/* Pantalla de acceso                                                   */
/* ------------------------------------------------------------------ */
const LoginAdmin: React.FC<{ onEntrar: (nombre: string) => void }> = ({ onEntrar }) => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [ver, setVer] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const r = await api.login(usuario.trim(), password);
      guardarToken(r.token);
      onEntrar(r.nombre || 'Administrador');
    } catch (err: any) {
      setError(err.message || 'No se pudo iniciar sesión.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a2a4d] relative overflow-hidden flex items-center justify-center px-4 py-10">
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, #c8963e 0, transparent 45%), radial-gradient(circle at 80% 70%, #146c43 0, transparent 45%)',
        }}
      />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur border border-white/20 mx-auto flex items-center justify-center">
            <Building2 className="w-8 h-8 text-[#e6c583]" />
          </div>
          <h1 className="mt-4 text-xl font-extrabold text-white tracking-tight">Alcaldía de San Pedro del Norte</h1>
          <p className="text-[12px] text-sky-200/80 mt-1 uppercase tracking-[0.18em] font-semibold">
            Portal de administración
          </p>
        </div>

        <form
          onSubmit={enviar}
          className="bg-white rounded-2xl shadow-2xl p-6 sm:p-7 border border-white/40"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-lg bg-[#0f3d6e]/8 text-[#0f3d6e] flex items-center justify-center">
              <Lock className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-[14.5px] font-extrabold text-slate-900 leading-tight">Acceso restringido</h2>
              <p className="text-[11.5px] text-slate-500">Ingrese sus credenciales institucionales.</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[12.5px] text-red-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <label className="block">
            <span className="text-[12px] font-bold text-slate-700">Usuario</span>
            <div className="relative mt-1.5">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                required
                autoComplete="username"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="administrador"
                className="w-full pl-9 pr-3 py-2.5 text-[13px] rounded-lg border border-slate-300 focus:border-[#0f3d6e] focus:ring-2 focus:ring-[#0f3d6e]/15 outline-none transition"
              />
            </div>
          </label>

          <label className="block mt-4">
            <span className="text-[12px] font-bold text-slate-700">Contraseña</span>
            <div className="relative mt-1.5">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                required
                type={ver ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2.5 text-[13px] rounded-lg border border-slate-300 focus:border-[#0f3d6e] focus:ring-2 focus:ring-[#0f3d6e]/15 outline-none transition"
              />
              <button
                type="button"
                onClick={() => setVer(!ver)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label={ver ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {ver ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </label>

          <button
            type="submit"
            disabled={cargando}
            className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#0f3d6e] hover:bg-[#0a2a4d] text-white text-[13px] font-bold transition-colors disabled:opacity-60 cursor-pointer"
          >
            {cargando ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            {cargando ? 'Verificando...' : 'Ingresar al panel'}
          </button>

          <button
            type="button"
            onClick={() => navegar('/')}
            className="mt-3 w-full text-[12px] font-semibold text-slate-500 hover:text-[#0f3d6e] cursor-pointer"
          >
            ← Volver al portal público
          </button>
        </form>

        <p className="text-center text-[11px] text-sky-200/60 mt-5">
          Uso exclusivo del personal autorizado de la Alcaldía Municipal.
        </p>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Mensajes de contacto                                                 */
/* ------------------------------------------------------------------ */
const MensajesAdmin: React.FC<{ onSesionExpirada: () => void }> = ({ onSesionExpirada }) => {
  const [mensajes, setMensajes] = useState<MensajeContacto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = async () => {
    try {
      const r = await api.mensajes();
      setMensajes(r.mensajes);
    } catch (e: any) {
      if (/sesión|session/i.test(e.message || '')) return onSesionExpirada();
      setError(e.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const alternarLeido = async (m: MensajeContacto) => {
    try {
      await api.marcarMensaje(m.id, !m.leido);
      setMensajes((prev) => prev.map((x) => (x.id === m.id ? { ...x, leido: !x.leido } : x)));
    } catch (e: any) {
      setError(e.message);
    }
  };

  const eliminar = async (m: MensajeContacto) => {
    if (!window.confirm('¿Eliminar este mensaje permanentemente?')) return;
    try {
      await api.eliminarMensaje(m.id);
      setMensajes((prev) => prev.filter((x) => x.id !== m.id));
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-slate-500 text-sm">
        <Loader2 className="w-5 h-5 animate-spin" /> Cargando mensajes...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">{error}</div>
      )}

      {mensajes.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-16 text-center shadow-sm">
          <Inbox className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="mt-3 font-bold text-slate-700">No hay mensajes recibidos</p>
          <p className="text-[12.5px] text-slate-500 mt-1">
            Los mensajes enviados desde el formulario de contacto aparecerán aquí.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {mensajes.map((m) => (
            <li
              key={m.id}
              className={`bg-white rounded-xl border p-4 shadow-sm ${
                m.leido ? 'border-slate-200' : 'border-[#c8963e]/50 bg-[#c8963e]/[0.04]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[13.5px] font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                    {!m.leido && <span className="w-2 h-2 rounded-full bg-[#c8963e] shrink-0" />}
                    {m.asunto}
                  </p>
                  <p className="text-[11.5px] text-slate-500 mt-0.5">
                    {m.nombre} · {m.correo}
                    {m.telefono ? ` · ${m.telefono}` : ''} · {fechaHora(m.creadoEn)}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => alternarLeido(m)}
                    title={m.leido ? 'Marcar como no leído' : 'Marcar como leído'}
                    className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[#0f3d6e] cursor-pointer"
                  >
                    {m.leido ? <MailOpen className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => eliminar(m)}
                    title="Eliminar mensaje"
                    className="p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="mt-2.5 text-[12.5px] text-slate-700 leading-relaxed whitespace-pre-line">{m.mensaje}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Configuración del portal                                             */
/* ------------------------------------------------------------------ */
const PortalAdmin: React.FC<{ onSesionExpirada: () => void }> = ({ onSesionExpirada }) => {
  const [sitio, setSitio] = useState<Sitio | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [ok, setOk] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .sitio()
      .then((r) => setSitio(r.sitio))
      .catch((e) => setError(e.message));
  }, []);

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sitio) return;
    setGuardando(true);
    setError('');
    setOk('');
    try {
      const r = await api.guardarSitio(sitio);
      setSitio(r.sitio);
      setOk('Información del portal actualizada correctamente.');
      setTimeout(() => setOk(''), 4000);
    } catch (err: any) {
      if (/sesión|session/i.test(err.message || '')) return onSesionExpirada();
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  if (!sitio) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-slate-500 text-sm">
        <Loader2 className="w-5 h-5 animate-spin" /> Cargando configuración...
      </div>
    );
  }

  const campos: Array<{ clave: keyof Sitio; etiqueta: string; tipo?: 'text' | 'textarea'; filas?: number }> = [
    { clave: 'nombre', etiqueta: 'Nombre de la institución' },
    { clave: 'lema', etiqueta: 'Lema' },
    { clave: 'departamento', etiqueta: 'Departamento / ubicación' },
    { clave: 'heroTitulo', etiqueta: 'Título principal del portal' },
    { clave: 'heroSubtitulo', etiqueta: 'Texto introductorio', tipo: 'textarea', filas: 3 },
    { clave: 'alcalde', etiqueta: 'Nombre del alcalde / alcaldesa' },
    { clave: 'cargoAlcalde', etiqueta: 'Cargo' },
    { clave: 'mensajeAlcalde', etiqueta: 'Mensaje del alcalde', tipo: 'textarea', filas: 5 },
    { clave: 'direccion', etiqueta: 'Dirección' },
    { clave: 'telefono', etiqueta: 'Teléfono' },
    { clave: 'correo', etiqueta: 'Correo electrónico' },
    { clave: 'horario', etiqueta: 'Horario de atención' },
    { clave: 'facebook', etiqueta: 'Página de Facebook (URL)' },
  ];

  return (
    <form onSubmit={guardar} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
        <h2 className="text-[14px] font-extrabold text-[#0d2c4d]">Información institucional del portal</h2>
        <p className="text-[11.5px] text-slate-500 mt-0.5">
          Estos datos se muestran en la portada, el pie de página y la sección de contacto.
        </p>
      </div>

      <div className="p-5 space-y-4">
        {ok && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-[12.5px] font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {ok}
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[12.5px] text-red-700">{error}</div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          {campos.map((c) => (
            <label key={String(c.clave)} className={c.tipo === 'textarea' ? 'sm:col-span-2 block' : 'block'}>
              <span className="text-[12px] font-bold text-slate-700">{c.etiqueta}</span>
              {c.tipo === 'textarea' ? (
                <textarea
                  rows={c.filas || 3}
                  value={String(sitio[c.clave] ?? '')}
                  onChange={(e) => setSitio({ ...sitio, [c.clave]: e.target.value })}
                  className="mt-1.5 w-full px-3 py-2.5 text-[13px] rounded-lg border border-slate-300 focus:border-[#0f3d6e] focus:ring-2 focus:ring-[#0f3d6e]/15 outline-none transition resize-y leading-relaxed"
                />
              ) : (
                <input
                  value={String(sitio[c.clave] ?? '')}
                  onChange={(e) => setSitio({ ...sitio, [c.clave]: e.target.value })}
                  className="mt-1.5 w-full px-3 py-2.5 text-[13px] rounded-lg border border-slate-300 focus:border-[#0f3d6e] focus:ring-2 focus:ring-[#0f3d6e]/15 outline-none transition"
                />
              )}
            </label>
          ))}
        </div>
      </div>

      <div className="px-5 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
        <button
          type="submit"
          disabled={guardando}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0f3d6e] hover:bg-[#0a2a4d] text-white text-[13px] font-bold disabled:opacity-60 cursor-pointer"
        >
          {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  );
};

/* ------------------------------------------------------------------ */
/* Seguridad                                                            */
/* ------------------------------------------------------------------ */
const SeguridadAdmin: React.FC<{ onSesionExpirada: () => void; onCambiada: () => void }> = ({
  onSesionExpirada,
  onCambiada,
}) => {
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOk('');
    if (nueva.length < 8) return setError('La nueva contraseña debe tener al menos 8 caracteres.');
    if (nueva !== confirmar) return setError('La confirmación no coincide con la nueva contraseña.');
    setEnviando(true);
    try {
      const r = await api.cambiarPassword(actual, nueva);
      guardarToken(r.token);
      setActual('');
      setNueva('');
      setConfirmar('');
      setOk('Contraseña actualizada correctamente.');
      onCambiada();
    } catch (err: any) {
      if (/sesión|session/i.test(err.message || '')) return onSesionExpirada();
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="max-w-xl">
      <form onSubmit={enviar} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-[14px] font-extrabold text-[#0d2c4d]">Cambiar contraseña</h2>
          <p className="text-[11.5px] text-slate-500 mt-0.5">
            Se recomienda cambiar la contraseña inicial después del primer ingreso.
          </p>
        </div>
        <div className="p-5 space-y-4">
          {ok && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-[12.5px] font-semibold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {ok}
            </div>
          )}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[12.5px] text-red-700">{error}</div>
          )}
          {[
            { etiqueta: 'Contraseña actual', valor: actual, set: setActual },
            { etiqueta: 'Nueva contraseña', valor: nueva, set: setNueva },
            { etiqueta: 'Confirmar nueva contraseña', valor: confirmar, set: setConfirmar },
          ].map((c) => (
            <label key={c.etiqueta} className="block">
              <span className="text-[12px] font-bold text-slate-700">{c.etiqueta}</span>
              <input
                required
                type="password"
                autoComplete="new-password"
                value={c.valor}
                onChange={(e) => c.set(e.target.value)}
                className="mt-1.5 w-full px-3 py-2.5 text-[13px] rounded-lg border border-slate-300 focus:border-[#0f3d6e] focus:ring-2 focus:ring-[#0f3d6e]/15 outline-none transition"
              />
            </label>
          ))}
        </div>
        <div className="px-5 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="submit"
            disabled={enviando}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0f3d6e] hover:bg-[#0a2a4d] text-white text-[13px] font-bold disabled:opacity-60 cursor-pointer"
          >
            {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
            Actualizar contraseña
          </button>
        </div>
      </form>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Panel principal                                                      */
/* ------------------------------------------------------------------ */
export const AdminApp: React.FC = () => {
  const [sesion, setSesion] = useState<{ nombre: string } | null>(null);
  const [verificando, setVerificando] = useState(true);
  const [pestana, setPestana] = useState<Pestana>('noticias');
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    if (!leerToken()) {
      setVerificando(false);
      return;
    }
    api
      .sesion()
      .then((r) => setSesion({ nombre: r.nombre }))
      .catch(() => borrarToken())
      .finally(() => setVerificando(false));
  }, []);

  const salir = () => {
    borrarToken();
    setSesion(null);
  };

  if (verificando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Loader2 className="w-5 h-5 animate-spin" /> Verificando sesión...
        </div>
      </div>
    );
  }

  if (!sesion) return <LoginAdmin onEntrar={(nombre) => setSesion({ nombre })} />;

  const menu: Array<{ id: Pestana; etiqueta: string; icono: React.ReactNode }> = [
    { id: 'noticias', etiqueta: 'Noticias', icono: <Newspaper className="w-4 h-4" /> },
    { id: 'mensajes', etiqueta: 'Mensajes', icono: <Inbox className="w-4 h-4" /> },
    { id: 'portal', etiqueta: 'Portal', icono: <Settings2 className="w-4 h-4" /> },
    { id: 'seguridad', etiqueta: 'Seguridad', icono: <ShieldCheck className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-[#0a2a4d] text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="h-14 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4 text-[#e6c583]" />
              </div>
              <div className="min-w-0">
                <p className="text-[12.5px] font-extrabold leading-tight truncate">Panel de Administración</p>
                <p className="text-[10.5px] text-sky-200/70 leading-tight truncate">Alcaldía de San Pedro del Norte</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => navegar('/')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-bold text-sky-100 hover:bg-white/10 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Ver portal
              </button>
              <button
                onClick={salir}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-bold bg-white/10 hover:bg-white/20 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /> Salir
              </button>
              <button
                onClick={() => setMenuAbierto(!menuAbierto)}
                className="md:hidden p-2 rounded-lg hover:bg-white/10 cursor-pointer"
                aria-label="Menú"
              >
                {menuAbierto ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <nav className={`${menuAbierto ? 'flex' : 'hidden'} md:flex gap-1 pb-2 overflow-x-auto`}>
            {menu.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setPestana(m.id);
                  setMenuAbierto(false);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  pestana === m.id ? 'bg-white text-[#0a2a4d]' : 'text-sky-100 hover:bg-white/10'
                }`}
              >
                {m.icono}
                {m.etiqueta}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="mb-5">
          <h1 className="text-[20px] font-extrabold text-[#0d2c4d] tracking-tight">
            {pestana === 'noticias' && 'Gestión de noticias'}
            {pestana === 'mensajes' && 'Mensajes de la ciudadanía'}
            {pestana === 'portal' && 'Configuración del portal'}
            {pestana === 'seguridad' && 'Seguridad de la cuenta'}
          </h1>
          <p className="text-[12.5px] text-slate-500 mt-0.5">
            Bienvenido, {sesion.nombre}. Administre el contenido público del sitio institucional.
          </p>
        </div>

        {pestana === 'noticias' && <NoticiasAdmin onSesionExpirada={salir} />}
        {pestana === 'mensajes' && <MensajesAdmin onSesionExpirada={salir} />}
        {pestana === 'portal' && <PortalAdmin onSesionExpirada={salir} />}
        {pestana === 'seguridad' && <SeguridadAdmin onSesionExpirada={salir} onCambiada={() => {}} />}
      </main>

      <footer className="border-t border-slate-200 py-4 text-center text-[11px] text-slate-400">
        Alcaldía Municipal de San Pedro del Norte · Sistema de administración de contenidos
      </footer>
    </div>
  );
};
