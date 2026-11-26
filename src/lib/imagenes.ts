/**
 * Compresión de imágenes en el navegador antes de enviarlas al servidor.
 * Devuelve un data URL JPEG/PNG optimizado.
 */
export async function comprimirImagen(archivo: File, maxLado = 1600, calidad = 0.82): Promise<string> {
  if (!archivo.type.startsWith('image/')) {
    throw new Error('El archivo seleccionado no es una imagen.');
  }
  if (archivo.size > 25 * 1024 * 1024) {
    throw new Error('La imagen supera los 25 MB. Use una foto más liviana.');
  }

  const dataUrl = await leerArchivo(archivo);

  // SVG y GIF se envían tal cual para no perder animación/vectores
  if (archivo.type === 'image/svg+xml' || archivo.type === 'image/gif') {
    return dataUrl;
  }

  try {
    const img = await cargarImagen(dataUrl);
    const escala = Math.min(1, maxLado / Math.max(img.width, img.height));
    const ancho = Math.max(1, Math.round(img.width * escala));
    const alto = Math.max(1, Math.round(img.height * escala));

    const canvas = document.createElement('canvas');
    canvas.width = ancho;
    canvas.height = alto;
    const ctx = canvas.getContext('2d');
    if (!ctx) return dataUrl;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, ancho, alto);
    ctx.drawImage(img, 0, 0, ancho, alto);

    const comprimida = canvas.toDataURL('image/jpeg', calidad);
    return comprimida.length < dataUrl.length ? comprimida : dataUrl;
  } catch {
    return dataUrl;
  }
}

function leerArchivo(archivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(String(lector.result || ''));
    lector.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    lector.readAsDataURL(archivo);
  });
}

function cargarImagen(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('No se pudo procesar la imagen.'));
    img.src = src;
  });
}

export async function comprimirVarias(archivos: FileList | File[], maximo = 8): Promise<string[]> {
  const lista = Array.from(archivos).slice(0, maximo);
  const resultados: string[] = [];
  for (const archivo of lista) {
    resultados.push(await comprimirImagen(archivo));
  }
  return resultados;
}
