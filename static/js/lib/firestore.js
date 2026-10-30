/* =========================================================
   Firestore por su API REST (sin el SDK de Firestore, que pesa mucho)
   ---------------------------------------------------------
   Cada petición lleva el token del usuario que ha iniciado sesión,
   así que las reglas de deploy/firebase/firestore.rules deciden
   qué puede leer o cambiar cada uno.
   Uso:  const db = AT.firestore(projectId, () => user.getIdToken(), base?)
         await db.query('trabajos', { campo: 'email', igual: 'a@b.com' })
         await db.crear('trabajos', { ... })   → id
         await db.cambiar('trabajos', id, { estado: 'listo' })
         await db.borrar('trabajos', id)
   ========================================================= */
window.AT = window.AT || {};

/* Valor de JavaScript → formato de Firestore */
AT.aFirestore = (v) => {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(AT.aFirestore) } };
  if (typeof v === 'object') return { mapValue: { fields: AT.camposFirestore(v) } };
  return { stringValue: String(v) };
};
AT.camposFirestore = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, AT.aFirestore(v)]));

/* Formato de Firestore → valor de JavaScript */
AT.deFirestore = (v) => {
  if (!v) return null;
  if ('stringValue' in v) return v.stringValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('timestampValue' in v) return v.timestampValue;
  if ('nullValue' in v) return null;
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(AT.deFirestore);
  if ('mapValue' in v) return AT.objetoFirestore(v.mapValue.fields || {});
  return null;
};
AT.objetoFirestore = (f) => Object.fromEntries(Object.entries(f).map(([k, v]) => [k, AT.deFirestore(v)]));

AT.firestore = (projectId, token, base = 'https://firestore.googleapis.com') => {
  const raiz = `${base}/v1/projects/${projectId}/databases/(default)/documents`;

  const pedir = async (url, opciones = {}) => {
    const res = await fetch(url, {
      ...opciones,
      headers: { 'Authorization': 'Bearer ' + await token(), 'Content-Type': 'application/json' }
    });
    const datos = res.status === 204 ? {} : await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(datos.error?.message || 'Error ' + res.status);
      err.status = res.status;
      throw err;
    }
    return datos;
  };
  const doc = (d) => ({ id: d.name.split('/').pop(), ...AT.objetoFirestore(d.fields || {}) });

  return {
    /* Lista una colección; con filtro devuelve solo los documentos con campo == igual */
    async query(coleccion, filtro) {
      const structuredQuery = { from: [{ collectionId: coleccion }] };
      if (filtro) structuredQuery.where = { fieldFilter: { field: { fieldPath: filtro.campo }, op: 'EQUAL', value: AT.aFirestore(filtro.igual) } };
      const filas = await pedir(`${raiz}:runQuery`, { method: 'POST', body: JSON.stringify({ structuredQuery }) });
      return filas.filter(f => f.document).map(f => doc(f.document));
    },
    async crear(coleccion, datos) {
      return doc(await pedir(`${raiz}/${coleccion}`, { method: 'POST', body: JSON.stringify({ fields: AT.camposFirestore(datos) }) })).id;
    },
    /* Cambia solo los campos que se pasan (el resto del documento se queda igual) */
    async cambiar(coleccion, id, datos) {
      const mask = Object.keys(datos).map(k => 'updateMask.fieldPaths=' + encodeURIComponent(k)).join('&');
      return doc(await pedir(`${raiz}/${coleccion}/${encodeURIComponent(id)}?${mask}`, { method: 'PATCH', body: JSON.stringify({ fields: AT.camposFirestore(datos) }) }));
    },
    async borrar(coleccion, id) {
      await pedir(`${raiz}/${coleccion}/${encodeURIComponent(id)}`, { method: 'DELETE' });
    }
  };
};
