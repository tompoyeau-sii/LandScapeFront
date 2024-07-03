import { createWebHistory, createRouter } from 'vue-router'


const routes = [
    {
        path: '/',
        name: 'MapView',
        component: () => import('../views/MapView.vue'),
    },
    {
        path: '/inscription',
        name: 'CreateAccountView',
        component: () => import('../views/CreateAccountView.vue'),
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
