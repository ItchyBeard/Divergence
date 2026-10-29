import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import NotFoundView from '../views/NotFoundView.vue'
import { legacyTrackerLocation } from '../data/mw4/modeNavigation'
export const routes = [
  {
    path: '/tracker',
    name: 'tracker',
    component: HomeView,
    props: (route) => ({ mode: route.query.mode }),
  },
  ...[
    ['/', 'multiplayer'],
    ['/multiplayer', 'multiplayer'],
    ['/dmz', 'dmz'],
    ['/warzone', 'warzone'],
  ].map(([path, mode]) => ({ path, redirect: (route) => legacyTrackerLocation(route, mode) })),
  { path: '/gallery', name: 'gallery', component: () => import('../views/GalleryView.vue') },
  {
    path: '/prestige',
    name: 'prestige',
    redirect: (route) => ({
      path: '/tracker',
      query: { ...route.query, prestige: '1' },
      hash: route.hash,
    }),
  },
  { path: '/mastery', name: 'mastery', component: () => import('../views/MasteryView.vue') },
  { path: '/settings', name: 'settings', component: () => import('../views/SettingsView.vue') },
  { path: '/about', name: 'about', component: () => import('../views/AboutView.vue') },
  {
    path: '/requirements',
    name: 'requirements',
    component: () => import('../views/RequirementsView.vue'),
  },
  { path: '/:pathMatch(.*)*', name: '404', component: NotFoundView },
]
export default createRouter({
  history: createWebHistory(),
  routes,
})
