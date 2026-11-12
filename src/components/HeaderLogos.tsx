import React from 'react';

export const EXACT_HEADER_IMAGE = '/assets/logos/header_logos_clean.png';
export const EXACT_FOOTER_IMAGE = '/assets/logos/footer_logos_clean.png';
export const EXACT_ESCUDO_IMAGE = '/assets/logos/logo_escudo_spn.png';

export const EncabezadoOficialMunicipal: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`w-full border-b border-slate-300 pb-3 mb-2 ${className}`}>
      {/* Logos Oficiales Exactos de la Alcaldía de San Pedro del Norte y Gobierno Nacional */}
      <div className="w-full flex justify-center items-center py-1">
        <img
          src={EXACT_HEADER_IMAGE}
          alt="Logos Oficiales Alcaldía de San Pedro del Norte - Gobierno de Reconciliación y Unidad Nacional - Viva Sandino"
          className="w-full max-w-[620px] h-auto object-contain select-none"
          loading="eager"
        />
      </div>

      {/* Título institucional centrado idéntico al papel físico */}
      <div className="text-center mt-2.5 space-y-0.5">
        <h1 className="text-sm md:text-base font-bold tracking-wider text-slate-900 underline uppercase font-serif">
          ALCALDIA MUNICIPAL DE SAN PEDRO DEL NORTE
        </h1>
        <p className="text-xs md:text-sm font-bold tracking-wider text-slate-800 uppercase font-serif">
          CHINANDEGA, NICARAGUA
        </p>
        <p className="text-xs md:text-sm font-semibold text-slate-700 font-serif">
          Costado Sur del Parque Municipal
        </p>
      </div>
    </div>
  );
};

export const PiePaginaOficial: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`w-full pt-3 mt-5 border-t border-slate-300 ${className}`}>
      {/* Footer Oficial Exacto */}
      <div className="w-full flex justify-center items-center">
        <img
          src={EXACT_FOOTER_IMAGE}
          alt="Somos Pueblo Que Vence - Cristiana, Socialista, Solidaria - Alcaldía De San Pedro del Norte"
          className="w-full max-w-[580px] h-auto object-contain select-none"
          loading="eager"
        />
      </div>
    </div>
  );
};

export const EscudoSanPedroDelNorte: React.FC<{ className?: string }> = ({ className = 'w-20 h-20' }) => (
  <img
    src={EXACT_ESCUDO_IMAGE}
    alt="Escudo Oficial de San Pedro del Norte Chinandega"
    className={`${className} object-contain`}
  />
);
