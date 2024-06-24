<template>
  <overlay
    @stopRoute="stopRoute"
    @selectRoute="showRoute"
    @locationSelected="handleLocationSelected"
  ></overlay>
  <account></account>

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
import Account from "@/components/ConnexionComponent.vue";
import { createMarker, createRouteControl, fitMapToBounds  } from "@/utils/mapUtils";

export default {
  name: "MapView",
  components: {
    Overlay,
    Account
  },
  data() {
    return {
      map: null,
      routeControl: null,
      point: null,
      startMarker: null,
      endMarker: null,
    };
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
      //On regarde si il n'y pas déjà une route qui existe
      if (this.routeControl) {
        //Si oui, on la supprime
        this.map.removeControl(this.routeControl);
      }
      
      // On créer la route via la méthode du fichier mapUtils.js
      this.routeControl = createRouteControl(this.map, route);
      //On gére le zoom pour que le points de départ et d'arrivé soit visible par l'utilisateur
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

    // Stop l'itinaire 
    stopRoute() {
      if (this.routeControl) {
        this.map.removeControl(this.routeControl);
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

html {
  overflow : hidden; 
}
</style>
