import { createWebHistory, createRouter } from 'vue-router'
import Home from '../../src/views/Home.vue'
import Dev from '../../src/views/Dev.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/dev',
    name: 'Dev',
    component: Dev,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
