import React, { useState } from 'react';
import { SolicitudPermiso, EstadoSolicitud } from '../types.ts';
import { updateSolicitud, exportarCSV, resetSolicitudes, AREAS_MUNICIPALES } from '../utils/storage.ts';
import { ComprobanteOficial } from './ComprobanteOficial.tsx';
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  FileDown,
  Search,
  Filter,
  Eye,
  ShieldCheck,
  Building,
  RotateCcw,
  Check,
  AlertTriangle,
  FileText
} from 'lucide-react';

interface PanelTalentoHumanoProps {
  solicitudes: SolicitudPermiso[];
  onActualizarLista: () => void;
}

export const PanelTalentoHumano: React.FC<PanelTalentoHumanoProps> = ({
  solicitudes,
  onActualizarLista,
}) => {
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroArea, setFiltroArea] = useState<string>('todas');
  
  // Solicitud seleccionada para gestión
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<SolicitudPermiso | null>(null);
  const [mostrarModalGestion, setMostrarModalGestion] = useState(false);
  const [mostrarVistaImpresion, setMostrarVistaImpresion] = useState(false);

  // Campos de edición de RRHH
  const [obsInput, setObsInput] = useState('');
  const [responsableInput, setResponsableInput] = useState('Lic. Claudia Patricia Gómez - Dir. Talento Humano');

  // Metricas
  const total = solicitudes.length;
  const pendientes = solicitudes.filter(s => s.estado === 'pendiente').length;
  const aprobadasRRHH = solicitudes.filter(s => s.estado === 'aprobado_rrhh').length;
  const aprobadasAlcalde = solicitudes.filter(s => s.estado === 'aprobado_alcalde').length;
  const rechazadas = solicitudes.filter(s => s.estado === 'rechazado').length;

  const totalDiasSolicitados = solicitudes.reduce((acc, curr) => acc + (parseFloat(curr.totalDias) || 0), 0);

  // Filtrado
  const filtradas = solicitudes.filter(s => {
    const coincideTexto =
      s.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      s.cedula.toLowerCase().includes(busqueda.toLowerCase()) ||
      s.folio.toLowerCase().includes(busqueda.toLowerCase()) ||
      s.cargo.toLowerCase().includes(busqueda.toLowerCase());

    const coincideEstado =
      filtroEstado === 'todos' || s.estado === filtroEstado;

    const coincideArea =
      filtroArea === 'todas' || s.area === filtroArea;

    return coincideTexto && coincideEstado && coincideArea;
  });

  const abrirGestion = (solicitud: SolicitudPermiso) => {
    setSolicitudSeleccionada(solicitud);
    setObsInput(solicitud.observacionesRRHH || '');
    if (solicitud.responsableRRHH) {
      setResponsableInput(solicitud.responsableRRHH);
    }
    setMostrarModalGestion(true);
  };

  const cambiarEstado = (nuevoEstado: EstadoSolicitud) => {
    if (!solicitudSeleccionada) return;

    updateSolicitud(solicitudSeleccionada.id, {
      estado: nuevoEstado,
      observacionesRRHH: obsInput.trim(),
      responsableRRHH: responsableInput.trim(),
      fechaAprobacion: new Date().toISOString(),
    });

    onActualizarLista();
    setMostrarModalGestion(false);
    setSolicitudSeleccionada(null);
  };

  const verComprobante = (solicitud: SolicitudPermiso) => {
    setSolicitudSeleccionada(solicitud);
    setMostrarVistaImpresion(true);
  };

  const getBadgeEstado = (estado: EstadoSolicitud) => {
    switch (estado) {
      case 'pendiente':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5" />
            Pendiente
          </span>
        );
      case 'aprobado_rrhh':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <ShieldCheck className="w-3.5 h-3.5" />
            Aprobado RRHH
          </span>
        );
      case 'aprobado_alcalde':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Visto Bueno Alcaldía
          </span>
        );
      case 'rechazado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            <XCircle className="w-3.5 h-3.5" />
            Denegado
          </span>
        );
    }
  };

  if (mostrarVistaImpresion && solicitudSeleccionada) {
    return (
      <ComprobanteOficial
        solicitud={solicitudSeleccionada}
        onVolver={() => setMostrarVistaImpresion(false)}
      />
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Encabezado del Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Bandeja de Talento Humano (RRHH)
            </h2>
            <span className="bg-sky-100 text-sky-800 font-bold text-xs px-2.5 py-0.5 rounded-full">
              Oficial
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Gestión, revisión, firmas de autorización y emisión de comprobantes para trabajadores de la Alcaldía de San Pedro del Norte.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => exportarCSV(solicitudes)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-slate-600" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={() => {
              if (confirm('¿Restablecer solicitudes de ejemplo para demostración?')) {
                resetSolicitudes();
                onActualizarLista();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Recargar datos de ejemplo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar datos</span>
          </button>
        </div>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Solicitudes</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1 tabular-nums">
            {total}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {totalDiasSolicitados} días solicitados
          </div>
        </div>

        <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 text-xs font-medium">
            <span>Por Revisar</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-900 mt-1 tabular-nums">
            {pendientes}
          </div>
          <div className="text-[11px] text-amber-600 mt-0.5 font-medium">
            {pendientes > 0 ? 'Requieren atención' : 'Todo al día'}
          </div>
        </div>

        <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200 shadow-xs">
          <div className="flex items-center justify-between text-blue-700 text-xs font-medium">
            <span>Vo.Bo. RRHH</span>
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-900 mt-1 tabular-nums">
            {aprobadasRRHH}
          </div>
          <div className="text-[11px] text-blue-600 mt-0.5">
            Pendiente firma Alcaldía
          </div>
        </div>

        <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-medium">
            <span>Aprobadas Total</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-900 mt-1 tabular-nums">
            {aprobadasAlcalde}
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5">
            Con sellos completos
          </div>
        </div>

        <div className="bg-red-50/60 p-4 rounded-xl border border-red-200 shadow-xs">
          <div className="flex items-center justify-between text-red-700 text-xs font-medium">
            <span>Denegadas</span>
            <XCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-black text-red-900 mt-1 tabular-nums">
            {rechazadas}
          </div>
          <div className="text-[11px] text-red-600 mt-0.5">
            Con observaciones
          </div>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Buscador */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, cédula o folio..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-sky-500"
          />
        </div>

        {/* Filtro de Estado */}
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Estado:</span>
          </div>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-800 font-medium focus:outline-hidden focus:border-sky-500 cursor-pointer"
          >
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendientes ({pendientes})</option>
            <option value="aprobado_rrhh">Aprobados RRHH ({aprobadasRRHH})</option>
            <option value="aprobado_alcalde">Visto Bueno Alcaldía ({aprobadasAlcalde})</option>
            <option value="rechazado">Denegados ({rechazadas})</option>
          </select>

          {/* Filtro por Área */}
          <select
            value={filtroArea}
            onChange={(e) => setFiltroArea(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-800 font-medium focus:outline-hidden focus:border-sky-500 cursor-pointer max-w-[200px] truncate"
          >
            <option value="todas">Todas las Áreas</option>
            {AREAS_MUNICIPALES.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla de Solicitudes */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filtradas.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">
              No se encontraron solicitudes
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No hay permisos que coincidan con los filtros seleccionados o la búsqueda.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Folio / Fecha</th>
                  <th className="py-3 px-4">Trabajador</th>
                  <th className="py-3 px-4">Área / Cargo</th>
                  <th className="py-3 px-4">Período Solicitado</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtradas.map((sol) => (
                  <tr key={sol.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono">
                      <span className="font-bold text-sky-900 block">{sol.folio}</span>
                      <span className="text-[11px] text-slate-400">
                        {sol.fechaDia}/{sol.fechaMes}/{sol.fechaAnio}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{sol.nombre}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{sol.cedula}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 font-medium">{sol.area}</div>
                      <div className="text-[11px] text-slate-500 italic">{sol.cargo}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">
                        {sol.diaInicio} - {sol.diaFin} {sol.mesPermiso} {sol.anioPermiso}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {sol.totalDias} días ({sol.totalHoras} hrs)
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-slate-700 capitalize font-medium">
                        {sol.tipoPermiso === 'vacaciones'
                          ? 'Vacaciones'
                          : sol.tipoPermiso === 'especial'
                          ? 'Especial'
                          : sol.otroEspecificar || 'Otro'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {getBadgeEstado(sol.estado)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => abrirGestion(sol)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors cursor-pointer"
                          title="Gestionar y emitir firma/sello"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Gestionar</span>
                        </button>

                        <button
                          onClick={() => verComprobante(sol)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                          title="Ver e Imprimir Comprobante PDF"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Gestión de Talento Humano */}
      {mostrarModalGestion && solicitudSeleccionada && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            {/* Cabecera del Modal */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-700 font-mono">
                  Gestión Oficial de Solicitud
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  {solicitudSeleccionada.folio} · {solicitudSeleccionada.nombre}
                </h3>
              </div>
              <button
                onClick={() => setMostrarModalGestion(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Resumen de Datos de la Solicitud */}
            <div className="my-5 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500 block">Cédula:</span>
                  <span className="font-bold text-slate-800 font-mono">{solicitudSeleccionada.cedula}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Cargo / Área:</span>
                  <span className="font-bold text-slate-800">{solicitudSeleccionada.cargo} ({solicitudSeleccionada.area})</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Días solicitados:</span>
                  <span className="font-bold text-slate-800">
                    {solicitudSeleccionada.diaInicio} al {solicitudSeleccionada.diaFin} de {solicitudSeleccionada.mesPermiso} {solicitudSeleccionada.anioPermiso}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Total:</span>
                  <span className="font-bold text-slate-800">
                    {solicitudSeleccionada.totalDias} días ({solicitudSeleccionada.totalHoras} horas)
                  </span>
                </div>
              </div>

              {solicitudSeleccionada.motivo && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 block font-medium">Motivo o justificación:</span>
                  <p className="text-slate-700 italic mt-0.5 bg-white p-2 rounded border border-slate-200">
                    "{solicitudSeleccionada.motivo}"
                  </p>
                </div>
              )}

              {/* Firma del Solicitante */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block">Firma del Solicitante registrada:</span>
                  <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Autenticada digitalmente
                  </span>
                </div>
                {solicitudSeleccionada.firmaSolicitante && (
                  <div className="h-12 w-32 border border-slate-300 rounded bg-white flex items-center justify-center p-1">
                    <img
                      src={solicitudSeleccionada.firmaSolicitante}
                      alt="Firma"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Formulario de Decisión de Talento Humano */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                  Observaciones de Talento Humano:
                </label>
                <textarea
                  rows={3}
                  value={obsInput}
                  onChange={(e) => setObsInput(e.target.value)}
                  placeholder="Escriba las observaciones oficiales que se imprimirán en las líneas del documento..."
                  className="w-full text-xs sm:text-sm p-3 border border-slate-300 rounded-lg focus:border-sky-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                  Responsable de Talento Humano (Firma y Sello):
                </label>
                <input
                  type="text"
                  value={responsableInput}
                  onChange={(e) => setResponsableInput(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-lg focus:border-sky-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Botones de Acción de Estado */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => cambiarEstado('rechazado')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Denegar Permiso</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => cambiarEstado('aprobado_rrhh')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Aprobar (Sello RRHH)</span>
                </button>

                <button
                  onClick={() => cambiarEstado('aprobado_alcalde')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Visto Bueno Alcaldía</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
