<template>
  <RouteList :routes="routes" @stopRoute="stopRoute" @selectRoute="showRoute"></RouteList>
  <div id="map" style="height: 100vh"></div>
</template>

<script>
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import RouteList from "./RouteList.vue";
import 'leaflet-control-geocoder';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';

// Importer les icônes de Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
export default {
  name: "MapView",
  components: {
    RouteList,
  },
  data() {
    return {
      map: null,
      routeControl: null,
      routes: [
        {
          from: "Paris",
          to: "Louviers",
          coordinates: [
            [48.8566, 2.3522],
            [49.2146, 1.1483],
          ],
        },
        {
          from: "Le Mans",
          to: "Laval",
          coordinates: [
            [48.0061, 0.1996],
            [48.0781, -0.7669],
          ],
        },
        {
          from: "Nantes",
          to: "Rennes",
          coordinates: [
            [47.2184, -1.5536],
            [48.1173, -1.6778],
          ],
        },
      ],
    };
  },
  mounted() {
    this.initializeMap();
  },
  methods: {
    initializeMap() {
      // Initialiser la carte
      this.map = L.map("map").setView([48.0061, 0.1996], 8);

      // Ajouter les tuiles Google Maps
      L.tileLayer("http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
      }).addTo(this.map);
    },
    showRoute(route) {
       if (this.routeControl) {
        this.map.removeControl(this.routeControl);
      }
      const [start, end] = route.coordinates;
      this.routeControl = L.Routing.control({
        waypoints: [
          L.latLng(start), // Point de départ (Paris)
          L.latLng(end), // Point d'arrivée (Tour Eiffel)
        ],
        routeWhileDragging: true,
        lineOptions: {
          styles: [{ color: 'blue', opacity: 0.6, weight: 4 }]
        },
        createMarker: function(i, waypoint, n) {
          return L.marker(waypoint.latLng, {
            icon: L.icon({
              iconUrl: markerIcon,
              iconRetinaUrl: markerIcon2x,
              shadowUrl: markerShadow,
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            })
          });
        },
        router: L.Routing.osrmv1({
          language: 'fr', // Définir la langue en français
          serviceUrl: 'https://router.project-osrm.org/route/v1'
        }),
      }).addTo(this.map);
    },
    stopRoute() {
       if (this.routeControl) {
       this.map.removeControl(this.routeControl);
       }
    }
    // // Ajouter le contrôle de routage
  },
};
</script>

<style scoped>
#map {
  z-index: 1;
  width: 100%;
  height: 100vh;
}
</style>
