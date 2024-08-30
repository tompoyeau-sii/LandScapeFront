<template>
  <form>
    <!-- Départ -->
    <div class="input-container">
      <div class="waypoint">
        <div class="input-wrapper">
          <i class="fas fa-map-marker-alt searchIcon"></i>
          <input
            class="input-waypoint"
            v-model="from"
            placeholder="Départ"
            @focus="showFromList"
          />
          <button class="remove-button" @click.prevent="useCurrentLocation()">
            <i class="fas fa-crosshairs"></i>
          </button>
        </div>
      </div>

      <!-- Étapes -->
      <div
        v-for="(waypoint, index) in waypoints"
        :key="index"
        @mousedown="startDrag($event, index)"
        :class="{ dragging: dragIndex === index }"
        class="waypoint-wrapper"
      >
        <div class="waypoint">
          <div class="input-wrapper">
            <i class="far fa-regular fa-circle searchIcon"></i>
            <input
              class="input-waypoint"
              v-model="waypoint.location"
              placeholder="Ajouter une étape"
              @input="debouncedSearchWaypointOptions(index)"
            />

            <button
              class="remove-button"
              @click.prevent="removeWaypoint(index)"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        <div class="town-list" v-if="waypoint.options.length">
          <p
            class="list-element"
            v-for="option in waypoint.options"
            :key="option.place_id"
            @click="selectWaypointOption(index, option)"
          >
            {{ option.label }}
          </p>
        </div>
      </div>

      <v-btn
        v-if="from && to"
        @click="addWaypoint"
        color="white"
        variant="tonal"
        prepend-icon="mdi-plus"
        class="ma-3 text-none"
      >
        Ajouter une étape
      </v-btn>

      <!-- Destination -->
      <div>
        <div class="input-wrapper">
          <i class="fas fa-flag-checkered searchIcon"></i>
          <input
            class="input-waypoint"
            v-model="to"
            placeholder="Destination"
            @focus="showToList"
          />
        </div>
      </div>

      <v-btn
        v-if="from || to"
        color="white"
        variant="tonal"
        prepend-icon="mdi-close"
        class="ma-3 text-none"
        @click="stopRoute"
      >
        Stopper la recherche
      </v-btn>
    </div>
    <town
      v-if="showFromOptions"
      :searchOption="from"
      type="from"
      @option-selected="handleOptionSelected"
    />
    <town
      v-if="showToOptions"
      :searchOption="to"
      type="to"
      @option-selected="handleOptionSelected"
    />
  </form>
</template>


<script>
import mapApiService from "@/services/mapApiService"; // Service pour interagir avec l'API de carte
import geolocationService from "@/services/geolocationService"; // Service pour obtenir la géolocalisation de l'utilisateur
import town from "./TownList.vue"; // Composant pour afficher la liste des villes
import { debounce } from "lodash"; // Fonction de debounce pour limiter la fréquence des appels API lors de la saisie

