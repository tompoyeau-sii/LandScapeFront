import { createApp } from 'vue';
import 'leaflet/dist/leaflet.css';
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import App from './App.vue';
import router from './router/router';
import store from './store';
import { auth } from './plugins/firebaseConfig';
import apiService from './services/apiService';

const vuetify = createVuetify({
  components,
  directives,
});

let app;

auth.onAuthStateChanged(async user => {
  if (user) {
    const userData = await apiService.get(`/users/${user.uid}`);
    console.log(userData)
    const userHobbies = await apiService.get(`/users/${userData.id}/hobbies`);
    store.commit('setUser', userData);
    store.commit('setUserHobbies', userHobbies);
  } else {
    store.commit('clearUser');
  }

  // Fetch available hobbies before creating the app
  await store.dispatch('fetchAvailableHobbies');

  if (!app) {
    app = createApp(App)
      .use(store)
      .use(router)
      .use(vuetify)
      .mount('#app');
  }
});
