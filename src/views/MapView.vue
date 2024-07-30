<template>
  <div class="header">
    <overlay
      @stopRoute="stopRoute"
      @selectRoute="showRoute"
      @locationSelected="handleLocationSelected"
      :distance="routeDistance"
      :time="routeTime"
    ></overlay>
    <panel></panel>
  </div>
  <PoiList
    v-if="poiList"
    :poiList="poiList"
    @poi-selected="handlePoiSelected"
  ></PoiList>
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
import poiService from "@/services/poiService";
import Overlay from "@/components/OverlayComponent.vue";
import PoiList from "@/components/PoiListComponent.vue";
import { mapState } from "vuex";
import {
  createMarker,
  createPoiMarker,
  createRouteControl,
  fitMapToBounds,
} from "@/utils/mapUtils";
import Panel from "@/components/PanelComponent.vue";

export default {
  name: "MapView",
  components: {
    Overlay,
    Panel,
    PoiList,
  },
  data() {
    return {
      map: null,
      routeControl: null,
      poiList: null,
      startMarker: null,
      endMarker: null,
      poiMarkers: [], // Tableau pour stocker les marqueurs de POI
      routeDistance: "0",
      routeTime: "0",
    };
  },
  computed: {
    ...mapState(["user"]),
  },
  mounted() {
    this.initializeMap();
  },
  methods: {
    initializeMap() {
      this.map = L.map("map", {
        zoomControl: false,
      }).setView([48.0061, 0.1996], 8);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 20,
      }).addTo(this.map);
    },

    zoomToLocation(lat, lng) {
      this.map.setView([lat, lng], 13);
    },

    handleLocationSelected(location) {
      this.zoomToLocation(location.lat, location.lng);

      poiService
        .getPOI(location.lat, location.lng)
        .then((data) => {
          console.log("Points d'intérêt:", data);
          this.poiList = data;
        })
        .catch((error) => {
          console.error("Erreur:", error);
        });

      this.startMarker = this.updateMarker(this.startMarker, location);
    },

    updateMarker(marker, location) {
      if (marker) this.map.removeLayer(marker);
      return createMarker(this.map, location);
    },

    updatePoiMarker(location) {
      const marker = createPoiMarker(this.map, location);
      this.poiMarkers.push(marker); // Ajouter le marqueur au tableau poiMarkers
      return marker;
    },

    showRoute(route) {
      this.removeMarkers();
      if (this.routeControl) {
        this.map.removeControl(this.routeControl);
      }

      this.routeControl = createRouteControl(this.map, route);

      this.routeControl.on("routesfound", (e) => {
        var routes = e.routes;
        var summary = routes[0].summary;
        this.routeDistance = (summary.totalDistance / 1000).toFixed(0);
        this.routeTime = (summary.totalTime / 60).toFixed(2);

        this.$emit("update:distance", this.routeDistance);
        this.$emit("update:time", this.routeTime);
      });

      fitMapToBounds(this.map, route.coordinates[0], route.coordinates[1]);
    },

    removeMarkers() {
      if (this.startMarker) {
        this.map.removeLayer(this.startMarker);
        this.startMarker = null;
      }
      if (this.endMarker) {
        this.map.removeLayer(this.endMarker);
        this.endMarker = null;
      }
      this.poiMarkers.forEach(marker => {
        this.map.removeLayer(marker);
      });
      this.poiMarkers = []; // Réinitialiser le tableau des marqueurs de POI
    },

    stopRoute() {
      this.poiList = null;
      this.removeMarkers();
      if (this.routeControl) {
        this.map.removeControl(this.routeControl);
      }
      this.routeDistance = 0;
      this.routeTime = 0;

      this.$emit("update:distance", this.routeDistance);
      this.$emit("update:time", this.routeTime);
    },

    handlePoiSelected(poi) {
      const location = { lat: poi.lat, lng: poi.lon };
      this.updatePoiMarker(location);
      this.zoomToLocation(location.lat, location.lng);
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

.leaflet-bar {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  margin: 10px;
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
