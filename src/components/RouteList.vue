<template>
  <div class="overlay">
    <div class="route-list">
      <div class="item" v-for="(route, index) in routes" :key="index" @click="selectRoute(route)">
        {{ route.from }} - {{ route.to }}
      </div>
      <div class="item" @click="stopRoute()">
        Stopper la recherche
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
    },
    stopRoute() {
      this.$emit('stopRoute');
    }
  }
}
</script>

<style scoped>
.overlay {
  position: fixed;
  z-index: 2;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start; /* Alignement en haut de l'écran */
  pointer-events: none; /* Permettre les clics à travers l'overlay */
}

.route-list {
  display: flex; /* Disposer les éléments en ligne */
  z-index: 10;
  padding: 10px;
  border-radius: 5px;
  margin-top: 20px; /* Espace au-dessus de la liste pour qu'elle soit légèrement en dessous du haut de l'écran */
  pointer-events: auto; /* Activer les clics sur la liste */
  overflow-x: auto; /* Ajoute une barre de défilement horizontale si nécessaire */
  max-width: 90%; /* Limite la largeur de la liste */
}

.item {
  background-color: rgb(255, 255, 255);
  font-weight: bold;
  padding: 1vh;
  border-radius: 20px;
  margin-right: 10px; /* Espace entre les items */
  white-space: nowrap; /* Empêche les éléments de se casser sur plusieurs lignes */
  color: rgb(78, 78, 78);
}

.item:hover {
  color: white;
  background-color: blue;
}

.route-list > div {
  cursor: pointer;
}
</style>
