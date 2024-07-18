<template>
  <div id="app">
    <v-snackbar
     v-model="notificationService.state.snackbar"
     :color="notificationService.state.snackbarColor"
     :timeout="5000"
     top
     right
   >
     <v-icon left>{{ notificationService.state.snackbarIcon }}</v-icon>
     {{ notificationService.state.snackbarText }}
     <template v-slot:action="{ attrs }">
       <v-btn color="white" text v-bind="attrs" @click="notificationService.state.snackbar = false">
         Close
       </v-btn>
     </template>
   </v-snackbar>
    <router-view></router-view>
  </div>
</template>

<script>
import NotificationService from "@/services/notificationService.js";
export default {
  name: "App",
  setup() {
    return {
      notificationService: NotificationService,
    };
  },
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

