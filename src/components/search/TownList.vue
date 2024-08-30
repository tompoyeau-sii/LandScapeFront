<template>
  <div class="town-list">
    <p
      class="list-element"
      v-for="option in options"
      :key="option.place_id"
      @click="selectOption(option)"
    >
      <i class="fas fa-map-marker-alt"></i>
      {{ option.label }}
    </p>
  </div>
</template>

<script>
import mapApiService from '@/services/mapApiService'; // Service pour interagir avec l'API de carte
import { debounce } from 'lodash'; // Fonction de debounce pour limiter la fréquence des appels API lors de la saisie

export default {
  props: {
    searchOption: String, // Valeur actuelle du champ de recherche
    type: String, // Type de recherche : "from" ou "to"
  },
  data() {
    return {
      options: [], // Liste des options de recherche récupérées
      debouncedSearch: null, // Fonction debouncée pour limiter les appels à l'API
    };
  },
  watch: {
    // Observe les changements dans la valeur de `searchOption` pour déclencher une recherche
    searchOption(newVal) {
      this.debouncedSearch(newVal); // Appelle la fonction debouncée avec la nouvelle valeur
    },
  },
  created() {
    // Crée une version debouncée de la fonction `searchLocation`
    this.debouncedSearch = debounce(this.searchLocation, 500);
  },
  methods: {
    async searchLocation(newVal) {
      // Effectue une recherche des options basées sur la valeur donnée
      if (newVal.length < 3) {
        this.options = []; // Vide les options si la saisie est trop courte
        return;
      }
      try {
        const response = await mapApiService.searchLocation(newVal); // Appelle le service pour obtenir les options
        this.options = response; // Met à jour les options avec la réponse de l'API
        console.log(response); // Affiche les options dans la console pour débogage
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des suggestions :",
          error
        ); // Gestion des erreurs lors de la récupération des options
      }
    },
    selectOption(option) {
      // Émet un événement lorsque l'utilisateur sélectionne une option
      this.$emit('option-selected', { option, type: this.type });
    },
  },
};

</script>

<style>
.town-list {
  border-top: none;
  max-height: 50vh;
  overflow-y: auto;
  padding: 1vh;
  margin: 1vh;
  padding-top: 0px;
  margin-top: 0px;
  padding-bottom: 0px;
  margin-bottom: 0px;
  z-index: 10;
  position: relative;
}

.list-element {
  padding: 10px;
  cursor: pointer;
  border: none;
  font-weight: bold;
  font-size: small;
  border-radius: 10px;
}

.list-element:hover {
  background-color: #ffffff4b;
  text-decoration: underline;
}
</style>
