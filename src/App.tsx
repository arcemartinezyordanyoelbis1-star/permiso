import React, { useState, useEffect } from 'react';
import { SolicitudPermiso } from './types.ts';
import { getSolicitudes } from './utils/storage.ts';
import { FormularioSolicitud } from './components/FormularioSolicitud.tsx';
import { PanelTalentoHumano } from './components/PanelTalentoHumano.tsx';
import { ComprobanteOficial } from './components/ComprobanteOficial.tsx';
import { ConsultaFolioModal } from './components/ConsultaFolioModal.tsx';
import {
  FileText,
  Users,
  Search,
  CheckCircle2,
  Download,
  Eye,
  PlusCircle,
  Building2,
  ShieldCheck,
  Printer
} from 'lucide-react';

export default function App() {
  const [vista, setVista] = useState<'formulario' | 'talento_humano' | 'comprobante'>('formulario');
  const [solicitudes, setSolicitudes] = useState<SolicitudPermiso[]>([]);
  const [solicitudActiva, setSolicitudActiva] = useState<SolicitudPermiso | null>(null);

  // Modal de éxito tras enviar
  const [solicitudRecienEnviada, setSolicitudRecienEnviada] = useState<SolicitudPermiso | null>(null);
  // Modal de búsqueda
  const [mostrarConsulta, setMostrarConsulta] = useState(false);

  const cargarDatos = () => {
    const data = getSolicitudes();
    setSolicitudes(data);
  };

  useEffect(() => {
    cargarDatos();

    // Comprobar si viene un folio en el query string (ej: ?folio=SPN-RH-2026-0038)
    const params = new URLSearchParams(window.location.search);
    const folioParam = params.get('folio');
    if (folioParam) {
      const data = getSolicitudes();
      const encontrada = data.find(s => s.folio.toUpperCase() === folioParam.toUpperCase());
      if (encontrada) {
        setSolicitudActiva(encontrada);
        setVista('comprobante');
      }
    }
  }, []);

  const handleSolicitudEnviada = (nueva: SolicitudPermiso) => {
    cargarDatos();
    setSolicitudRecienEnviada(nueva);
    setSolicitudActiva(nueva);
  };

  const verComprobanteDirecto = (sol: SolicitudPermiso) => {
    setSolicitudActiva(sol);
    setVista('comprobante');
    setMostrarConsulta(false);
  };

  const pendientesCount = solicitudes.filter(s => s.estado === 'pendiente').length;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col">
      {/* Barra de Navegación Superior - Sigue el contrato de 3 zonas */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs no-print">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Zona 1: Brand Wordmark */}
          <div
            onClick={() => setVista('formulario')}
            className="flex items-center gap-2 cursor-pointer select-none shrink-0"
          >
            <img
              src="/assets/logos/logo_escudo_spn.png"
              alt="Escudo Oficial San Pedro del Norte"
              className="w-9 h-9 object-contain drop-shadow-xs"
            />
            <div className="flex flex-col">
              <span className="font-bold text-sm sm:text-base tracking-tight text-slate-900 whitespace-nowrap">
                Alcaldía San Pedro del Norte
              </span>
              <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap hidden sm:inline">
                Chinandega · Sistema de Permisos Laborales
              </span>
            </div>
          </div>

          {/* Zona 2: Navegación de vistas */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setVista('formulario')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                vista === 'formulario'
                  ? 'bg-sky-50 text-sky-800 border border-sky-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4 text-sky-600" />
              <span>Solicitar Permiso</span>
            </button>

            <button
              onClick={() => setVista('talento_humano')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                vista === 'talento_humano'
                  ? 'bg-sky-50 text-sky-800 border border-sky-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4 text-blue-600" />
              <span>Talento Humano</span>
              {pendientesCount > 0 && (
                <span className="ml-1 bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {pendientesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMostrarConsulta(true)}
              className="px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap cursor-pointer hidden md:flex items-center gap-1.5"
            >
              <Search className="w-4 h-4 text-slate-500" />
              <span>Consultar Folio</span>
            </button>
          </nav>

          {/* Zona 3: Acción primaria / Botón de consulta móvil */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setMostrarConsulta(true)}
              className="p-2 text-slate-600 hover:text-slate-900 md:hidden rounded-lg hover:bg-slate-100 cursor-pointer"
              title="Buscar Folio"
            >
              <Search className="w-5 h-5" />
            </button>

            {vista !== 'formulario' && (
              <button
                onClick={() => setVista('formulario')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-sky-700 hover:bg-sky-800 rounded-lg transition-colors whitespace-nowrap shadow-xs cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Nueva Solicitud</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="grow max-w-6xl w-full mx-auto px-2 sm:px-4 py-6">
        {vista === 'formulario' && (
          <FormularioSolicitud onSolicitudEnviada={handleSolicitudEnviada} />
        )}

        {vista === 'talento_humano' && (
          <PanelTalentoHumano
            solicitudes={solicitudes}
            onActualizarLista={cargarDatos}
          />
        )}

        {vista === 'comprobante' && solicitudActiva && (
          <ComprobanteOficial
            solicitud={solicitudActiva}
            onVolver={() => setVista('formulario')}
          />
        )}
      </main>

      {/* Modal tras Enviar Solicitud */}
      {solicitudRecienEnviada && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-xl font-black text-slate-900">
              ¡Solicitud Enviada con Éxito!
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Su solicitud de permiso laboral ha sido radicada correctamente en el sistema de Talento Humano.
            </p>

            <div className="my-4 p-3.5 bg-sky-50 border border-sky-200 rounded-xl text-left font-mono">
              <div className="text-[11px] text-sky-700 font-sans font-semibold">
                NÚMERO DE FOLIO OFICIAL:
              </div>
              <div className="text-lg font-black text-sky-950 mt-0.5">
                {solicitudRecienEnviada.folio}
              </div>
              <div className="text-xs text-slate-600 font-sans mt-1">
                Trabajador: <strong>{solicitudRecienEnviada.nombre}</strong>
              </div>
              <div className="text-xs text-slate-600 font-sans">
                Días: {solicitudRecienEnviada.diaInicio} - {solicitudRecienEnviada.diaFin} de {solicitudRecienEnviada.mesPermiso}
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mb-5">
              Guarde su comprobante impreso o en PDF para presentarlo físicamente si le es requerido.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setSolicitudActiva(solicitudRecienEnviada);
                  setVista('comprobante');
                  setSolicitudRecienEnviada(null);
                }}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-linear-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Ver y Descargar Comprobante PDF</span>
              </button>

              <button
                onClick={() => {
                  setSolicitudRecienEnviada(null);
                  setVista('talento_humano');
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Users className="w-4 h-4 text-slate-600" />
                <span>Ver en Bandeja de Talento Humano</span>
              </button>

              <button
                onClick={() => setSolicitudRecienEnviada(null)}
                className="w-full py-2 text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Cerrar y hacer otra solicitud
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Consulta de Folio */}
      {mostrarConsulta && (
        <ConsultaFolioModal
          solicitudes={solicitudes}
          onSeleccionarSolicitud={verComprobanteDirecto}
          onCerrar={() => setMostrarConsulta(false)}
        />
      )}

      {/* Footer Global Institucional */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-6 px-4 no-print">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-700" />
            <span>Alcaldía Municipal de San Pedro del Norte · Chinandega, Nicaragua</span>
          </div>
          <div>
            <span>Sistema Municipal de Trámites y Recursos Humanos © 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
