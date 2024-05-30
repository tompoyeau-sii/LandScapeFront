<template>
  <div class="container">
    <search-component @selectRoute="selectRoute"></search-component>
    <route-list @stopRoute="stopRoute" @selectRoute="selectRoute"></route-list>
  </div>
</template>

<script>
import RouteList from "./RouteList.vue";
import SearchComponent from "./SearchComponent.vue";
export default {
  components: { RouteList, SearchComponent },
  methods: {
    selectRoute(route) {
      this.$emit("selectRoute", route);
    },
    stopRoute() {
      this.$emit("stopRoute");
    },
  },
};
</script>

<style>
.container {
  display: flex;
  width: 40vh;
  flex-direction: column;
  position: absolute;
  height: 100vh;
  background-color: white;
  z-index: 2;
  align-items: stretch;
}
</style>