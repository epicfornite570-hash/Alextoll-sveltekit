/* =========================================================
   Contador de visitas propio (Netlify Function + Netlify Blobs)
   Solo se usa si la web está en Netlify. En tu propio servidor
   (nginx) hace lo mismo servidor/api.mjs.
   La lógica de contar está en servidor/contador.mjs (compartida).
   ========================================================= */
import { getStore } from '@netlify/blobs';
import { BOTS, registrar } from '../../servidor/contador.mjs';

export const config = { path: '/api/visita' };

export default async (req) => {
  if (req.method !== 'POST') return new Response(null, { status: 405 });
  const ua = req.headers.get('user-agent') || '';
  if (BOTS.test(ua)) return new Response(null, { status: 204 });

  let datos;
  try { datos = JSON.parse(await req.text()); } catch { return new Response(null, { status: 400 }); }
  if (!datos || typeof datos !== 'object') return new Response(null, { status: 400 });

  const hoy = new Date().toISOString().slice(0, 10);
  const propio = new URL(req.url).hostname.replace(/^www\./, '');
  const store = getStore({ name: 'estadisticas', consistency: 'strong' });
  const actual = await store.get(hoy, { type: 'json' });
  await store.setJSON(hoy, registrar(actual, datos, ua, propio));
  return new Response(null, { status: 204 });
};
