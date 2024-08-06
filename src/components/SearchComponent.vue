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
              @input="searchWaypointOptions(index)"
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
            {{ option.display_name }}
          </p>
        </div>
      </div>

      <v-btn
        v-if="from && to"
        @click="addWaypoint"
        color="blue"
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
        color="grey"
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
import mapApiService from "@/services/mapApiService";
import geolocationService from "@/services/geolocationService";
import town from "./TownList.vue";

export default {
  components: { town },
  data() {
    return {
      from: "",
      dialogMeteo: false,
      to: "",
      waypoints: [],
      route: [],
      dragging: false,
      dragIndex: null,
      dragOverIndex: null,
      showFromOptions: false,
      showToOptions: false,
    };
  },
  methods: {
    async handleOptionSelected({ option, type }) {
      const latitude = parseFloat(option.lat);
      const longitude = parseFloat(option.lon);

      if (type === "from") {
        this.from = option.display_name;
        this.showFromOptions = false;
        if (this.to === "") {
          this.$emit("locationSelected", { lat: latitude, lng: longitude });
        }
      } else if (type === "to") {
        this.to = option.display_name;
        this.showToOptions = false;
        if (this.from === "") {
          this.$emit("locationSelected", { lat: latitude, lng: longitude });
        }
      }
      this.updateRoute();
    },

    async updateRoute() {
      try {
        let fromCoords;
        if (this.from) {
          fromCoords = await mapApiService.getCoordinates(this.from);
        } else {
          const position = await geolocationService.getCurrentPosition();
          fromCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
        }

        const toCoords = await mapApiService.getCoordinates(this.to);
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
            );
            this.route.waypoints.push([waypointCoords.lat, waypointCoords.lng]);
          }
        }
        console.log(this.route);

        this.$emit("selectRoute", this.route);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération de l'itinéraire :",
          error
        );
      }
    },

    async useCurrentLocation() {
      try {
        const position = await geolocationService.getCurrentPosition();
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        const locationData = await mapApiService.getLocationData(lat, lng);
        const option = {
          lat: lat.toString(),
          lon: lng.toString(),
          display_name: locationData.city,
        };
        this.handleOptionSelected({ option, type: "from" })
        this.from = locationData.city;
        this.updateRoute();
      } catch (error) {
        if (error.code === 1) {
          console.error("Erreur de géolocalisation :", error);
        }
      }
    },

    addWaypoint() {
      this.waypoints.push({ location: "", options: [] });
    },

    async searchWaypointOptions(index) {
      const waypoint = this.waypoints[index];
      if (waypoint.location.length < 3) {
        waypoint.options = [];
        return;
      }
      try {
        const options = await mapApiService.searchLocation(waypoint.location);
        this.waypoints[index] = { ...waypoint, options };
      } catch (error) {
        console.error(
          `Erreur lors de la récupération des suggestions pour l'étape ${
            index + 1
          } :`,
          error
        );
      }
    },

    removeWaypoint(index) {
      this.waypoints.splice(index, 1);
      this.updateRoute();
    },

    selectWaypointOption(index, option) {
      this.waypoints[index] = {
        location: option.display_name,
        options: [],
      };
      this.updateRoute();
    },

    stopRoute() {
      this.from = "";
      this.to = "";
      this.waypoints = [];
      this.$emit("stopRoute");
    },

    showFromList() {
      this.showFromOptions = true;
      this.showToOptions = false;
    },

    showToList() {
      this.showToOptions = true;
      this.showFromOptions = false;
    },

    startDrag(event, index) {
      this.dragging = true;
      this.dragIndex = index;
      this.dragStartY = event.clientY;
      document.addEventListener("mousemove", this.onDrag);
      document.addEventListener("mouseup", this.endDrag);
    },

    onDrag(event) {
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
      if (this.dragging && this.dragOverIndex !== null) {
        const [removed] = this.waypoints.splice(this.dragIndex, 1);
        this.waypoints.splice(this.dragOverIndex, 0, removed);
      }
      this.dragging = false;
      this.dragIndex = null;
      this.dragOverIndex = null;
      document.removeEventListener("mousemove", this.onDrag);
      document.removeEventListener("mouseup", this.endDrag);
      this.updateRoute();
    },
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
  background: linear-gradient(115deg, #4faaf5 0%, #1f30c9 100%) !important;
  color: white;
  padding: 1vh;
  margin: 1vh;
  overflow-x: auto;
  position: relative;
  margin-bottom: 1rem;
}

.input-container .input-wrapper .searchIcon {
  color: white;
}

input::placeholder {
  color: white;
}

.input-container .input-wrapper .input-waypoint {
  flex: 1;
  padding-right: 2em;
  color: white;
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