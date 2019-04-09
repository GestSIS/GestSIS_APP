import Vue from "vue";
import Router from "vue-router";
import Home from "./pages/Home";
import Login from "./pages/Login";


Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/login",
      name: "login",
      meta: { layout: "no-sidebar"},
      component: Login
    },
    {
      path: "/",
      name: "home",
      meta: { layout: "no-sidebar"},
      component: Home
    },
    {
      path: "/sapeurs",
      name: "sapeurs",
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: "about" */ "./pages/Sapeurs.vue")
    }
  ]
});
