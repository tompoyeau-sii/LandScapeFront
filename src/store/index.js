// store/index.js

import { createStore } from 'vuex';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export default createStore({
    state: {
        user: null,
    },
    mutations: {
        setUser(state, user) {
            state.user = user;
        },
        clearUser(state) {
            state.user = null;
        },
    },
    actions: {
        async login({ commit }, { email, password }) {
            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                commit('setUser', userCredential.user);
            } catch (err) {
                throw err;
            }
        },
        async loginWithGoogle({ commit }) {
            try {
                const provider = new GoogleAuthProvider();
                const result = await signInWithPopup(auth, provider);
                commit('setUser', result.user);
            } catch (err) {
                throw err;
            }
        },
        logout({ commit }) {
            auth.signOut().then(() => {
                commit('clearUser');
            });
        },
    },
});
