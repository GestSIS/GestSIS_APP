import { defineStore } from "pinia";

export const useArticleStore = defineStore("articles", {
  state: () => ({
    attribuable: [],
  }),
});
