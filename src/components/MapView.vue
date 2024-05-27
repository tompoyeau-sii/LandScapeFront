<template>
  <div>
    <RouteList :routes="routes" @selectRoute="showRoute"></RouteList>
    <l-map :zoom="zoom" :center="center" style="height: 100vh; width: 100%;">
      <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
      <l-marker v-if="marker" :lat-lng="marker"></l-marker>
      <l-polyline v-if="route" :lat-lngs="route" color="red"></l-polyline>
    </l-map>
  </div>
</template>

<script>
import { LMap, LTileLayer, LMarker, LPolyline } from "@vue-leaflet/vue-leaflet";
import RouteList from "./RouteList.vue";

export default {
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPolyline,
    RouteList
  },
  data() {
    return {
      zoom: 8,
      center: [48.0061, 0.1996], // Coordonnées du Mans par défaut
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '© OpenStreetMap contributors',
      marker: null,
      route: null,
      routes: [
        { from: 'Paris', to: 'Louvier', coordinates: [[48.8566, 2.3522], [49.1944, 0.3803]] },
        { from: 'Le Mans', to: 'Laval', coordinates: [[48.0061, 0.1996], [48.0719, -0.7683]] },
        { from: 'Nantes', to: 'Rennes', coordinates: [[47.2184, -1.5536], [48.1173, -1.6778]] }
      ]
    };
  },
  methods: {
    showRoute(route) {
      this.route = route.coordinates;
      this.center = this.route[0];
    }
  }
};
</script>

<style>
.leaflet-container {
  z-index: 1;
  height: 100vh;
  width: 100%;
}
</style>
