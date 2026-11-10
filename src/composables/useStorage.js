import { getCurrentScope, onScopeDispose, ref, toValue, watch } from "vue";
import { safeLocalStorage, safeSessionStorage } from "../tools/storage.js";

/**
 * Valeur réactive synchronisée avec le stockage du navigateur : modifier la ref
 * l'enregistre, la mettre à null (ou undefined) la supprime du stockage.
 *
 * Destiné à l'état d'interface des composants (thème, filtres...). Pour les
 * jetons, utiliser TokenService : il relit le stockage à chaque appel.
 *
 * @param {Object} storage safeLocalStorage ou safeSessionStorage
 * @param {string | import("vue").Ref<string> | (() => string)} key clé, éventuellement réactive :
 *   quand elle change, la valeur est relue sous la nouvelle clé
 * @param {any} defaultValue valeur si rien n'est stocké
 * @param {{ raw?: boolean, syncTabs?: boolean }} options
 *   raw : texte brut au lieu de JSON (valeurs déjà enregistrées ainsi)
 *   syncTabs : suit les modifications faites dans les autres onglets (localStorage uniquement)
 */
function useStorage(storage, key, defaultValue, { raw = false, syncTabs = false } = {}) {
  const read = () => {
    const value = raw ? storage.get(toValue(key)) : storage.getJson(toValue(key));
    return value ?? structuredClone(defaultValue);
  };

  const value = ref(read());

  // Une valeur relue ne doit pas être réécrite (sinon la valeur par défaut serait enregistrée)
  let reading = false;
  const reload = (newValue) => {
    reading = true;
    value.value = newValue;
    reading = false;
  };

  watch(
    value,
    (newValue) => {
      if (reading) {
        return;
      }
      if (newValue === null || newValue === undefined) {
        storage.remove(toValue(key));
      } else if (raw) {
        storage.set(toValue(key), newValue);
      } else {
        storage.setJson(toValue(key), newValue);
      }
    },
    // sync : le flag `reading` doit encore être levé quand le watcher s'exécute
    { deep: true, flush: "sync" },
  );

  watch(
    () => toValue(key),
    () => reload(read()),
  );

  if (syncTabs) {
    // Déclenché uniquement dans les autres onglets que celui qui écrit
    const onStorage = (event) => {
      if (event.storageArea === window.localStorage && event.key === toValue(key)) {
        reload(read());
      }
    };
    window.addEventListener("storage", onStorage);
    if (getCurrentScope()) {
      onScopeDispose(() => window.removeEventListener("storage", onStorage));
    }
  }

  return value;
}

export function useLocalStorage(key, defaultValue = null, options = {}) {
  return useStorage(safeLocalStorage, key, defaultValue, options);
}

export function useSessionStorage(key, defaultValue = null, options = {}) {
  return useStorage(safeSessionStorage, key, defaultValue, { ...options, syncTabs: false });
}
