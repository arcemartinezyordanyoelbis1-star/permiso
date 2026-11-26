import { useEffect, useState } from 'react';

export function rutaActual(): string {
  const hash = window.location.hash.replace(/^#/, '');
  if (!hash || hash === '/') return '/';
  return hash.startsWith('/') ? hash : `/${hash}`;
}

export function navegar(ruta: string) {
  const destino = ruta.startsWith('/') ? ruta : `/${ruta}`;
  if (rutaActual() === destino) return;
  window.location.hash = destino;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function useRuta(): string {
  const [ruta, setRuta] = useState(rutaActual);

  useEffect(() => {
    const alCambiar = () => {
      setRuta(rutaActual());
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    };
    window.addEventListener('hashchange', alCambiar);
    return () => window.removeEventListener('hashchange', alCambiar);
  }, []);

  return ruta;
}
