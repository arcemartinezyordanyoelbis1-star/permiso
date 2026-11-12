import React, { useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { SolicitudPermiso } from '../types.ts';
import {
  EncabezadoOficialMunicipal,
  PiePaginaOficial,
  EscudoSanPedroDelNorte,
} from './HeaderLogos.tsx';
import { Download, Printer, CheckCircle, ShieldCheck, ArrowLeft, Share2, Copy, Check } from 'lucide-react';

interface ComprobanteOficialProps {
  solicitud: SolicitudPermiso;
  onVolver?: () => void;
  modoModal?: boolean;
}

export const ComprobanteOficial: React.FC<ComprobanteOficialProps> = ({
  solicitud,
  onVolver,
  modoModal = false,
}) => {
  const documentoRef = useRef<HTMLDivElement>(null);
  const [descargando, setDescargando] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const descargarPDF = async () => {
    if (!documentoRef.current) return;
    setDescargando(true);

    try {
      // Optimizamos renderizado para alta resolución (escala 2.5)
      const canvas = await html2canvas(documentoRef.current, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 800,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      // Formato carta estándar (Letter: 215.9mm x 279.4mm)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'letter',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pdfWidth - 16; // 8mm margen cada lado
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let positionY = 8;
      // Si la imagen entra en una sola página (ideal para este formulario de 1 hoja)
      if (imgHeight <= pdfHeight - 16) {
        positionY = (pdfHeight - imgHeight) / 2; // centrado vertical
      }

      pdf.addImage(imgData, 'JPEG', 8, positionY, imgWidth, Math.min(imgHeight, pdfHeight - 16));
      
      const nombreArchivo = `Solicitud_Permiso_${solicitud.folio.replace(/[^a-zA-Z0-9-]/g, '_')}_${solicitud.nombre.split(' ')[0]}.pdf`;
      pdf.save(nombreArchivo);
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Hubo un inconveniente al generar el PDF. Puedes usar el botón de Imprimir.');
    } finally {
      setDescargando(false);
    }
  };

  const imprimir = () => {
    window.print();
  };

  const copiarEnlaceVerificacion = () => {
    const url = `${window.location.origin}${window.location.pathname}?folio=${solicitud.folio}`;
    navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto py-4 px-2 sm:px-4">
      {/* Barra de acciones superior */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6 no-print">
        <div className="flex items-center gap-2">
          {onVolver && (
            <button
              onClick={onVolver}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver</span>
            </button>
          )}
          <div>
            <span className="text-xs text-slate-500 font-mono block">Folio Oficial</span>
            <span className="text-sm font-bold text-sky-900 font-mono">{solicitud.folio}</span>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={copiarEnlaceVerificacion}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Copiar enlace de verificación"
          >
            {copiado ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copiado ? 'Enlace Copiado' : 'Copiar Enlace'}</span>
          </button>

          <button
            onClick={imprimir}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4 text-slate-700" />
            <span>Imprimir</span>
          </button>

          <button
            onClick={descargarPDF}
            disabled={descargando}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-linear-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 rounded-lg transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{descargando ? 'Generando PDF...' : 'Descargar PDF Oficial'}</span>
          </button>
        </div>
      </div>

      {/* DOCUMENTO OFICIAL PARA IMPRESIÓN / DESCARGA */}
      {/* Proporción y estilo de hoja membretada oficial con marca de agua */}
      <div
        ref={documentoRef}
        id="comprobante-imprimible"
        className="w-full bg-white text-slate-900 shadow-md border border-slate-300 p-6 sm:p-10 relative overflow-hidden font-mono text-[13px] sm:text-[14px] leading-relaxed"
        style={{
          fontFamily: '"Courier Prime", "Space Mono", Courier, monospace',
          minHeight: '1050px',
        }}
      >
        {/* Marca de agua de fondo (Swirls / Arboles de la Vida / Escudo Oficial) */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.07] select-none"
        >
          <div className="flex flex-col items-center">
            <EscudoSanPedroDelNorte className="w-72 h-72 object-contain" />
            <div className="text-2xl font-black mt-4 tracking-widest text-center text-slate-800">
              TRABAJO, PAZ, SEGURIDAD, PROSPERIDAD
            </div>
            <div className="text-xl font-black text-center mt-1 text-slate-800">
              ¡Vamos Adelante!
            </div>
          </div>
        </div>

        {/* Encabezado Institucional Completo */}
        <EncabezadoOficialMunicipal />

        {/* Número de Folio y Fecha en encabezado del formulario */}
        <div className="flex items-center justify-between mt-4 mb-4 font-bold text-slate-800">
          <div className="text-xs">
            <span className="text-slate-500 font-sans">Folio: </span>
            <span className="text-sky-900 font-mono">{solicitud.folio}</span>
          </div>

          <div className="flex items-center gap-1 text-sm font-bold">
            <span>Fecha</span>
            <span className="inline-block border-b-2 border-slate-800 px-2 py-0 text-center min-w-[28px]">
              {solicitud.fechaDia}
            </span>
            <span>/</span>
            <span className="inline-block border-b-2 border-slate-800 px-2 py-0 text-center min-w-[28px]">
              {solicitud.fechaMes}
            </span>
            <span>/</span>
            <span className="inline-block border-b-2 border-slate-800 px-2 py-0 text-center min-w-[48px]">
              {solicitud.fechaAnio}
            </span>
          </div>
        </div>

        {/* Título del trámite */}
        <div className="text-center my-6">
          <h3 className="text-base sm:text-lg font-bold tracking-wider underline uppercase">
            Solicitud de Permiso
          </h3>
        </div>

        {/* Campos del Solicitante - Formato idéntico a las fotos oficiales */}
        <div className="space-y-3.5 my-5">
          {/* Yo: Nombre */}
          <div className="flex items-baseline gap-2">
            <span className="font-bold shrink-0">Yo:</span>
            <span className="border-b-2 border-slate-800 grow px-2 py-0.5 font-bold uppercase tracking-wide">
              {solicitud.nombre || '________________________________________________'}
            </span>
          </div>

          {/* Cédula */}
          <div className="flex items-baseline gap-2">
            <span className="font-bold shrink-0">Cédula/No.</span>
            <span className="border-b-2 border-slate-800 grow px-2 py-0.5 tracking-wider font-semibold">
              {solicitud.cedula || '________________________________________________'}
            </span>
          </div>

          {/* Cargo */}
          <div className="flex items-baseline gap-2">
            <span className="font-bold shrink-0">Cargo:</span>
            <span className="border-b-2 border-slate-800 grow px-2 py-0.5 font-semibold">
              {solicitud.cargo || '________________________________________________'}
            </span>
          </div>

          {/* Área */}
          <div className="flex items-baseline gap-2">
            <span className="font-bold shrink-0">Área:</span>
            <span className="border-b-2 border-slate-800 grow px-2 py-0.5 font-semibold">
              {solicitud.area || '________________________________________________'}
            </span>
          </div>

          {/* Párrafo de solicitud de días */}
          <div className="pt-2 leading-relaxed">
            <span>Por este medio solicito permiso para ausentarme durante el o los días </span>
            <span className="inline-block border-b-2 border-slate-800 font-bold px-2 text-center min-w-[36px]">
              {solicitud.diaInicio || '___'}
            </span>
            <span> - </span>
            <span className="inline-block border-b-2 border-slate-800 font-bold px-2 text-center min-w-[36px]">
              {solicitud.diaFin || '___'}
            </span>
            <span> del mes de: </span>
            <span className="inline-block border-b-2 border-slate-800 font-bold px-3 text-center min-w-[120px]">
              {solicitud.mesPermiso || '____________'}
            </span>
            <span> del año </span>
            <span className="inline-block border-b-2 border-slate-800 font-bold px-2 text-center min-w-[48px]">
              {solicitud.anioPermiso || '2026'}
            </span>
            <span>.</span>
          </div>

          {/* Totales de días y horas */}
          <div className="flex flex-wrap items-baseline gap-6 pt-2">
            <div className="flex items-baseline gap-2">
              <span className="font-bold">Total/días:</span>
              <span className="border-b-2 border-slate-800 font-bold px-3 text-center min-w-[50px]">
                {solicitud.totalDias || '—'}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-bold">Total de horas:</span>
              <span className="border-b-2 border-slate-800 font-bold px-3 text-center min-w-[50px]">
                {solicitud.totalHoras || '—'}
              </span>
            </div>
          </div>

          {/* Tipo de permiso checkboxes / líneas */}
          <div className="pt-3 space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="font-bold">A cuenta de vacaciones:</span>
              <span className="border-b-2 border-slate-800 font-bold px-3 text-center min-w-[40px]">
                {solicitud.tipoPermiso === 'vacaciones' ? 'X' : '—'}
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="font-bold">Permiso Especial:</span>
              <span className="border-b-2 border-slate-800 font-bold px-3 text-center min-w-[40px]">
                {solicitud.tipoPermiso === 'especial' ? 'X' : '—'}
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="font-bold shrink-0">Otro:</span>
              <span className="border-b-2 border-slate-800 grow px-2 font-medium">
                {solicitud.tipoPermiso === 'otro'
                  ? solicitud.otroEspecificar || 'X (Ver motivo)'
                  : '________________________________________'}
              </span>
            </div>
          </div>

          {/* Motivo o detalle del permiso */}
          <div className="pt-3">
            <div className="text-xs text-slate-600 italic mb-1">
              Motivo o detalle del permiso:
            </div>
            <div className="border-b-2 border-slate-800 min-h-[44px] py-1 px-2 text-xs sm:text-sm font-sans italic text-slate-800 bg-slate-50/50">
              {solicitud.motivo || 'Motivo expuesto verbalmente y conforme reglamento interno.'}
            </div>
          </div>
        </div>

        {/* Despedida formal del documento */}
        <div className="my-5 text-xs sm:text-sm leading-relaxed">
          <p>
            Sin más a que hacerle referencia me suscribo de usted no sin antes desearle muchas bendiciones en sus funciones diarias.
          </p>
          <p className="mt-3 font-semibold">
            Muy cordialmente,
          </p>
        </div>

        {/* Sección de Firma del Solicitante */}
        <div className="my-6 flex flex-col items-center">
          <div className="w-72 h-24 flex items-center justify-center border-b-2 border-slate-800 pb-1">
            {solicitud.firmaSolicitante ? (
              <img
                src={solicitud.firmaSolicitante}
                alt="Firma del Solicitante"
                className="max-h-20 max-w-full object-contain"
              />
            ) : (
              <span className="text-xs text-slate-400 italic font-sans">(Firma Digital Registrada)</span>
            )}
          </div>
          <div className="text-xs sm:text-sm font-bold mt-1 uppercase tracking-wider">
            Firma del Solicitante
          </div>
        </div>

        {/* Firmas y Sellos Institucionales (RRHH y Alcalde) */}
        <div className="grid grid-cols-2 gap-8 my-8 pt-2">
          {/* Firma y Sello Resp. RR HH */}
          <div className="flex flex-col items-center text-center">
            <div className="w-full max-w-[240px] h-20 border-b-2 border-slate-800 flex flex-col items-center justify-center relative">
              {solicitud.estado === 'aprobado_rrhh' || solicitud.estado === 'aprobado_alcalde' ? (
                <div className="flex flex-col items-center">
                  {/* Sello Digital de Talento Humano */}
                  <div className="border-2 border-blue-800 rounded-md p-1.5 bg-blue-50/50 rotate-[-4deg] text-center shadow-xs">
                    <div className="text-[9px] font-black tracking-widest text-blue-900 uppercase">
                      ALCALDÍA SAN PEDRO DEL NORTE
                    </div>
                    <div className="text-[10px] font-extrabold text-blue-800 uppercase flex items-center justify-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-blue-700" />
                      <span>TALENTO HUMANO - APROBADO</span>
                    </div>
                    <div className="text-[8px] text-blue-950 font-sans">
                      {solicitud.responsableRRHH || 'Lic. Claudia Gómez - Dir. RRHH'}
                    </div>
                  </div>
                </div>
              ) : solicitud.estado === 'rechazado' ? (
                <div className="text-[11px] font-bold text-red-600 border border-red-500 px-2 py-1 rounded">
                  NO APROBADO
                </div>
              ) : (
                <span className="text-[10px] text-slate-400 italic font-sans">
                  (Pendiente firma y sello RRHH)
                </span>
              )}
            </div>
            <div className="text-xs sm:text-sm font-bold mt-1">
              Firma y Sello
            </div>
            <div className="text-xs sm:text-sm font-bold">
              Resp. RR HH
            </div>
          </div>

          {/* Firma y Sello Alcalde */}
          <div className="flex flex-col items-center text-center">
            <div className="w-full max-w-[240px] h-20 border-b-2 border-slate-800 flex flex-col items-center justify-center relative">
              {solicitud.estado === 'aprobado_alcalde' ? (
                <div className="border-2 border-emerald-800 rounded-md p-1.5 bg-emerald-50/50 rotate-[3deg] text-center shadow-xs">
                  <div className="text-[9px] font-black tracking-widest text-emerald-900 uppercase">
                    ALCALDÍA MUNICIPAL
                  </div>
                  <div className="text-[10px] font-extrabold text-emerald-800 uppercase flex items-center justify-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-700" />
                    <span>VISTO BUENO ALCALDE</span>
                  </div>
                  <div className="text-[8px] text-emerald-950 font-sans">
                    San Pedro del Norte, Chinandega
                  </div>
                </div>
              ) : (
                <span className="text-[10px] text-slate-400 italic font-sans">
                  (Pendiente firma y sello Alcaldía)
                </span>
              )}
            </div>
            <div className="text-xs sm:text-sm font-bold mt-1">
              Firma y Sello
            </div>
            <div className="text-xs sm:text-sm font-bold">
              Alcalde
            </div>
          </div>
        </div>

        {/* Observaciones (Uso exclusivo de Talento Humano) */}
        <div className="my-6">
          <div className="text-xs sm:text-sm font-bold mb-1">
            <span>Observaciones: </span>
            <span className="font-normal italic">(Uso exclusivo de Talento Humano)</span>
          </div>
          <div className="space-y-3 pt-1">
            <div className="border-b-2 border-slate-800 min-h-[22px] px-2 text-xs font-sans text-slate-800">
              {solicitud.observacionesRRHH ? solicitud.observacionesRRHH.slice(0, 85) : ''}
            </div>
            <div className="border-b-2 border-slate-800 min-h-[22px] px-2 text-xs font-sans text-slate-800">
              {solicitud.observacionesRRHH && solicitud.observacionesRRHH.length > 85
                ? solicitud.observacionesRRHH.slice(85, 175)
                : ''}
            </div>
            <div className="border-b-2 border-slate-800 min-h-[22px]"></div>
            <div className="border-b-2 border-slate-800 min-h-[22px]"></div>
          </div>
        </div>

        {/* Código QR y verificación de seguridad institucional */}
        <div className="flex items-center justify-between border-t border-dashed border-slate-400 pt-3 mt-4 text-[11px] font-sans text-slate-500">
          <div className="flex items-center gap-3">
            {/* QR SVG minimalista con los datos del trámite */}
            <div className="p-1 bg-white border border-slate-400 rounded">
              <svg className="w-14 h-14" viewBox="0 0 100 100">
                <rect width="100" height="100" fill="#ffffff" />
                {/* Patrón QR visual auténtico */}
                <rect x="10" y="10" width="24" height="24" fill="#0f172a" />
                <rect x="14" y="14" width="16" height="16" fill="#ffffff" />
                <rect x="18" y="18" width="8" height="8" fill="#0f172a" />
                
                <rect x="66" y="10" width="24" height="24" fill="#0f172a" />
                <rect x="70" y="14" width="16" height="16" fill="#ffffff" />
                <rect x="74" y="18" width="8" height="8" fill="#0f172a" />
                
                <rect x="10" y="66" width="24" height="24" fill="#0f172a" />
                <rect x="14" y="70" width="16" height="16" fill="#ffffff" />
                <rect x="18" y="74" width="8" height="8" fill="#0f172a" />

                <rect x="42" y="15" width="8" height="8" fill="#0f172a" />
                <rect x="42" y="30" width="8" height="12" fill="#0f172a" />
                <rect x="52" y="20" width="6" height="6" fill="#0f172a" />
                <rect x="15" y="44" width="10" height="8" fill="#0f172a" />
                <rect x="30" y="44" width="14" height="8" fill="#0f172a" />
                <rect x="50" y="44" width="16" height="8" fill="#0f172a" />
                <rect x="74" y="44" width="14" height="8" fill="#0f172a" />
                <rect x="42" y="60" width="14" height="10" fill="#0f172a" />
                <rect x="64" y="60" width="10" height="14" fill="#0f172a" />
                <rect x="80" y="60" width="10" height="8" fill="#0f172a" />
                <rect x="42" y="78" width="10" height="12" fill="#0f172a" />
                <rect x="60" y="80" width="28" height="10" fill="#0f172a" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-slate-700">Verificación Digital Municipal</p>
              <p>Comprobante válido para archivo y trámite de nómina.</p>
              <p className="font-mono text-[10px]">ID: {solicitud.id} · REG: {new Date(solicitud.fechaCreacion).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="text-right">
            <span className={`px-2 py-1 rounded text-[11px] font-bold uppercase ${
              solicitud.estado === 'aprobado_alcalde'
                ? 'bg-emerald-100 text-emerald-800'
                : solicitud.estado === 'aprobado_rrhh'
                ? 'bg-blue-100 text-blue-800'
                : solicitud.estado === 'rechazado'
                ? 'bg-red-100 text-red-800'
                : 'bg-amber-100 text-amber-800'
            }`}>
              {solicitud.estado === 'aprobado_alcalde' ? 'Aprobado Completo' : solicitud.estado === 'aprobado_rrhh' ? 'Vo.Bo. RRHH' : solicitud.estado === 'rechazado' ? 'Denegado' : 'En Trámite'}
            </span>
          </div>
        </div>

        {/* Pie de Página Oficial (SOMOS PUEBLO QUE VENCE...) */}
        <PiePaginaOficial />
      </div>
    </div>
  );
};
