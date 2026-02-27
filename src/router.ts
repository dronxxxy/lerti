import { createRouter, createWebHistory } from "vue-router";
import IndirectErrorPage from "./pages/indirectError/IndirectErrorPage.vue";
import SimpleErrorPage from "./pages/simpleError/SimpleErrorPage.vue";
import ApproximationPage from "./pages/approximation/ApproximationPage.vue";

export const routes = [
  { path: '/simpleError', component: SimpleErrorPage },
  { path: '/indirectError', component: IndirectErrorPage },
  { path: '/approximation', component: ApproximationPage },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
