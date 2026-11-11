import axios from "axios";

import { API_URL, AUTH_URL } from "../http/Env.js";

import { useAuthStore } from "../stores/auth/Auth.js";

const JSON_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

// L'API enveloppe ses réponses dans `{ data: … }`. `|| response.data` renverrait
// l'enveloppe entière pour des valeurs falsy comme {"data": 0} ou {"data": false}.
const unwrap = (response) =>
  response.data?.data !== undefined ? response.data.data : response.data;

// Les appelants reçoivent le corps JSON de l'erreur (message, errors…) plutôt que l'erreur axios.
const errorBody = (error) => error.response?.data ?? error;

const isUnauthorized = (error) => error.config && error.response?.status === 401;

/**
 * Rafraîchit le jeton puis rejoue la requête initiale (via axios nu, sans
 * intercepteurs : pas de boucle si le rejeu renvoie encore 401).
 * - échec du refresh → rejette l'erreur 401 d'origine (logout déjà fait par le store) ;
 * - échec du rejeu → rejette l'erreur *du rejeu* (ex. 422 et ses erreurs de champs),
 *   pas le 401 initial qui n'a plus de sens.
 * Renvoie la réponse axios brute du rejeu.
 */
const retryAfterRefresh = async (error) => {
  try {
    await useAuthStore().refreshToken();
  } catch {
    throw error;
  }
  // axios.defaults contient déjà la valeur complète « Bearer <token> »
  error.config.headers.Authorization = axios.defaults.headers.common["Authorization"];
  return axios({ ...error.config });
};

const createClient = (baseURL, { headers, ...config } = {}) =>
  axios.create({ baseURL, ...config, headers: { ...JSON_HEADERS, ...headers } });

/**
 * Client JSON : renvoie le contenu de l'enveloppe `data`, rejette le corps de l'erreur.
 * `refreshOn401` : jeton expiré → refresh + rejeu. Jamais côté Auth, où un 401 est une
 * réponse métier (identifiants ou code 2FA invalides) et non un jeton à rafraîchir.
 */
const createJsonClient = (baseURL, { headers, refreshOn401 = false } = {}) => {
  const client = createClient(baseURL, { headers });
  client.interceptors.response.use(unwrap, async (error) => {
    if (refreshOn401 && isUnauthorized(error)) {
      try {
        return unwrap(await retryAfterRefresh(error));
      } catch (e) {
        throw errorBody(e);
      }
    }
    throw errorBody(error);
  });
  return client;
};

// Corps d'erreur d'un téléchargement (`responseType: arraybuffer`) : JSON de l'API
// en principe, mais peut être du HTML (502 du proxy) ou vide. Un objet vide laisse
// l'appelant (useDownload) afficher son message par défaut.
const parseDownloadError = (error) => {
  const data = error.response?.data;
  if (!data) return {};
  try {
    const text = data instanceof ArrayBuffer ? new TextDecoder().decode(data) : data;
    return typeof text === "string" ? JSON.parse(text) : text;
  } catch {
    return {};
  }
};

const saveFile = (response, filename) => {
  const type = response.headers?.["content-type"];
  const blob = new Blob([response.data], type ? { type } : undefined);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  link.click();
  // Révocation différée : certains navigateurs lisent l'URL après le clic.
  setTimeout(() => window.URL.revokeObjectURL(url), 0);
};

const request = {
  API_URL: API_URL,
  AUTH_URL: AUTH_URL,

  _sisKey: null,

  setAccessToken(accessToken) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
  },

  setSisKey(sis_key) {
    if (sis_key == null) {
      delete axios.defaults.headers.common["Sis-Key"];
    } else {
      axios.defaults.headers.common["Sis-Key"] = sis_key;
    }
    this._sisKey = sis_key ?? null;
  },

  getSisKey() {
    return this._sisKey;
  },

  // Sans `filename`, renvoie simplement le contenu binaire (ex. logo affiché dans la page).
  apiFileDownload(filename) {
    const api = createClient(API_URL, {
      responseType: "arraybuffer",
      headers: { Accept: "application/pdf" },
    });

    // Les intercepteurs de réponse s'enchaînent dans l'ordre d'enregistrement :
    // 1. jeton expiré → refresh + rejeu (la réponse du rejeu poursuit la chaîne) ;
    // 2. erreur (initiale ou du rejeu) → décodage du corps ArrayBuffer ;
    // 3. succès → enregistrement du fichier.
    api.interceptors.response.use(undefined, (error) =>
      isUnauthorized(error) ? retryAfterRefresh(error) : Promise.reject(error),
    );

    api.interceptors.response.use(undefined, (error) => {
      if (!error.response) throw error;
      throw parseDownloadError(error);
    });

    if (filename) {
      api.interceptors.response.use((response) => {
        saveFile(response, filename);
        return response.data;
      });
    }

    return api;
  },

  api: () => createJsonClient(API_URL, { refreshOn401: true }),

  auth: () => createJsonClient(AUTH_URL),

  // Variante de `auth()` portant un jeton explicite plutôt que l'access token
  // global (`axios.defaults.headers.common`) : utilisée pour le flow 2FA, où
  // les jetons pre-auth/setup sont volontairement à portée restreinte et ne
  // doivent jamais remplacer la session courante (voire n'existent que quand
  // aucune session n'existe encore).
  authWithToken: (token) =>
    createJsonClient(AUTH_URL, { headers: { Authorization: `Bearer ${token}` } }),
};

export default request;
