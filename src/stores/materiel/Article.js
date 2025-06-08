import ArticleService from '../../services/materiel/ArticleService.js';
import { defineStore } from 'pinia';

export const useArticleStore = defineStore('articles', {
  state: () => ({
    attribuable: [],
  }),
});
