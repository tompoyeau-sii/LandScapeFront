<template>
  <div id="app">
    <v-snackbar
     v-model="AlertService.state.snackbar"
     :color="AlertService.state.snackbarColor"
     :timeout="5000"
     top
     right
   >
     <v-icon left>{{ AlertService.state.snackbarIcon }}</v-icon>
     {{ AlertService.state.snackbarText }}
     <template v-slot:action="{ attrs }">
       <v-btn color="white" text v-bind="attrs" @click="AlertService.state.snackbar = false">
         Close
       </v-btn>
     </template>
   </v-snackbar>
    <router-view></router-view>
  </div>
</template>

<script>
import AlertService from "@/services/alertService.js";
export default {
  name: "App",
  setup() {
    return {
      AlertService: AlertService,
    };
  },
};
</script>

<style>
@import "~leaflet/dist/leaflet.css";
@import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Poetsen+One&family=Satisfy&display=swap');
html,
body,
#app {
  height: 100%;
  overflow: auto;
  margin: 0;
  font-family: "Satisfy", cursive;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}
</style>

