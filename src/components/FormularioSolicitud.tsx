import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { SolicitudPermiso, TipoPermiso } from '../types.ts';
import { AREAS_MUNICIPALES, MESES, saveSolicitud } from '../utils/storage.ts';
import { EncabezadoOficialMunicipal, PiePaginaOficial } from './HeaderLogos.tsx';
import { SignaturePad } from './SignaturePad.tsx';
import { Send, AlertCircle, Sparkles, FileText, CheckCircle2 } from 'lucide-react';

interface FormularioSolicitudProps {
  onSolicitudEnviada: (solicitud: SolicitudPermiso) => void;
}

export const FormularioSolicitud: React.FC<FormularioSolicitudProps> = ({
  onSolicitudEnviada,
}) => {
  const hoy = new Date();
  const diaActual = String(hoy.getDate()).padStart(2, '0');
  const mesActualNum = String(hoy.getMonth() + 1).padStart(2, '0');
  const mesActualNombre = MESES[hoy.getMonth()];
  const anioActual = String(hoy.getFullYear());

  // Form states
  const [fechaDia, setFechaDia] = useState(diaActual);
  const [fechaMes, setFechaMes] = useState(mesActualNum);
  const [fechaAnio, setFechaAnio] = useState(anioActual);

  const [nombre, setNombre] = useState('');
  const [cedula, setCedula] = useState('');
  const [cargo, setCargo] = useState('');
  const [area, setArea] = useState(AREAS_MUNICIPALES[0]);
  const [otraArea, setOtraArea] = useState('');

  const [diaInicio, setDiaInicio] = useState(diaActual);
  const [diaFin, setDiaFin] = useState(diaActual);
  const [mesPermiso, setMesPermiso] = useState(mesActualNombre);
  const [anioPermiso, setAnioPermiso] = useState(anioActual);
  
  const [totalDias, setTotalDias] = useState('1');
  const [totalHoras, setTotalHoras] = useState('8');

  const [tipoPermiso, setTipoPermiso] = useState<TipoPermiso>('vacaciones');
  const [otroEspecificar, setOtroEspecificar] = useState('');
  const [motivo, setMotivo] = useState('');

  const [firma, setFirma] = useState('');
  const [errorFirma, setErrorFirma] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // Auto formato cédula nicaragüense (000-000000-0000X)
  const handleCedulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let valor = e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, '');
    let formateado = '';

    if (valor.length > 0) {
      formateado = valor.substring(0, 3);
    }
    if (valor.length > 3) {
      formateado += '-' + valor.substring(3, 9);
    }
    if (valor.length > 9) {
      formateado += '-' + valor.substring(9, 14);
    }
    setCedula(formateado.slice(0, 16));
  };

  // Auto cálculo días
  const calcularDiasHoras = (inicio: string, fin: string) => {
    const numIni = parseInt(inicio, 10);
    const numFin = parseInt(fin, 10);
    if (!isNaN(numIni) && !isNaN(numFin) && numFin >= numIni) {
      const dias = numFin - numIni + 1;
      setTotalDias(String(dias));
      setTotalHoras(String(dias * 8));
    }
  };

  const handleDiaInicioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDiaInicio(val);
    calcularDiasHoras(val, diaFin);
  };

  const handleDiaFinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDiaFin(val);
    calcularDiasHoras(diaInicio, val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!firma) {
      setErrorFirma(true);
      const signatureElem = document.getElementById('signature-section');
      signatureElem?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    setErrorFirma(false);

    setEnviando(true);

    try {
      const areaFinal = area === 'OTRA' ? otraArea : area;
      const nueva = saveSolicitud({
        fechaDia,
        fechaMes,
        fechaAnio,
        nombre: nombre.trim(),
        cedula: cedula.trim(),
        cargo: cargo.trim(),
        area: areaFinal.trim(),
        diaInicio,
        diaFin,
        mesPermiso,
        anioPermiso,
        totalDias,
        totalHoras,
        tipoPermiso,
        otroEspecificar: tipoPermiso === 'otro' ? otroEspecificar.trim() : '',
        motivo: motivo.trim(),
        firmaSolicitante: firma,
      });

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      setTimeout(() => {
        setEnviando(false);
        onSolicitudEnviada(nueva);
      }, 500);
    } catch (err) {
      console.error(err);
      setEnviando(false);
      alert('Error al guardar la solicitud. Por favor intente nuevamente.');
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white border border-slate-200 sm:rounded-2xl shadow-lg p-4 sm:p-8 transition-all">
      {/* Guía inicial amigable */}
      <div className="mb-6 p-3.5 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-between gap-3 text-xs sm:text-sm text-sky-900">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
          <span>
            <strong>Portal del Trabajador:</strong> Llene el formulario oficial de permiso municipal. Al enviarlo se notificará a Talento Humano y podrá descargar su comprobante en PDF listo para imprimir.
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Encabezado Institucional Completo */}
        <EncabezadoOficialMunicipal />

        {/* Sección de Fecha (como en el papel oficial) */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2 text-sm font-serif border-b border-slate-200 pb-4">
          <span className="font-bold text-slate-800">Fecha</span>
          <div className="flex items-center gap-1 font-mono">
            <input
              type="text"
              maxLength={2}
              value={fechaDia}
              onChange={(e) => setFechaDia(e.target.value)}
              className="w-10 text-center border-b-2 border-slate-700 font-bold focus:outline-hidden focus:border-sky-600 bg-transparent text-slate-900"
              required
            />
            <span className="text-slate-600">/</span>
            <input
              type="text"
              maxLength={2}
              value={fechaMes}
              onChange={(e) => setFechaMes(e.target.value)}
              className="w-10 text-center border-b-2 border-slate-700 font-bold focus:outline-hidden focus:border-sky-600 bg-transparent text-slate-900"
              required
            />
            <span className="text-slate-600">/</span>
            <input
              type="text"
              maxLength={4}
              value={fechaAnio}
              onChange={(e) => setFechaAnio(e.target.value)}
              className="w-16 text-center border-b-2 border-slate-700 font-bold focus:outline-hidden focus:border-sky-600 bg-transparent text-slate-900"
              required
            />
          </div>
        </div>

        {/* Subtítulo Solicitud de Permiso */}
        <div className="text-center py-1">
          <h2 className="text-lg sm:text-xl font-bold tracking-widest text-slate-900 uppercase underline font-serif">
            Solicitud de Permiso
          </h2>
        </div>

        {/* Bloque de datos del trabajador (Diseñado con renglones subrayados idénticos al formato físico) */}
        <div className="space-y-5 text-sm sm:text-base font-serif">
          {/* Yo: Nombre */}
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
            <label className="font-bold text-slate-900 shrink-0">Yo:</label>
            <input
              type="text"
              required
              placeholder="Nombre y apellidos completos"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="grow border-b-2 border-slate-700 px-2 py-1 font-semibold text-slate-900 focus:outline-hidden focus:border-sky-600 placeholder:text-slate-400 placeholder:font-normal placeholder:italic bg-transparent transition-colors"
            />
          </div>

          {/* Cédula */}
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
            <label className="font-bold text-slate-900 shrink-0">Cédula/No.</label>
            <input
              type="text"
              required
              placeholder="000-000000-0000X"
              value={cedula}
              onChange={handleCedulaChange}
              className="grow border-b-2 border-slate-700 px-2 py-1 font-mono tracking-wider font-semibold text-slate-900 focus:outline-hidden focus:border-sky-600 placeholder:text-slate-400 placeholder:font-normal bg-transparent transition-colors"
            />
          </div>

          {/* Cargo */}
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
            <label className="font-bold text-slate-900 shrink-0">Cargo:</label>
            <input
              type="text"
              required
              placeholder="Puesto o cargo que desempeña en la Alcaldía"
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              className="grow border-b-2 border-slate-700 px-2 py-1 font-medium text-slate-900 focus:outline-hidden focus:border-sky-600 placeholder:text-slate-400 placeholder:font-normal placeholder:italic bg-transparent transition-colors"
            />
          </div>

          {/* Área */}
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
            <label className="font-bold text-slate-900 shrink-0">Área:</label>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="grow border-b-2 border-slate-700 px-2 py-1 text-slate-900 font-medium focus:outline-hidden focus:border-sky-600 bg-transparent transition-colors cursor-pointer"
            >
              {AREAS_MUNICIPALES.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
              <option value="OTRA">Otra área municipal...</option>
            </select>
          </div>

          {area === 'OTRA' && (
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 pl-6">
              <label className="text-xs font-bold text-slate-600 shrink-0">Especificar Área:</label>
              <input
                type="text"
                required
                placeholder="Nombre de la unidad o área"
                value={otraArea}
                onChange={(e) => setOtraArea(e.target.value)}
                className="grow border-b-2 border-slate-500 px-2 py-0.5 text-sm text-slate-900 focus:outline-hidden focus:border-sky-600"
              />
            </div>
          )}

          {/* Texto de solicitud de días */}
          <div className="pt-3 leading-relaxed text-slate-800">
            <span>Por este medio solicito permiso para ausentarme durante el o los días </span>
            <input
              type="text"
              required
              value={diaInicio}
              onChange={handleDiaInicioChange}
              placeholder="01"
              maxLength={2}
              className="inline-block w-12 text-center border-b-2 border-slate-800 font-bold focus:outline-hidden focus:border-sky-600 bg-transparent mx-1 text-slate-900"
            />
            <span> - </span>
            <input
              type="text"
              required
              value={diaFin}
              onChange={handleDiaFinChange}
              placeholder="01"
              maxLength={2}
              className="inline-block w-12 text-center border-b-2 border-slate-800 font-bold focus:outline-hidden focus:border-sky-600 bg-transparent mx-1 text-slate-900"
            />
            <span> del mes de: </span>
            <select
              value={mesPermiso}
              onChange={(e) => setMesPermiso(e.target.value)}
              className="inline-block border-b-2 border-slate-800 font-bold px-2 py-0.5 focus:outline-hidden focus:border-sky-600 bg-transparent mx-1 text-slate-900 cursor-pointer"
            >
              {MESES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <span> del año </span>
            <input
              type="text"
              required
              value={anioPermiso}
              onChange={(e) => setAnioPermiso(e.target.value)}
              maxLength={4}
              className="inline-block w-16 text-center border-b-2 border-slate-800 font-bold focus:outline-hidden focus:border-sky-600 bg-transparent mx-1 text-slate-900"
            />
            <span>.</span>
          </div>

          {/* Totales de días y horas */}
          <div className="flex flex-wrap items-center gap-6 pt-2">
            <div className="flex items-center gap-2">
              <label className="font-bold text-slate-900">Total/días:</label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                required
                value={totalDias}
                onChange={(e) => setTotalDias(e.target.value)}
                className="w-16 text-center border-b-2 border-slate-800 font-bold focus:outline-hidden focus:border-sky-600 bg-transparent text-slate-900"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="font-bold text-slate-900">Total de horas:</label>
              <input
                type="number"
                min="1"
                step="1"
                required
                value={totalHoras}
                onChange={(e) => setTotalHoras(e.target.value)}
                className="w-16 text-center border-b-2 border-slate-800 font-bold focus:outline-hidden focus:border-sky-600 bg-transparent text-slate-900"
              />
            </div>
          </div>

          {/* Opciones de tipo de permiso */}
          <div className="pt-4 space-y-3 border-t border-slate-100">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 font-sans block">
              Tipo de Permiso Solicitado:
            </label>

            <div className="flex items-center gap-3">
              <input
                type="radio"
                id="tipo-vacaciones"
                name="tipoPermiso"
                checked={tipoPermiso === 'vacaciones'}
                onChange={() => setTipoPermiso('vacaciones')}
                className="w-4 h-4 text-sky-600 focus:ring-sky-500 cursor-pointer"
              />
              <label htmlFor="tipo-vacaciones" className="font-bold text-slate-800 cursor-pointer">
                A cuenta de vacaciones
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="radio"
                id="tipo-especial"
                name="tipoPermiso"
                checked={tipoPermiso === 'especial'}
                onChange={() => setTipoPermiso('especial')}
                className="w-4 h-4 text-sky-600 focus:ring-sky-500 cursor-pointer"
              />
              <label htmlFor="tipo-especial" className="font-bold text-slate-800 cursor-pointer">
                Permiso Especial
              </label>
              <span className="text-xs text-slate-500 font-sans italic">(médico, maternidad, defunción, etc.)</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
              <div className="flex items-center gap-3 shrink-0">
                <input
                  type="radio"
                  id="tipo-otro"
                  name="tipoPermiso"
                  checked={tipoPermiso === 'otro'}
                  onChange={() => setTipoPermiso('otro')}
                  className="w-4 h-4 text-sky-600 focus:ring-sky-500 cursor-pointer"
                />
                <label htmlFor="tipo-otro" className="font-bold text-slate-800 cursor-pointer">
                  Otro:
                </label>
              </div>

              <input
                type="text"
                placeholder="Especifique el tipo si seleccionó 'Otro'"
                value={otroEspecificar}
                onChange={(e) => {
                  setOtroEspecificar(e.target.value);
                  if (tipoPermiso !== 'otro') setTipoPermiso('otro');
                }}
                disabled={tipoPermiso !== 'otro'}
                className="grow border-b-2 border-slate-700 px-2 py-0.5 text-sm focus:outline-hidden focus:border-sky-600 disabled:opacity-40 disabled:border-slate-300 bg-transparent transition-colors"
              />
            </div>
          </div>

          {/* Motivo o detalle del permiso (opcional) */}
          <div className="pt-2">
            <label className="text-xs text-slate-600 font-sans italic block mb-1">
              Motivo o detalle del permiso (opcional o justificación):
            </label>
            <textarea
              rows={3}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Explique brevemente el motivo para conocimiento de Talento Humano..."
              className="w-full border-2 border-slate-200 rounded-lg p-2.5 text-sm text-slate-900 focus:border-sky-500 focus:outline-hidden bg-slate-50/50"
            />
          </div>

          {/* Despedida formal idéntica al documento */}
          <div className="pt-2 text-sm leading-relaxed text-slate-700">
            <p>
              Sin más a que hacerle referencia me suscribo de usted no sin antes desearle muchas bendiciones en sus funciones diarias.
            </p>
            <p className="mt-3 font-semibold text-slate-900">
              Muy cordialmente,
            </p>
          </div>
        </div>

        {/* Sección de Firma del Solicitante */}
        <div id="signature-section" className="pt-4 border-t border-slate-200">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 font-sans block mb-2 text-center">
            Firma del Solicitante
          </label>
          <SignaturePad onSignatureChange={setFirma} />

          {errorFirma && (
            <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-red-600 font-medium">
              <AlertCircle className="w-4 h-4" />
              <span>Por favor estampe su firma digital con el dedo o mouse antes de enviar.</span>
            </div>
          )}
        </div>

        {/* Previsualización informativa de firmas institucionales */}
        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-200 text-center font-serif">
          <div className="border border-dashed border-slate-300 rounded-lg p-3 bg-slate-50/50">
            <div className="h-10 flex items-center justify-center text-[11px] text-slate-600 font-sans italic">
              Será firmado y sellado por Talento Humano
            </div>
            <div className="border-t border-slate-400 pt-1 text-xs font-bold text-slate-700">
              Firma y Sello Resp. RR HH
            </div>
          </div>

          <div className="border border-dashed border-slate-300 rounded-lg p-3 bg-slate-50/50">
            <div className="h-10 flex items-center justify-center text-[11px] text-slate-600 font-sans italic">
              Visto bueno y sello de Alcaldía
            </div>
            <div className="border-t border-slate-400 pt-1 text-xs font-bold text-slate-700">
              Firma y Sello Alcalde
            </div>
          </div>
        </div>

        {/* Pie de Página Oficial (SOMOS PUEBLO QUE VENCE...) */}
        <PiePaginaOficial />

        {/* Botón Principal de Envío */}
        <div className="pt-4 sticky bottom-4 z-20">
          <button
            type="submit"
            disabled={enviando}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-white bg-linear-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all text-base cursor-pointer disabled:opacity-60"
          >
            <Send className="w-5 h-5" />
            <span>{enviando ? 'Enviando solicitud...' : 'Enviar a Talento Humano'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
