<template>
  <l-map :zoom="zoom" :center="center" style="height: 100vh; width: 100%;">
    <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
    <l-marker :lat-lng="marker"></l-marker>
  </l-map>
</template>

<script>
import { LMap, LTileLayer, LMarker } from "@vue-leaflet/vue-leaflet";

export default {
  components: {
    LMap,
    LTileLayer,
    LMarker,
  },
  data() {
    return {
      zoom: 13,
      center: [51.505, -0.09],
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '© OpenStreetMap contributors',
      marker: [51.505, -0.09],
    };
  },
  mounted() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this.setPosition, this.handleError);
    }
  },
  methods: {
    setPosition(position) {
      const { latitude, longitude } = position.coords;
      this.center = [latitude, longitude];
      this.marker = [latitude, longitude];
    },
    handleError(error) {
      console.error("Erreur de géolocalisation :", error);
    },
  },
};
</script>

<style>
.leaflet-container {
  height: 100vh;
  width: 100%;
}
</style>
