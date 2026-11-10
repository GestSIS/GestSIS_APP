/**
 * Accès protégé au stockage du navigateur (localStorage / sessionStorage).
 *
 * Certains navigateurs (stockage bloqué par les préférences de vie privée,
 * contexte partitionné, ...) font lever une SecurityError sur tout accès au
 * stockage. On l'ignore pour ne pas planter l'app, mais on laisse remonter
 * toute autre erreur (ex. QuotaExceededError).
 *
 * Non réactif : relit le stockage à chaque appel (voir useStorage.js pour la
 * version réactive destinée aux composants).
 */
function isSecurityError(err) {
  return err instanceof DOMException && err.name === "SecurityError";
}

function createSafeStorage(getStorage) {
  const run = (operation, fallback) => {
    try {
      // L'accès à window.localStorage lui-même peut lever la SecurityError
      return operation(getStorage());
    } catch (err) {
      if (!isSecurityError(err)) {
        throw err;
      }
      return fallback;
    }
  };

  const get = (key) => run((storage) => storage.getItem(key), null);
  const set = (key, value) => run((storage) => storage.setItem(key, value));
  const remove = (key) => run((storage) => storage.removeItem(key));

  return {
    get,
    set,
    remove,
    /** Valeur JSON, ou null si absente ou illisible (contenu corrompu) */
    getJson(key) {
      const value = get(key);
      if (value === null) {
        return null;
      }
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    },
    setJson(key, value) {
      set(key, JSON.stringify(value));
    },
  };
}

export const safeLocalStorage = createSafeStorage(() => window.localStorage);
export const safeSessionStorage = createSafeStorage(() => window.sessionStorage);
