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
      box-shadow: 0 1px 2px rgba(60, 64, 67, 0.3), 0 2px 6px 2px rgba(60, 64, 67, 0.15);
  display: flex;
  width: 30vh;
  flex-direction: column;
  position: absolute;
  height: 100vh;
  background-color: white;
  z-index: 2;
  align-items: stretch;
}
</style>