export default {
  components: { town }, // Déclaration des composants enfants utilisés dans le template
  data() {
    return {
      from: "", // Valeur du champ de départ
      dialogMeteo: false, // État pour contrôler la visibilité du dialogue météo (non utilisé ici)
      to: "", // Valeur du champ de destination
      waypoints: [], // Liste des étapes (waypoints) pour le parcours
      route: [], // Détails de l'itinéraire calculé
      dragging: false, // État pour savoir si un élément est en train d'être déplacé
      dragIndex: null, // Index de l'étape en cours de déplacement
      dragOverIndex: null, // Index de l'étape au-dessus de laquelle l'élément est déplacé
      showFromOptions: false, // État pour afficher les options de recherche pour le champ de départ
      showToOptions: false, // État pour afficher les options de recherche pour le champ de destination
    };
  },
  methods: {
    async handleOptionSelected({ option, type }) {
      // Gère la sélection d'une option de recherche
      const latitude = parseFloat(option.coordinates[1]);
      const longitude = parseFloat(option.coordinates[0]);

      if (type === "from") {
        this.from = option.label;
        this.showFromOptions = false;
        if (this.to === "") {
          this.$emit("locationSelected", { lat: latitude, lng: longitude });
        }
      } else if (type === "to") {
        this.to = option.label;
        this.showToOptions = false;
        if (this.from === "") {
          this.$emit("locationSelected", { lat: latitude, lng: longitude });
        }
      }
      this.updateRoute(); // Met à jour l'itinéraire après la sélection d'une option
    },

    async updateRoute() {
      // Met à jour l'itinéraire en fonction des valeurs des champs de départ, d'étape et de destination
      try {
        let fromCoords;
        if (this.from) {
          fromCoords = await mapApiService.getCoordinates(this.from); // Obtient les coordonnées du champ de départ
        } else {
          const position = await geolocationService.getCurrentPosition(); // Obtient la position actuelle si le champ de départ est vide
          fromCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
        }

        const toCoords = await mapApiService.getCoordinates(this.to); // Obtient les coordonnées du champ de destination
        this.route = {
          coordinates: [
            [fromCoords.lat, fromCoords.lng],
            [toCoords.lat, toCoords.lng],
          ],
          waypoints: [],
        };
        for (let waypoint of this.waypoints) {
          if (waypoint.location) {
            const waypointCoords = await mapApiService.getCoordinates(
              waypoint.location
            ); // Obtient les coordonnées pour chaque étape
            this.route.waypoints.push([waypointCoords.lat, waypointCoords.lng]);
          }
        }
        console.log(this.route); // Affiche les détails de l'itinéraire dans la console

        this.$emit("selectRoute", this.route); // Émet un événement avec les détails de l'itinéraire sélectionné
      } catch (error) {
        console.error(
          "Erreur lors de la récupération de l'itinéraire :",
          error
        ); // Gestion des erreurs lors de la récupération des coordonnées
      }
    },

    async useCurrentLocation() {
      // Utilise la position actuelle comme point de départ
      try {
        const position = await geolocationService.getCurrentPosition(); // Obtient la position actuelle
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        const locationData = await mapApiService.getLocationData(lat, lng); // Obtient les données de localisation pour les coordonnées actuelles
        const option = {
          coordinates: [lng.toString(), lat.toString()],
          label: locationData.city,
        };
        this.handleOptionSelected({ option, type: "from" }); // Sélectionne l'option comme point de départ
        this.from = locationData.city;
        this.updateRoute(); // Met à jour l'itinéraire
      } catch (error) {
        if (error.code === 1) {
          console.error("Erreur de géolocalisation :", error); // Gestion des erreurs liées à la géolocalisation
        }
      }
    },

    addWaypoint() {
      // Ajoute une nouvelle étape au parcours
      this.waypoints.push({ location: "", options: [] });
    },

    async searchWaypointOptions(index) {
      // Recherche des options pour une étape spécifique
      const waypoint = this.waypoints[index];
      if (waypoint.location.length < 3) {
        waypoint.options = []; // Vide les options si la saisie est trop courte
        return;
      }
      try {
        const options = await mapApiService.searchLocation(waypoint.location); // Obtient les suggestions de localisation
        this.waypoints[index] = { ...waypoint, options };
      } catch (error) {
        console.error(
          `Erreur lors de la récupération des suggestions pour l'étape ${
            index + 1
          } :`,
          error
        ); // Gestion des erreurs lors de la recherche des options
      }
    },

    removeWaypoint(index) {
      // Supprime une étape spécifique
      this.waypoints.splice(index, 1);
      this.updateRoute(); // Met à jour l'itinéraire après la suppression
    },

    selectWaypointOption(index, option) {
      // Sélectionne une option pour une étape spécifique
      this.waypoints[index] = {
        location: option.label,
        options: [],
      };
      this.updateRoute(); // Met à jour l'itinéraire après la sélection de l'option
    },

    stopRoute() {
      // Réinitialise le formulaire et émet un événement pour arrêter la recherche
      this.from = "";
      this.to = "";
      this.waypoints = [];
      this.$emit("stopRoute");
    },

    showFromList() {
      // Affiche les options pour le champ de départ
      this.showFromOptions = true;
      this.showToOptions = false;
    },

    showToList() {
      // Affiche les options pour le champ de destination
      this.showToOptions = true;
      this.showFromOptions = false;
    },

    startDrag(event, index) {
      // Déclenche le début du drag pour une étape spécifique
      this.dragging = true;
      this.dragIndex = index;
      this.dragStartY = event.clientY;
      document.addEventListener("mousemove", this.onDrag); // Écouteur pour le déplacement de la souris
      document.addEventListener("mouseup", this.endDrag); // Écouteur pour la fin du drag
    },

    onDrag(event) {
      // Gère le déplacement de l'étape pendant le drag
      if (!this.dragging) return;

      const dragOverElement = document.elementFromPoint(
        event.clientX,
        event.clientY
      );
      if (dragOverElement && dragOverElement.matches(".waypoint")) {
        const newIndex = Array.from(
          dragOverElement.parentElement.children
        ).indexOf(dragOverElement);
        if (newIndex !== this.dragOverIndex) {
          this.dragOverIndex = newIndex;
        }
      }
    },

    endDrag() {
      // Termine le drag et réorganise les étapes
      if (this.dragging && this.dragOverIndex !== null) {
        const [removed] = this.waypoints.splice(this.dragIndex, 1);
        this.waypoints.splice(this.dragOverIndex, 0, removed);
      }
      this.dragging = false;
      this.dragIndex = null;
      this.dragOverIndex = null;
      document.removeEventListener("mousemove", this.onDrag);
      document.removeEventListener("mouseup", this.endDrag);
      this.updateRoute(); // Met à jour l'itinéraire après le drag
    },
  },
  created() {
    this.debouncedSearchWaypointOptions = debounce(
      this.searchWaypointOptions,
      500
    ); // Crée une version debouncée de la fonction de recherche des options d'étape
  },
};

</script>

<style scoped>
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css");

.input-container {
  padding: 1vh;
  display: flex;
  flex-direction: column;
}

.input-container .input-wrapper {
  display: flex;
  align-items: center;
  border-radius: 10px;
  background-color: white !important;
  color: black;
  padding: 1vh;
  margin: 1vh;
  overflow-x: auto;
  position: relative;
  margin-bottom: 1rem;
}

.input-container .input-wrapper .searchIcon {
  color: black;
}

input::placeholder {
  color: black;
}

.input-container .input-wrapper .input-waypoint {
  flex: 1;
  padding-right: 2em;
  color: black;
  border: none;
  padding: 5px;
  font-size: large;
  transition: width 0.3s;
  background-color: transparent;
  outline: none;
}

.input-container .input-wrapper::placeholder {
  color: white;
}

.input-container .input-wrapper .remove-button {
  right: 0.5em;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.input-container .input-wrapper .remove-button i {
  pointer-events: none;
}

.stopSearch {
  display: flex;
  justify-content: center;
  padding: 1vh;
  cursor: pointer;
}

.stopSearch:hover {
  text-decoration: underline;
}

.waypoint {
  display: flex;
  justify-content: space-evenly;
  flex-direction: column;
}

.dragging {
  background-color: #f0f0f0;
  border-radius: 15px;
}

.add-waypoint {
  background-color: white;
  border: 1px solid gray;
  padding: 1vh;
  margin: 1vh;
  border-radius: 10px;
}

.add-waypoint:hover {
  color: white;
  background-color: black;
}

.input-waypoint {
  padding-left: 40px;
}
</style>