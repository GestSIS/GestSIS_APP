import Api from "/src/http/Request";

export default {
  getExecsPourArticle(articleId) {
    return Api.api().get(`articles/${articleId}/controle-execs`);
  },
  creerExec(controleId, articleId, exec) {
    return Api.api().post(`controles/${controleId}/articles/${articleId}/execs`, exec);
  },
};
