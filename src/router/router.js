import { createWebHistory, createRouter } from 'vue-router'
import { getAuth } from 'firebase/auth'; // Importation de l'authentification Firebase
import ListUsersComponent from '@/components/admin/ListUsersComponent.vue';
import HobbyComponent from '@/components/admin/HobbyComponent.vue';

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
        meta: { requiresAuth: true } // Ajout d'un meta field pour indiquer que l'authentification est requise
    },
    {
        path: '/administration',
        name: 'AdministrationView',
        component: () => import('../views/AdministrationView.vue'),
        meta: { requiresAuth: true }, // Ajout d'un meta field pour indiquer que l'authentification est requise
        children: [
            {
                path: '',
                component: ListUsersComponent
            },
            {
                path: 'hobby',
                component: HobbyComponent
            }
        ]
    }

];


const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
    scrollBehavior(to, from, savedPosition) {
        return { top: 0 }
    }
})

router.beforeEach((to, from, next) => {
    const auth = getAuth(); // Obtenir l'instance d'authentification
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

    if (requiresAuth && !auth.currentUser) {
        // Si la route nécessite une authentification et que l'utilisateur n'est pas connecté
        next('/'); 
    } else {
        next(); // Sinon, permet la navigation
    }
});
export default router;
