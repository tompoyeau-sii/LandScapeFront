import { createWebHistory, createRouter } from 'vue-router';
import { getAuth } from 'firebase/auth';
import store from '@/store';
import ListUsersComponent from '@/components/admin/ListUsersComponent.vue';
import HobbyComponent from '@/components/admin/HobbyComponent.vue';
import CompaniesListComponent from '@/components/ael/CompaniesListComponent.vue';
import CompanyDetailsComponent from '@/components/ael/CompanyDetailsComponent.vue';
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
        meta: { requiresAuth: true, requiresAEL: true },
        children: [
            {
                path: 'entreprises',
                name: 'CompaniesList',
                component: CompaniesListComponent,
                meta: { requiresAuth: true },
            },
            {
                path: 'entreprises/:id',
                name: 'CompanyDetails',
                component: CompanyDetailsComponent,
                meta: { requiresAuth: true },
                beforeEnter: (to, from, next) => {
                    const currentUser = store.getters.getUser;
                    const companyId = parseInt(to.params.id); // Récupérer l'ID de l'entreprise depuis les paramètres de l'URL

                    // Vérification si l'utilisateur a accès à cette entreprise
                    const hasAccess = currentUser.companies.some(company => company.id === companyId);

                    if (hasAccess) {
                        next();
                    } else {
                        next('/ael/entreprises'); // Rediriger si l'utilisateur n'a pas accès
                    }
                }
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
    const auth = getAuth();
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);
    const requiresAEL = to.matched.some(record => record.meta.requiresAEL);
    const currentUser = store.getters.getUser;

    if (requiresAuth && !auth.currentUser) {
        next('/');
    } else if (requiresAuth && requiresAdmin && currentUser?.right.id != 2) {
        next('/');
    } else if (requiresAuth && requiresAEL && currentUser?.right.id != 3) {
        next('/');
    } else {
        next();
    }
});

export default router;