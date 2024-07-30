<template>
  <div class="container pb-3 pl-3 pr-3">
    <h3 class="mt-3">Activités</h3>
    <ul>
      <li class="poi pa-2 rounded-lg" v-for="poi in filteredPoiList" :key="poi.id" @click="selectPoi(poi)">
        <span class="poi-name">{{ poi.tags.name }}</span>
        <span class="poi-rating">
          {{ getRandomRating(poi.id) }}
          <v-icon class="rating-icon" icon="mdi-star"></v-icon>
        </span>
      </li>
    </ul>
  </div>
</template>

<script>
import { reactive } from 'vue'

export default {
  props: {
    poiList: {
      type: Array,
      required: true,
    },
  },
  setup() {
    const ratings = reactive({});

    function getRandomRating(id) {
      if (!ratings[id]) {
        ratings[id] = (Math.random() * 5).toFixed(1); // Générer une note aléatoire entre 0 et 5
      }
      return parseFloat(ratings[id]);
    }

    return {
      ratings,
      getRandomRating,
    };
  },
  computed: {
    filteredPoiList() {
      const uniqueNames = new Set();
      return this.poiList.filter(poi => {
        if (poi.tags && poi.tags.name && !uniqueNames.has(poi.tags.name)) {
          uniqueNames.add(poi.tags.name);
          return true;
        }
        return false;
      });
    }
  },
  methods: {
    selectPoi(poi) {
      this.$emit('poi-selected', poi);
    }
  }
};
</script>

<style scoped>
h3 {
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
}

.route-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.poi {
  cursor: pointer;
  display: flex;
  justify-content: space-between; /* Ajoute de l'espace entre les éléments */
  align-items: center;
}

.poi-name {
  flex-grow: 1; /* Laisser le nom du POI prendre tout l'espace disponible */
}

.poi-rating {
  display: flex;
  align-items: center;
}

.rating-icon {
  margin-left: 0.25rem; /* Ajoute un peu d'espace entre la note et l'icône */
}

.poi:hover {
  background-color: whitesmoke;
}

.container {
  position: absolute;
  bottom: 0;
  right: 0;
  z-index: 2;
  margin: 1%;
  box-shadow: 0 1px 2px rgba(60, 64, 67, 0.3),
    0 2px 6px 2px rgba(60, 64, 67, 0.15);
  display: flex;
  flex-direction: column;
  border-radius: 15px;
  background-color: white;
  align-items: stretch;
  width: 17%;
  max-height: 90vh; /* Limite la hauteur maximale à 90% de la hauteur de la fenêtre */
  overflow-y: auto; /* Ajoute une barre de défilement verticale si nécessaire */
}
</style>
