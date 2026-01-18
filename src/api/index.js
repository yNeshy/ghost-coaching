// Lightweight API wrapper for local JSON entities
// - Auto-imports any JSON files under ./entities/
// - Exposes `api.entities.<Name>` with mock methods: list, filter, create, update, delete

// Use Vite's import.meta.globEager when available to automatically pick up JSON files.
const modules = typeof import.meta !== 'undefined' && import.meta.globEager
  ? import.meta.globEager('./entities/*.json')
  : {};

const rawEntities = Object.fromEntries(
  Object.entries(modules).map(([path, mod]) => {
    const name = path.split('/').pop().replace('.json', '');
    const data = (mod && (mod.default ?? mod)) || [];
    return [name, Array.isArray(data) ? data : []];
  })
);

function makeEntity(name, initialData = []) {
  // Keep an in-memory copy to simulate basic CRUD operations for local/dev use
  let data = Array.isArray(initialData) ? [...initialData] : [];

  return {
    list: (/* sort, limit */) => Promise.resolve([...data]),
    filter: (query = {}) => {
      if (!query || Object.keys(query).length === 0) return Promise.resolve([...data]);
      const result = data.filter(item =>
        Object.entries(query).every(([k, v]) => {
          // simple equality match; undefined in query means ignore
          if (v === undefined) return true;
          return item?.[k] === v;
        })
      );
      return Promise.resolve(result);
    },
    create: (obj = {}) => {
      const id = obj.id ?? `${name.toLowerCase()}-${Date.now()}`;
      const newObj = { ...obj, id };
      data.push(newObj);
      return Promise.resolve(newObj);
    },
    update: (id, patch = {}) => {
      const idx = data.findIndex(d => d.id === id);
      if (idx === -1) return Promise.resolve(null);
      data[idx] = { ...data[idx], ...patch };
      return Promise.resolve(data[idx]);
    },
    delete: (id) => {
      const idx = data.findIndex(d => d.id === id);
      if (idx === -1) return Promise.resolve(false);
      data.splice(idx, 1);
      return Promise.resolve(true);
    },
    _raw: () => data
  };
}

// Build entities map from discovered JSON files
const entities = {};
for (const [name, arr] of Object.entries(rawEntities)) {
  entities[name] = makeEntity(name, arr);
}

const api = { entities };

export default api;
export { api };
