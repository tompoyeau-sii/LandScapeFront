<template>
  <div class="container">
    <search-component
      @stopRoute="$emit('stopRoute')"
      @selectRoute="$emit('selectRoute', $event)"
      @locationSelected="$emit('locationSelected', $event)"
    ></search-component>
  </div>
</template>

<script>
import SearchComponent from "./SearchComponent.vue";
export default {
  components: { SearchComponent },
};
</script>

<style>
.container {
  box-shadow: 0 1px 2px rgba(60, 64, 67, 0.3),
    0 2px 6px 2px rgba(60, 64, 67, 0.15);
  display: flex;
  flex-direction: column;
  position: absolute;
  margin: 1%;
  border-radius: 15px;
  background-color: white;
  z-index: 2;
  align-items: stretch;
  width: 17%;
}
</style>
