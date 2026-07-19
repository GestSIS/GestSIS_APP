import axios from "axios";
import { jwtDecode } from "jwt-decode";

import { API_URL, AUTH_URL } from "../http/Env.js";

import { useAuthStore } from "../stores/auth/Auth.js";

const request = {
  API_URL: API_URL,
  AUTH_URL: AUTH_URL,

  _401interceptor: true,
  _refreshToken: null,
  _refreshFailed: null,
  _accessTokenValidity: null,
  _sisKey: null,

  setAccessToken(accessToken) {
    try {
      const { exp } = jwtDecode(accessToken);
      this._accessTokenValidity = exp;
    } catch (exception) {
      this._accessTokenValidity = null;
    }
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

  apiFileDownload(filename) {
    const api = axios.create({
      baseURL: API_URL,
      responseType: "arraybuffer", //TODO: next fix this bug to be able to handle error message in json format
      headers: {
        Accept: "application/pdf",
        "Content-Type": "application/json",
      },
    });

    api.interceptors.response.use(
      function (response) {
        let error = null;
        try {
          error = JSON.parse(new TextDecoder().decode(response.data)) ?? null;
        } catch (e) {
          error = null;
        }
        if (error?.error) {
          throw error.error;
        }
        return response;
      },
      function (error) {
        if (!error.response) throw error;
        const decoder = new TextDecoder();
        const res = decoder.decode(error.response.data);
        throw JSON.parse(res)?.data;
      },
    );

    if (filename) {
      api.interceptors.response.use((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        // link.target = '_blank' // If we want to open it in another tab
        link.setAttribute("download", filename);
        // link.setAttribute('download', response.headers["content-disposition"].split("filename=")[1])
        link.click();
        window.URL.revokeObjectURL(url);
        return response.data;
      });
    }

    return api;
  },

  api() {
    const api = axios.create({
      baseURL: API_URL,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    // api.interceptors.request.use(async (req) => {
    //   // Test if expired
    //   if (Date.now() < (this._accessTokenValidity || 0) * 1000) {
    //     return req;
    //   }

    //   // Expired !
    //   let response = null;

    //   // Check if a refreshToken request has already been sent
    //   if (refreshTokenPromise.value != '') {
    //     refreshTokenCountAwait.value++;

    //     // Await the result of this request
    //     try {
    //       return await refreshTokenPromise.value;
    //     } finally {
    //       refreshTokenCountAwait.value--;
    //       if (refreshTokenCountAwait.value == 0) {
    //         refreshTokenPromise.value = '';
    //       }
    //     }
    //   }

    //   // Send a refresh token request
    //   try {
    //     refreshTokenPromise.value = this.auth().post('refresh-token', {
    //       token: this._refreshToken,
    //     });
    //     response = await refreshTokenPromise.value;
    //   } catch (e) {
    //     if (e?.status === 401) {
    //       await authStore.logout())
    //       // useRouter().push({ name: 'login' })
    //       return Promise.reject(e);
    //     }
    //   } finally {
    //     if (refreshTokenCountAwait.value == 0) {
    //       refreshTokenPromise.value = '';
    //     }
    //   }

    //   // TODO: Update tokens
    //   // authStore.setTokens();
    //   this.setAccessToken();

    //   // Update axios
    //   if (req.headers?.common) {
    //     req.headers['Authorization'] = `Bearer ${response.accessToken}`;
    //   }
    //   this._refreshToken = response.refreshToken;

    //   return req;
    // });

    api.interceptors.response.use(
      (response) => {
        if (response.data.error !== undefined) {
          throw response.data.error;
        }
        // `|| response.data` would return the whole envelope for falsy payloads
        // like {"data": 0} or {"data": false}
        return response.data?.data !== undefined ? response.data.data : response.data;
      },
      async (error) => {
        if (error.config && error.response && error.response.status === 401) {
          // Refresh the access token
          try {
            await useAuthStore().refreshToken();

            // axios.defaults already contains the full "Bearer <token>" value
            error.config.headers.Authorization = axios.defaults.headers.common["Authorization"];
            // Retry the original request
            return axios({
              ...error.config,
            }).then((response) => {
              return response.data.data;
            });
          } catch (e) {
            // Refresh has failed - reject the original request
            throw error;
          }
        }

        return Promise.reject(error);
      },
    );

    return api;
  },

  auth: () => {
    const auth = axios.create({
      baseURL: AUTH_URL,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    auth.interceptors.response.use(
      function (response) {
        if (response.status === 401) {
          throw response.data;
        }
        return response.data;
      },
      function (error) {
        return Promise.reject(error.response?.data ?? error);
      },
    );
    return auth;
  },
};

export default request;
