// In-memory localStorage mock for session use
// Provides a localStorage-like API but stores data in memory instead of browser storage
const memoryLocalStorage = (() => {
  let store = {};

  return {
    getItem(key) {
      return store[key] ?? null;
    },
    setItem(key, value) {
      store[key] = value;
    },
    removeItem(key) {
      delete store[key];
    },
    clear() {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key(index) {
      const keys = Object.keys(store);
      return keys[index] ?? null;
    }
  };
})();

export default memoryLocalStorage;
