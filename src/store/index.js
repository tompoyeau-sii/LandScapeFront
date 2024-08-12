// src/store/index.js
import { createStore } from 'vuex';
import { auth } from '../plugins/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import apiService from '@/services/apiService';

export default createStore({
    state: {
        user: null,
        userHobbies: null,
        hobbies: [],  // Ajout pour stocker les hobbies disponibles
        authError: null,
    },
    mutations: {
        setUser(state, user) {
            state.user = user;
        },
        setUserHobbies(state, userHobbies) {
            state.userHobbies = userHobbies;
        },
        setHobbies(state, hobbies) {
            state.hobbies = hobbies;  // Ajout pour stocker les hobbies disponibles
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
                const firebaseUser = userCredential.user;
                const userData = await apiService.get(`/users/${firebaseUser.uid}`);
                const userHobbies = await apiService.get(`/users/${userData.id}/hobbies`);
                console.log(userData)
                commit('setUser', userData);
                commit('setUserHobbies', userHobbies);
            } catch (err) {
                console.error(err);
                commit('setAuthError', err.message);
            }
        },
        async logout({ commit }) {
            try {
                await auth.signOut();
                commit('clearUser');
            } catch (error) {
                console.error("Erreur lors de la déconnexion:", error);
            }
        },
        async fetchUser({ commit }) {
            auth.onAuthStateChanged(async user => {
                if (user) {
                    const userData = await apiService.get(`/users/${user.uid}`);
                    const userHobbies = await apiService.get(`/users/${userData.id}/hobbies`);
                    // console.log(userData)
                    commit('setUser', userData);
                    commit('setUserHobbies', userHobbies);
 
                } else {
                    commit('clearUser');
                }
            });
        },
        async fetchAvailableHobbies({ commit }) {  // Nouvelle action pour récupérer les hobbies disponibles
            try {
                const hobbies = await apiService.get('/hobbies');
                commit('setHobbies', hobbies);
            } catch (error) {
                console.error("Erreur lors de la récupération des hobbies:", error);
            }
        }
    },
    getters: {
        getUser(state) {
            return state.user;
        },
        getUserHobbies(state) {
            return state.userHobbies;
        },
        getHobbies(state) {  // Ajout d'un getter pour récupérer les hobbies disponibles
            return state.hobbies;
        }
    },
});
