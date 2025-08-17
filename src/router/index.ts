import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';
import Stations from '../views/Stations.vue';
import Settings from '../views/Settings.vue';
import StationDetail from '../views/StationDetail.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard,
    },
    {
      path: '/stations',
      name: 'stations',
      component: Stations,
    },
    {
      path: '/stations/:id',
      name: 'station-detail',
      component: StationDetail,
      props: true,
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings,
    },
  ],
});

export default router;
