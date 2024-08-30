<template>
  <div class="container">
    <h3 class="mt-3">LandS'Cap</h3>
    <search-component
      @stopRoute="$emit('stopRoute')"
      @selectRoute="$emit('selectRoute', $event)"
      @locationSelected="$emit('locationSelected', $event)"
    ></search-component>
    <div class="route-info pb-5" v-if="distance != 0 && time != 0">
      <strong>{{ distance }} km</strong>
      <strong>{{ formattedTime }}</strong>
    </div>
  </div>
</template>

<script>
import SearchComponent from "./SearchComponent.vue"; // Importation du composant SearchComponent

export default {
  components: { SearchComponent }, // Déclaration du composant SearchComponent pour l'utiliser dans le template

  props: {
    distance: {
      type: String, // La prop 'distance' est de type String
      default: "0", // Valeur par défaut si aucun 'distance' n'est fourni
    },
    time: {
      type: String, // La prop 'time' est de type String
      default: "0", // Valeur par défaut si aucun 'time' n'est fourni
    },
  },

  data() {
    return {
      routeDistance: 0, // Variable pour stocker la distance du trajet, initialisée à 0
      routeTime: 0, // Variable pour stocker le temps du trajet, initialisée à 0
    };
  },

  computed: {
    formattedTime() {
      const timeInMinutes = parseFloat(this.time); // Convertir la prop 'time' en nombre flottant
      if (timeInMinutes >= 60) { // Si le temps est supérieur ou égal à une heure
        const hours = Math.floor(timeInMinutes / 60); // Calculer le nombre d'heures
        const minutes = timeInMinutes % 60; // Calculer le reste en minutes
        return `${hours} h ${minutes.toFixed(0)} minutes`; // Retourner le temps formaté en heures et minutes
      }
      return `${timeInMinutes.toFixed(2)} minutes`; // Retourner le temps formaté en minutes seulement
    },
  },
};
</script>


<style scoped>
h3 {
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
}

/* Style pour afficher les informations de kilométrage et de temps */
.route-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.container {
  position: absolute;
  z-index: 2;
  margin: 1%;
  box-shadow: 0 1px 2px rgba(60, 64, 67, 0.3),
    0 2px 6px 2px rgba(60, 64, 67, 0.15);
  display: flex;
  flex-direction: column;
  border-radius: 15px;
  background: linear-gradient(115deg, #4faaf5 0%, #1f30c9 100%) !important;
  color: white;
  align-items: stretch;
  width: 20%;
}
</style>
