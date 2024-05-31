<template>
  
  <div class="overlay">


    <div class="route-list">
      <div
        class="item"
        v-for="(route, index) in routes"
        :key="index"
        @click="selectRoute(route)"
      >
        {{ route.from }} - {{ route.to }}
      </div>
      <div class="item" @click="stopRoute()">Stopper la recherche</div>
    </div>
  </div>
</template>

<script>

export default {
  props: {
    routes: {
      type: Array,
      required: true,
    },
  },
   data() {
    return {
      routes: [
        {
          from: "Paris",
          to: "Louviers",
          coordinates: [
            [48.8566, 2.3522],
            [49.2146, 1.1483],
          ],
          waypoints: [
            [49.0083, 2.5386], // Ajoutez des étapes intermédiaires ici
          ],
        },
        {
          from: "Le Mans",
          to: "Laval",
          coordinates: [
            [48.0061, 0.1996],
            [48.0781, -0.7669],
          ],
          waypoints: [
            [48.0333, -0.3333], // Ajoutez des étapes intermédiaires ici
          ],
        },
        {
          from: "Nantes",
          to: "Rennes",
          coordinates: [
            [47.2184, -1.5536],
            [48.1173, -1.6778],
          ],
          waypoints: [
            [47.8, -1.5], // Ajoutez des étapes intermédiaires ici
          ],
        },
      ],
    };
  },
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

<style scoped>

.route-list {
     display: flex;
    z-index: 10;
    border-radius: 5px;
    pointer-events: auto;
    overflow-x: auto;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-around;
}

.item {
  font-weight: bold;
  padding: 1vh;
  border-radius: 20px;
  white-space: wrap; /* Empêche les éléments de se casser sur plusieurs lignes */
}

.item:hover {
  color: white;
  background-color: blue;
}

.route-list > div {
  cursor: pointer;
}
</style>
