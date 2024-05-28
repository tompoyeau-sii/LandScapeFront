<template>
  <div id="app">
    <MapView />
    <SearchView />
  </div>
</template>

<script>
import MapView from "./components/MapView.vue";
import SearchView from "./components/SearchView.vue";
export default {
  name: "App",
  components: {
    MapView,
    SearchView,
  },
};
</script>

<style>
@import "~leaflet/dist/leaflet.css";

html,
body,
#app {
  height: 100%;
  margin: 0;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}
</style>

