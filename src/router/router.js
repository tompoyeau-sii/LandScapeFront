import { createWebHistory, createRouter } from 'vue-router';
import { getAuth } from 'firebase/auth'; // Importation de l'authentification Firebase
import ListUsersComponent from '@/components/admin/ListUsersComponent.vue';
import store from '@/store'; // Assurez-vous que le store Vuex est correctement importé
import HobbyComponent from '@/components/admin/HobbyComponent.vue';
import CompaniesListComponent from '@/components/ael/CompaniesListComponent.vue';
import CompanyDetailsComponent from '@/components/ael/CompanyDetailsComponent.vue'; // Importez votre composant de détails de l'entreprise
import CompanyView from '@/views/CompanyView.vue';

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
        meta: { requiresAuth: true }
    },
    {
        path: '/ael',
        name: 'CompanyView',
        component: CompanyView,
        meta: { requiresAuth: true },
        children: [
            {
                path: 'entreprises',
                name: 'CompaniesList',
                component: CompaniesListComponent,
                meta: { requiresAuth: true },
                // Suppression du niveau enfant ici
            },
            {
                path: 'entreprises/:id',
                name: 'CompanyDetails',
                component: CompanyDetailsComponent,
                meta: { requiresAuth: true },
            }
        ]
    },
    {
        path: '/administration',
        name: 'AdministrationView',
        component: () => import('../views/AdministrationView.vue'),
        meta: { requiresAuth: true, requiresAdmin: true },
        children: [
            {
                path: 'users',
                name: 'ListUsers',
                component: ListUsersComponent
            },
            {
                path: 'hobbies',
                name: 'Hobby',
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
});

router.beforeEach((to, from, next) => {
    const auth = getAuth(); // Obtenir l'instance d'authentification
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);
    const currentUser = store.getters.getUser; // Obtenir l'utilisateur actuel depuis le store
    if (requiresAuth && !auth.currentUser) {
        // Si la route nécessite une authentification et que l'utilisateur n'est pas connecté
        next('/');
    } else if (requiresAuth && requiresAdmin && currentUser?.right.id != 2) {
        // Si la route nécessite l'accès administrateur et que l'utilisateur n'a pas le droit
        next('/');
    } else {
        next(); // Sinon, permet la navigation
    }
});

export default router;
