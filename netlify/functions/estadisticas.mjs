/* =========================================================
   Datos para el panel privado (estadisticas.html), en Netlify.
   Solo responde con la clave correcta: la variable de entorno
   STATS_KEY. En tu propio servidor lo hace servidor/api.mjs.
   ========================================================= */
import { getStore } from '@netlify/blobs';
import { igual, ultimosDias, diaVacio } from '../../servidor/contador.mjs';

export const config = { path: '/api/estadisticas' };

const json = (cuerpo, status = 200) => new Response(JSON.stringify(cuerpo), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
});

export default async (req) => {
  const clave = (globalThis.Netlify?.env?.get('STATS_KEY')) || process.env.STATS_KEY;
  if (!clave) return json({ error: 'falta-clave' }, 500);
  const auth = req.headers.get('authorization') || '';
  if (!igual(auth, `Bearer ${clave}`)) return json({ error: 'clave-incorrecta' }, 401);

  const n = Math.min(90, Math.max(1, parseInt(new URL(req.url).searchParams.get('dias'), 10) || 30));
  const store = getStore({ name: 'estadisticas', consistency: 'strong' });
  const dias = await Promise.all(ultimosDias(n).map(async (dia) => {
    const d = await store.get(dia, { type: 'json' });
    return { dia, ...diaVacio(), ...(d || {}) };
  }));
  return json({ dias });
};
