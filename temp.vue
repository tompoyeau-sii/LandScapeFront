<template>
  <div>
    <RouteList :routes="routes" @selectRoute="showRoute"></RouteList>
    <l-map 
      :zoom="zoom" 
      :center="center" 
      style="height: 100vh; width: 100%;" 
      :options="{ zoomControl: true, dragging: true }"
    >
      <l-tile-layer :url="googleStreetsUrl" :attribution="googleStreetsAttribution" :options="googleStreetsOptions"></l-tile-layer>
      <l-marker v-if="marker" :lat-lng="marker"></l-marker>
      <l-routing-machine :routes="routingRoutes"></l-routing-machine>
    </l-map>
  </div>
</template>

<script>
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet/dist/leaflet.css';
import { LMap, LTileLayer, LMarker, LRoutingMachine } from "@vue-leaflet/vue-leaflet";
import RouteList from "./RouteList.vue";
import axios from 'axios';

export default {
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LRoutingMachine,
    RouteList
  },
  data() {
    return {
      zoom: 8,
      center: [48.0061, 0.1996], // Coordonnées du Mans par défaut
      googleStreetsUrl: 'http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      googleStreetsAttribution: '&copy; <a href="https://www.google.com/maps">Google Maps</a>',
      googleStreetsOptions: {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
      },
      marker: null,
      routes: [
        { from: 'Paris', to: 'Louviers', coordinates: [[48.8566, 2.3522], [49.2146, 1.1483]] },
        { from: 'Le Mans', to: 'Laval', coordinates: [[48.0061, 0.1996], [48.0781, -0.7669]] },
        { from: 'Nantes', to: 'Rennes', coordinates: [[47.2184, -1.5536], [48.1173, -1.6778]] }
      ]
    };
  },
  computed: {
    routingRoutes() {
      return this.routes.map(route => ({
        waypoints: route.coordinates.map(coord => L.latLng(coord[0], coord[1])),
        routeWhileDragging: true,
        lineOptions: { styles: [{ color: 'red', opacity: 0.6, weight: 6 }] }
      }));
    }
  },
  methods: {
    async showRoute(route) {
      const [start, end] = route.coordinates;
      try {
        const response = await axios.get(`https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?geometries=geojson`);
        const routeData = response.data.routes[0].geometry.coordinates;
        const formattedRoute = routeData.map(coord => [coord[1], coord[0]]); // Inverser l'ordre des coordonnées pour Leaflet
        this.routes = this.routes.map(r => r === route ? { ...r, coordinates: formattedRoute } : r);
        this.center = formattedRoute[0];
      } catch (error) {
        console.error("Erreur lors de la récupération de l'itinéraire :", error);
      }
    },
  }
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');

.custom-font {
  font-family: 'Roboto', sans-serif;
}

.leaflet-container {
  z-index: 1;
  height: 100vh;
  width: 100%;
}
</style>
