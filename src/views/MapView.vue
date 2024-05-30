<template>
  <overlay @stopRoute="stopRoute" @selectRoute="showRoute"></overlay>
  <div id="map" style="height: 100vh"></div>
</template>

<script>
import RouteList from "../components/RouteList.vue";
import SearchView from "../components/SearchComponent.vue";

//Import Leaflet
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-control-geocoder";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";

// Importer les icônes de Leaflet
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import startIconUrl from "@/assets/start.png";
import stepIconUrl from "@/assets/step.png";
import endIconUrl from "@/assets/end.png";
import Overlay from "@/components/Overlay.vue";

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
    SearchView,
    Overlay,
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
          waypoints: [
            [49.0083, 2.5386], // Ajoutez des étapes intermédiaires ici
          ],
        },
        {
          from: "Le Mans",
          to: "Laval",
          coordinates: [
            [48.0061, 0.1996],
            [48.0781, -0.7669],
          ],
          waypoints: [
            [48.0333, -0.3333], // Ajoutez des étapes intermédiaires ici
          ],
        },
        {
          from: "Nantes",
          to: "Rennes",
          coordinates: [
            [47.2184, -1.5536],
            [48.1173, -1.6778],
          ],
          waypoints: [
            [47.8, -1.5], // Ajoutez des étapes intermédiaires ici
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
      this.map = L.map("map", {
        zoomControl: false,
      }).setView([48.0061, 0.1996], 8);
      L.tileLayer("http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
      }).addTo(this.map);
    },
    showRoute(route) {
      if (this.routeControl) {
        this.map.removeControl(this.routeControl);
      }

      let waypoints = [];

      if (route.waypoints) {
        waypoints = [
          L.latLng(route.coordinates[0]), // Point de départ
          ...route.waypoints.map((coord) => L.latLng(coord)), // Étapes intermédiaires
          L.latLng(route.coordinates[1]), // Point d'arrivée
        ];
      } else {
        waypoints = [
          L.latLng(route.coordinates[0]), // Point de départ
          L.latLng(route.coordinates[1]), // Point d'arrivée
        ];
      }

      this.routeControl = L.Routing.control({
        waypoints: waypoints,
        lineOptions: {
          styles: [{ color: "blue", opacity: 0.6, weight: 4 }],
        },
        createMarker: function (i, waypoint, n) {
          let iconUrl = markerIcon;
          if (i === 0) {
            iconUrl = startIconUrl; // Point de départ
          } else if (i === n - 1) {
            iconUrl = endIconUrl; // Point d'arrivée
          } else {
            iconUrl = stepIconUrl; // Étapes intermédiaires
          }
          return L.marker(waypoint.latLng, {
            icon: L.icon({
              iconUrl: iconUrl,
              iconRetinaUrl: iconUrl,
              iconSize: [41, 41],
              popupAnchor: [1, -34],
            }),
          });
        },
        router: L.Routing.osrmv1({
          language: "fr",
          serviceUrl: "https://router.project-osrm.org/route/v1",
        }),
      }).addTo(this.map);
    },
    stopRoute() {
      if (this.routeControl) {
        this.map.removeControl(this.routeControl);
      }
    },
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
