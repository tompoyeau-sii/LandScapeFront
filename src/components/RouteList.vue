<template>
  <div style="display: flex;">
    <div class="route-list">
      <h1>Parcours</h1>
  
      <div class="item" v-for="(route, index) in routes" :key="index" @click="selectRoute(route)">
        {{ route.from }} - {{ route.to }}
      </div>
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
.item {
  border: 1px solid white;
  padding: 1vh;
  border-radius: 5px;
}

.item:hover {
  background-color: rgb(117, 117, 117);
}

.route-list {
  color: white;
  z-index: 10;
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgb(68, 68, 68);
  padding: 10px;
  height: 75vh;
  max-width: 30vh;
  min-width: 25vh;
  border-radius: 5px;
}

.route-list > div {
  cursor: pointer;
  margin-bottom: 5px;
}
</style>
