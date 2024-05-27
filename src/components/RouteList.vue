<template>
  <div class="route-list">
    <div v-for="(route, index) in routes" :key="index" @click="selectRoute(route)">
      {{ route.from }} - {{ route.to }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    routes: {
      type: Array,
      required: true
    }
  },
  methods: {
    selectRoute(route) {
      this.$emit('selectRoute', route);
    }
  }
}
</script>

<style scoped>
.route-list {
  z-index: 10;
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: white;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
.route-list > div {
  cursor: pointer;
  margin-bottom: 5px;
}
</style>
