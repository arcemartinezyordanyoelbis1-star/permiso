import React, { useEffect, useState } from 'react';
import { Building2, ChevronRight, Home } from 'lucide-react';
import { api, type Sitio } from './lib/api';
import { navegar, useRuta } from './lib/router';
import { PortalLayout } from './portal/PortalLayout';
import { PortalHome } from './portal/PortalHome';
import { PortalNoticias } from './portal/PortalNoticias';
import { PortalNoticia } from './portal/PortalNoticia';
import { PortalContacto } from './portal/PortalContacto';
import { AdminApp } from './admin/AdminApp';
import PermisosApp from './PermisosApp';

const NoEncontrada: React.FC = () => (
  <div className="max-w-3xl mx-auto px-4 py-24 text-center">
    <div className="w-16 h-16 rounded-2xl bg-[#0f3d6e]/8 text-[#0f3d6e] flex items-center justify-center mx-auto">
      <Building2 className="w-8 h-8" />
    </div>
    <h1 className="mt-5 text-2xl font-extrabold text-[#0d2c4d]">Página no encontrada</h1>
    <p className="mt-2 text-[13.5px] text-slate-600">
      La dirección solicitada no existe o fue movida. Puede regresar al inicio del portal.
    </p>
    <button
      onClick={() => navegar('/')}
      className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0f3d6e] hover:bg-[#0a2a4d] text-white text-[13px] font-bold cursor-pointer"
    >
      <Home className="w-4 h-4" /> Ir al inicio
    </button>
  </div>
);

const App: React.FC = () => {
  const ruta = useRuta();
  const [sitio, setSitio] = useState<Sitio | null>(null);

  useEffect(() => {
    api
      .sitio()
      .then((r) => setSitio(r.sitio))
      .catch(() => setSitio(null));
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [ruta]);

  // Panel de administración (sin el layout del portal)
  if (ruta.startsWith('/admin')) {
    return <AdminApp />;
  }

  // Módulo previo de permisos municipales, conservado
  if (ruta.startsWith('/permisos')) {
    return <PermisosApp />;
  }

  const segmentos = ruta.split('/').filter(Boolean);

  let contenido: React.ReactNode;
  if (ruta === '/') {
    contenido = <PortalHome sitio={sitio} />;
  } else if (segmentos[0] === 'noticias' && segmentos.length === 1) {
    contenido = <PortalNoticias />;
  } else if (segmentos[0] === 'noticias' && segmentos[1]) {
    contenido = <PortalNoticia id={decodeURIComponent(segmentos[1])} />;
  } else if (segmentos[0] === 'contacto') {
    contenido = <PortalContacto sitio={sitio} />;
  } else {
    contenido = <NoEncontrada />;
  }

  return (
    <PortalLayout ruta={ruta} sitio={sitio}>
      {contenido}
    </PortalLayout>
  );
};

export default App;

export const Migas: React.FC<{ items: string[] }> = ({ items }) => (
  <nav className="flex items-center gap-1.5 text-[11.5px] text-slate-500 mb-4 flex-wrap">
    <button onClick={() => navegar('/')} className="hover:text-[#0f3d6e] font-semibold cursor-pointer">
      Inicio
    </button>
    {items.map((i) => (
      <React.Fragment key={i}>
        <ChevronRight className="w-3 h-3 text-slate-300" />
        <span className="font-semibold text-slate-700">{i}</span>
      </React.Fragment>
    ))}
  </nav>
);
