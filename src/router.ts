import { createRouter, createWebHistory } from "vue-router";
import IndirectError from "./pages/IndirectError.vue";
import SimpleError from "./pages/SimpleError.vue";

export const routes = [
  { path: '/simpleError', component: SimpleError },
  { path: '/indirectError', component: IndirectError },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
