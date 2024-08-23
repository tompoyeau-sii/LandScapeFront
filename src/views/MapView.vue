<template>
  <div class="header">
    <overlay
      @stopRoute="stopRoute"
      @selectRoute="showRoute"
      @locationSelected="handleLocationSelected"
      :distance="routeDistance"
      :time="routeTime"
    ></overlay>
    <panel :route="route"></panel>
  </div>
  <PoiList
    v-if="poiList"
    :aelPoiList="aelPoiList"
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
import Overlay from "@/components/search/OverlayComponent.vue";
import PoiList from "@/components/PoiListComponent.vue";

import { mapState } from "vuex";
import {
  createMarker,
  createRouteControl,
  fitMapToBounds,
  createPoiMarker,
} from "@/utils/mapUtils";
import Panel from "@/components/interactions/PanelComponent.vue";
import apiService from "@/services/apiService";

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
      route: null,
      routeControl: null,
      point: null,
      aelPoiList: null,
      poiList: null,
      startMarker: null,
      endMarker: null,
      selectedPoi: null,
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
        zoomControl: true,
      }).setView([48.85889, 2.32003], 8);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 20,
      }).addTo(this.map);
      console.log(this.map);
    },

    zoomToLocation(lat, lng) {
      this.map.setView([lat, lng], 13);
    },

    handleLocationSelected(location) {
      this.point = location;
      this.zoomToLocation(location.lat, location.lng);
      
      const params = new URLSearchParams({
        latitude: location.lat,
        longitude: location.lng,
        // radius: 1.0, // Ajoutez-le si nécessaire
      });

      apiService
        .get(`/poi/within-radius?${params.toString()}`)
        .then((data) => {
          this.aelPoiList = data;
        })
        .catch((error) => {
          console.error("Erreur:", error);
        });

      poiService
        .getPOI(location.lat, location.lng)
        .then((data) => {
          this.poiList = data;
        })
        .catch((error) => {
          console.error("Erreur:", error);
        });

      this.startMarker = this.updateMarker(this.startMarker, location, true);
    },

    updateMarker(marker, location) {
      if (marker) this.map.removeLayer(marker);
      return createMarker(this.map, location);
    },

    updatePoiMarker(marker, location) {
      if (marker) this.map.removeLayer(marker);
      return createPoiMarker(this.map, location);
    },

    showRoute(route) {
      this.removeMarkers();

      if (this.routeControl) {
        this.map.removeControl(this.routeControl);
      }
      this.route = route.coordinates;
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
    },

    stopRoute() {
      this.poiList = null;
      this.removeMarkers();
      if (this.routeControl) {
        this.map.removeControl(this.routeControl);
        this.routeDistance = 0;
        this.routeTime = 0;
        this.route = null;

        this.$emit("update:distance", this.routeDistance);
        this.$emit("update:time", this.formattedRouteTime);
      }
    },

    handlePoiSelected(poi) {
      if (this.selectedPoi && this.selectedPoi.id === poi.id) {
        // Si le POI sélectionné est le même que le précédent, on supprime le marqueur
        this.map.removeLayer(this.endMarker);
        this.endMarker = null;
        this.selectedPoi = null;
      } else {
        // Sinon, on met à jour le marqueur à la nouvelle position
        const location = { lat: poi.lat, lng: poi.lon };
        this.endMarker = this.updatePoiMarker(this.endMarker, location);
        this.zoomToLocation(location.lat, location.lng);
        this.selectedPoi = poi;
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
  max-height: 45%;
}

html {
  overflow: hidden;
}
</style>
