// store.js ou store/index.js

import { createStore } from 'vuex';
import { auth } from '../firebaseConfig'; // Assurez-vous que le chemin est correct
import { signInWithEmailAndPassword } from 'firebase/auth';

export default createStore({
    state: {
        user: null,
        authError: null,
    },
    mutations: {
        setUser(state, user) {
            state.user = user;
        },
        setAuthError(state, error) {
            state.authError = error;
        },
        clearUser(state) {
            state.user = null;
        },
        clearAuthError(state) {
            state.authError = null;
        },
    },
    actions: {
        async login({ commit }, { email, password }) {
            try {
                commit('clearAuthError');
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                commit('setUser', userCredential.user);
            } catch (err) {
                commit('setAuthError', err.message);
            }
        },
        async logout({ commit }) {
            try {
                await auth.signOut();
                commit("setUser", null); // Supposant que vous avez une mutation pour gérer l'état utilisateur
            } catch (error) {
                console.error("Erreur lors de la déconnexion:", error);
            }
        },
    },
});
