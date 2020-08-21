import axios from 'axios';

const API_URL = process.env.VUE_APP_API_ENDPOINT;
const AUTH_URL = process.env.VUE_APP_AUTH_ENDPOINT;

// console.log(API_URL)
// console.log(AUTH_URL)
import store from '@/store';

const request = {
  _401interceptor: true,
  _refreshToken: null,
  _refreshFailed: null,

  setAccessToken: (token) => {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  apiFileDownload() {
    let api = axios.create({
      baseURL: API_URL,
      responseType: 'array',
      headers: {
        Accept: 'application/pdf',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

    //TODO Choose where to extract this part of code to make it more general for pdf download
    //     .then((response) => {
    //       // const url = window.URL.createObjectURL(new Blob([response.data]));
    //       // const link = document.createElement('a');
    //       // link.href = url;
    //       // // link.target = '_blank' // If we want to open it in another tab
    //       // console.log(response);
    //       // link.setAttribute('download', 'file.pdf')
    //       // // link.setAttribute('download', response.headers["content-disposition"].split("filename=")[1])
    //       // link.click();
    //       // window.URL.revokeObjectURL(url);
    //       return response.data
    //     });

    return api;
  },

  api() {
    let api = axios.create({
      baseURL: API_URL,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

    api.interceptors.response.use(
      (response) => {
        if (response.data.error !== undefined) {
          throw response.data.error;
        }
        return response.data.data;
      },
      async (error) => {
        if (error.config && error.response && error.response.status === 401) {
          // Refresh the access token
          try {
            await store.dispatch('refreshToken');

            error.config.headers.Authorization = `Bearer ${axios.defaults.headers.common['Authorization']}`;

            // Retry the original request
            return axios({
              method: error.config.method,
              url: error.config.url,
              data: error.config.data,
            }).then((response) => {
              return response.data.data;
            });
          } catch (e) {
            // Refresh has failed - reject the original request
            throw error;
          }
        }

        return Promise.reject(error);
      }
    );

    return api;
  },

  auth: () => {
    let auth = axios.create({
      baseURL: AUTH_URL,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
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
        // console.log(error);
        // Do something with response error
        return Promise.reject(error.response.data);
      }
    );

    return auth;
  },
};

export default request;
