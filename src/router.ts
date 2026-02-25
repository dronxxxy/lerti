import { createRouter, createWebHistory } from "vue-router";
import IndirectError from "./pages/IndirectError.vue";
import SimpleError from "./pages/simpleError/SimpleError.vue";
import Approximation from "./pages/Approximation.vue";

export const routes = [
  { path: '/simpleError', component: SimpleError },
  { path: '/indirectError', component: IndirectError },
  { path: '/approximation', component: Approximation },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
