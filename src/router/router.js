import { createWebHistory, createRouter } from 'vue-router'


const routes = [
    {
        path: '/',
        name: 'MapView',
        component: () => import('../views/MapView.vue'),
    },
    {
        path: '/inscription',
        name: 'RegisterView',
        component: () => import('../views/RegisterView.vue'),
    },
    {
        path: '/profil',
        name: 'AccountView',
        component: () => import('../views/AccountView.vue'),
    }

];


const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
    scrollBehavior(to, from, savedPosition) {
        return { top: 0 }
    }
})
export default router;
