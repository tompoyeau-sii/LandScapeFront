<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>

export default {
  name: "App",
};
</script>

<style>
@import "~leaflet/dist/leaflet.css";

html,
body,
#app {
  height: 100%;
  overflow: auto;
  margin: 0;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

</style>

