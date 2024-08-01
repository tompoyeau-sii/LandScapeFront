<template>
  <div class="container pb-3 pl-3 pr-3">
    <h3 class="mt-3">Activités</h3>
    <v-expansion-panels>
      <v-expansion-panel
        v-for="poi in filteredPoiList"
        :key="poi.id"
        @click="selectPoi(poi)"
      >
        <v-expansion-panel-title>
          <div class="title-container">
            <div class="name-tag">
              <span>{{ poi.tags.name }}</span>
              <span class="tag">{{ poi.tags.tourism }}</span>
            </div>
            <span class="poi-rating">
              {{ getRandomRating(poi.id) }}
              <v-icon class="rating-icon" icon="mdi-star"></v-icon>
            </span>
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <a>Définir comme destination</a>
          <br />
          <a>Ajouter cette étape</a>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script>
import { reactive } from "vue";

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
      return this.poiList.filter((poi) => {
        if (poi.tags && poi.tags.name && !uniqueNames.has(poi.tags.name)) {
          uniqueNames.add(poi.tags.name);
          return true;
        }
        return false;
      });
    },
  },
  methods: {
    selectPoi(poi) {
      this.$emit("poi-selected", poi);
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

.route-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.poi {
  box-shadow: none !important;
}

.title-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.name-tag {
  display: flex;
  flex-direction: column;
}

.poi-rating {
  display: flex;
  align-items: center;
}

.rating-icon {
  margin-left: 0.25rem;
  color: orange;
}

.poi:hover {
  background-color: whitesmoke;
}

.tag {
  font-size: small;
  font-style: italic;
  padding-top: 1vh;
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
