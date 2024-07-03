import { createApp } from 'vue';
import 'leaflet/dist/leaflet.css';

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import router from './router/router'
import store from './store';
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import App from './App.vue';

const vuetify = createVuetify({
    components,
    directives,
})

createApp(App).use(store).use(router).use(vuetify).mount('#app');
