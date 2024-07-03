<template>
  <overlay
    @stopRoute="stopRoute"
    @selectRoute="showRoute"
    @locationSelected="handleLocationSelected"
    :distance="routeDistance"
    :time="routeTime"
  ></overlay>
  <div v-if="!user">
    <Connexion></Connexion>
  </div>
  <div v-else>
    <Account></Account>
  </div>
  
  <div>
    <div id="map" style="height: 100vh"></div>
  </div>
</template>

<script>
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-control-geocoder";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import Overlay from "@/components/OverlayComponent.vue";
import Connexion from "@/components/ConnexionComponent.vue";
import Account from "@/components/AccountComponent.vue"; // Importez le composant Account
import { mapState } from 'vuex';
import {
  createMarker,
  createRouteControl,
  fitMapToBounds,
} from "@/utils/mapUtils";

export default {
  name: "MapView",
  components: {
    Overlay,
    Connexion,
    Account,  // Déclarez le composant Account
  },
  data() {
    return {
      map: null,
      routeControl: null,
      point: null,
      startMarker: null,
      endMarker: null,
      routeDistance: "0",
      routeTime: "0",
    };
  },
  computed: {
    ...mapState(['user']),  // Ajoutez l'état de l'utilisateur depuis Vuex
  },
  mounted() {
    this.initializeMap();
  },
  methods: {
    // Initialise la carte
    initializeMap() {
      this.map = L.map("map", {
        zoomControl: false,
        // On set la view sur des coordonnées (ici Le mans)
      }).setView([48.0061, 0.1996], 8);
      // On récupère les tuiles de google maps
      L.tileLayer("http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
      }).addTo(this.map);
    },

    //Gestion du zoom de la carte avec en paramètre une latitude et longitude
    zoomToLocation(lat, lng) {
      // Zoom initier à 13 mais peut-être modifier pour avoir un plus gros grossissement ou plus petit (20 => zoommer / 1 => dézoomer)
      this.map.setView([lat, lng], 13);
    },

    // Méthode permettant de récupérer la 1er input entrée par l'utilisateur pour pouvoir aller faire un zoom sur la carte
    handleLocationSelected(location) {
      this.point = location;
      // Zoom sur la localisation
      this.zoomToLocation(location.lat, location.lng);
      // Création du marker
      this.startMarker = this.updateMarker(this.startMarker, location, true);
    },

    //Permet de modifier l'emplacement d'un marker
    updateMarker(marker, location) {
      if (marker) this.map.removeLayer(marker);
      return createMarker(this.map, location);
    },

    // Création de l'itinéraire
    showRoute(route) {
      //On enlève les markers déjà présents
      this.removeMarkers();
      //On regarde s'il n'y a pas déjà une route qui existe
      if (this.routeControl) {
        //Si oui, on la supprime
        this.map.removeControl(this.routeControl);
      }

      // On créer la route via la méthode du fichier mapUtils.js
      this.routeControl = createRouteControl(this.map, route);

      // Ajout de l'écouteur d'événement pour obtenir les informations de la route
      this.routeControl.on("routesfound", (e) => {
        var routes = e.routes;
        var summary = routes[0].summary;
        this.routeDistance = (summary.totalDistance / 1000).toFixed(0); // Convert to kilometers
        this.routeTime = (summary.totalTime / 60).toFixed(2); // Convert to minutes

        // Émettre l'événement pour envoyer les données à Overlay
        this.$emit("update:distance", this.routeDistance);
        this.$emit("update:time", this.routeTime);
      });

      //On gére le zoom pour que les points de départ et d'arrivée soient visibles par l'utilisateur
      fitMapToBounds(this.map, route.coordinates[0], route.coordinates[1]);
    },

    // Permet de retirer les markers
    removeMarkers() {
      if (this.startMarker) {
        // On retire le marker de départ de la carte
        this.map.removeLayer(this.startMarker);
        // On réinitialise la valeur du marker à null
        this.startMarker = null;
      }
      if (this.endMarker) {
        // On retire le marker d'arrivé de la carte
        this.map.removeLayer(this.endMarker);
        // On réinitialise la valeur du marker à null
        this.endMarker = null;
      }
    },

    // Stop l'itinéraire
    stopRoute() {
      if (this.routeControl) {
        this.map.removeControl(this.routeControl);
        this.routeDistance = 0; // Convert to kilometers
        this.routeTime = 0; // Convert to minutes

        // Émettre l'événement pour envoyer les données à Overlay
        this.$emit("update:distance", this.routeDistance);
        this.$emit("update:time", this.formattedRouteTime);
      }
    },
  },
};
</script>

<style>
#map {
  z-index: 1;
  width: 100%;
  height: 100vh;
}

/* Déplace l'élément en bas à gauche */
.leaflet-bar {
  display: none;
  position: fixed;
  bottom: 0; /* Place l'élément en bas de l'écran */
  left: 0; /* Place l'élément à gauche de l'écran */
  margin: 10px; /* Ajoute une marge pour l'espacement */
  box-shadow: 0 1px 2px rgba(60, 64, 67, 0.3),
    0 2px 6px 2px rgba(60, 64, 67, 0.15);
  margin: 1%;
  padding: 1%;
  border: none;
  border-radius: 15px;
  background-color: white;
  z-index: 2;
  width: 17%;
}

html {
  overflow: hidden;
}
</style>
