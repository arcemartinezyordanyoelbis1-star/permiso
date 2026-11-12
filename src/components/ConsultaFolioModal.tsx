import React, { useState } from 'react';
import { SolicitudPermiso } from '../types.ts';
import { Search, FileText, CheckCircle2, Clock, XCircle, ShieldCheck } from 'lucide-react';

interface ConsultaFolioModalProps {
  solicitudes: SolicitudPermiso[];
  onSeleccionarSolicitud: (sol: SolicitudPermiso) => void;
  onCerrar: () => void;
}

export const ConsultaFolioModal: React.FC<ConsultaFolioModalProps> = ({
  solicitudes,
  onSeleccionarSolicitud,
  onCerrar,
}) => {
  const [criterio, setCriterio] = useState('');
  const [resultados, setResultados] = useState<SolicitudPermiso[]>([]);
  const [buscado, setBuscado] = useState(false);

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    const texto = criterio.trim().toLowerCase();
    if (!texto) return;

    const matches = solicitudes.filter(
      (s) =>
        s.folio.toLowerCase().includes(texto) ||
        s.cedula.toLowerCase().includes(texto) ||
        s.nombre.toLowerCase().includes(texto)
    );
    setResultados(matches);
    setBuscado(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Consultar Estado de Permiso
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ingrese su Número de Folio o Cédula para ver el estado o imprimir el comprobante.
            </p>
          </div>
          <button
            onClick={onCerrar}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleBuscar} className="my-4">
          <div className="flex gap-2">
            <div className="relative grow">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={criterio}
                onChange={(e) => setCriterio(e.target.value)}
                placeholder="Ej: SPN-RH-2026-0040 o 081-..."
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:border-sky-500"
                required
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-sky-700 hover:bg-sky-800 rounded-lg transition-colors cursor-pointer"
            >
              Buscar
            </button>
          </div>
        </form>

        {buscado && (
          <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
            {resultados.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">
                No se encontró ninguna solicitud con ese Folio o Cédula.
              </div>
            ) : (
              resultados.map((sol) => (
                <div
                  key={sol.id}
                  onClick={() => onSeleccionarSolicitud(sol)}
                  className="p-3 rounded-xl border border-slate-200 hover:border-sky-400 hover:bg-sky-50/50 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-slate-900">
                      {sol.nombre}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      Folio: {sol.folio} · {sol.diaInicio}/{sol.fechaMes} ({sol.totalDias} días)
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        sol.estado === 'aprobado_alcalde'
                          ? 'bg-emerald-100 text-emerald-800'
                          : sol.estado === 'aprobado_rrhh'
                          ? 'bg-blue-100 text-blue-800'
                          : sol.estado === 'rechazado'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {sol.estado === 'aprobado_alcalde' && <CheckCircle2 className="w-3 h-3" />}
                      {sol.estado === 'aprobado_rrhh' && <ShieldCheck className="w-3 h-3" />}
                      {sol.estado === 'pendiente' && <Clock className="w-3 h-3" />}
                      {sol.estado === 'rechazado' && <XCircle className="w-3 h-3" />}
                      <span className="capitalize">{sol.estado.replace('_', ' ')}</span>
                    </span>
                    <span className="text-[10px] text-sky-700 block mt-1 underline">
                      Ver Comprobante
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
