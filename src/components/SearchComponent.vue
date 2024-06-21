<template>
  <h3>WecanScape</h3>
  <form>
    <!-- Départ -->
    <div class="input-container">
      <div>
        <div class="input-wrapper">
          <i
            class="fas fa-map-marker-alt searchIcon"
            @click="useCurrentLocation('from')"
          ></i>
          <input
            v-model="from"
            placeholder="Départ"
            @focus="showFromList"
          />
        </div>
      </div>

      <!-- Étapes -->
      <div
        v-for="(waypoint, index) in waypoints"
        :key="index"
        :class="{ dragging: dragIndex === index }"
        @mousedown="startDrag($event, index)"
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
            <button class="remove-button" @click="removeWaypoint(index)">
              <i
                :class="{ 'fas fa-times': true, 'gray-cross': !hoverCross }"
              ></i>
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

      <!-- Destination -->
      <div>
        <div class="input-wrapper">
          <i class="fas fa-flag-checkered searchIcon"></i>
          <input
            v-model="to"
            placeholder="Destination"
            @focus="showToList"
          />
        </div>
      </div>

      <!-- Ajouter une Étapes -->
      <button
        v-if="from && to"
        class="add-waypoint"
        type="button"
        @click="addWaypoint"
      >
        <i class="fas fa-plus"></i>
        Ajouter une étape
      </button>
      <!-- Arrêter la recherche -->
      <a v-if="from && to" class="stopSearch" @click="stopRoute()">
        Stopper la recherche
      </a>
    </div>
    <div v-if="showFromOptions">
      <town
        :searchOption="from"
        type="from"
        @option-selected="handleOptionSelected"
      />
    </div>
    <div v-if="showToOptions">
      <town
        :searchOption="to"
        type="to"
        @option-selected="handleOptionSelected"
      />
    </div>
  </form>
</template>

<script>
import axios from "axios";
import town from "./TownList.vue";

export default {
  components: { town },
  data() {
    return {
      from: "",
      fromCity: "",
      fromLatitude: 0,
      fromLongitude: 0,
      to: "",
      toOptions: [],
      waypoints: [],
      route: [],
      dragging: false,
      dragIndex: null,
      dragOverIndex: null,
      dragStartY: 0,
      showFromOptions: false,
      showToOptions: false,
    };
  },
  methods: {
    addWaypoint() {
      this.waypoints.push({ location: "", options: [] });
    },
    removeWaypoint(index) {
      this.waypoints.splice(index, 1);
      this.updateRoute();
    },
    async searchWaypointOptions(index) {
      const waypoint = this.waypoints[index];
      if (waypoint.location.length < 3) {
        waypoint.options = [];
        return;
      }
      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${waypoint.location}`
        );
        this.waypoints[index].options = response.data;
      } catch (error) {
        console.error(
          `Erreur lors de la récupération des suggestions pour l'étape ${
            index + 1
          } :`,
          error
        );
      }
    },
    selectWaypointOption(index, option) {
      this.waypoints[index].location = option.display_name;
      this.waypoints[index].options = [];
      this.updateRoute();
    },
    async handleOptionSelected({ option, type }) {
      if (type === "from") {
        this.from = option.display_name;
        this.fromCity = option.display_name;
        this.fromLatitude = parseFloat(option.lat);
        this.fromLongitude = parseFloat(option.lon);
        this.showFromOptions = false;
      } else if (type === "to") {
        this.to = option.display_name;
        this.showToOptions = false;
      }
      this.updateRoute();
    },
    async updateRoute() {
      try {
        let fromCoords;
        if (this.fromCity) {
          fromCoords = { lat: this.fromLatitude, lng: this.fromLongitude };
        } else {
          const position = await this.getCurrentPosition();
          fromCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
        }

        const toCoords = await this.getCoordinates(this.to);

        this.route = {
          coordinates: [
            [fromCoords.lat, fromCoords.lng],
            [toCoords.lat, toCoords.lng],
          ],
          waypoints: [],
        };

        for (let waypoint of this.waypoints) {
          if (waypoint.location) {
            const waypointCoords = await this.getCoordinates(waypoint.location);
            this.route.waypoints.push([waypointCoords.lat, waypointCoords.lng]);
          }
        }

        console.log("valeur de l'itinéraire", this.route);
        this.$emit("selectRoute", this.route);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération de l'itinéraire :",
          error
        );
      }
    },
    async getCoordinates(location) {
      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${location}`
        );
        if (response.data && response.data.length > 0) {
          const { lat, lon } = response.data[0];
          return { lat: parseFloat(lat), lng: parseFloat(lon) };
        } else {
          throw new Error("Lieu non trouvé");
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des coordonnées :",
          error
        );
        throw error;
      }
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
      const newDragOverIndex = [
        ...dragOverElement.parentElement.children,
      ].indexOf(dragOverElement);

      console.log(
        `Dragging over index: ${newDragOverIndex}, Current drag index: ${this.dragIndex}`
      );

      if (
        newDragOverIndex !== this.dragOverIndex &&
        newDragOverIndex >= 0 &&
        newDragOverIndex < this.waypoints.length
      ) {
        this.dragOverIndex = newDragOverIndex;
        const draggedItem = this.waypoints.splice(this.dragIndex, 1)[0];
        this.waypoints.splice(this.dragOverIndex, 0, draggedItem);
        this.dragIndex = this.dragOverIndex;
      }
    },
    endDrag() {
      this.dragging = false;
      this.dragIndex = null;
      this.dragOverIndex = null;
      document.removeEventListener("mousemove", this.onDrag);
      document.removeEventListener("mouseup", this.endDrag);
      this.updateRoute();
    },
    async useCurrentLocation(field) {
      try {
        const position = await this.getCurrentPosition();
        const locationData = await this.getLocationData(
          position.coords.latitude,
          position.coords.longitude
        );
        this[field + "City"] = locationData.city;
        this[field + "Latitude"] = position.coords.latitude;
        this[field + "Longitude"] = position.coords.longitude;
        this[field] = locationData.city;
        this.updateRoute();
      } catch (error) {
        console.error("Erreur de géolocalisation :", error);
      }
    },
    getCurrentPosition() {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
    },
    async getLocationData(lat, lng) {
      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
        );
        console.log(response.data.address);
        return {
          city: response.data.address.road
            ? `${response.data.address.city}, ${response.data.address.road}`
            : response.data.address.city,

          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
        };
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des données de localisation :",
          error
        );
        throw error;
      }
    },
    stopRoute() {
      this.from = "";
      this.to = "";
      (this.waypoints = []), this.$emit("stopRoute");
    },
    showFromList() {
      this.showFromOptions = true;
    },
    showToList() {
      this.showToOptions = true;
    },
  },
};
</script>

<style>
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css");

.input-container {
  padding: 1vh;
  display: flex;
  flex-direction: column;
}

.input-wrapper {
  display: flex;
  align-items: center;
  position: relative;
  border-radius: 10px;
  background-color: #f0f0f0;
  padding: 1vh;
  margin: 1vh;
  justify-content: flex-start;
}

.searchIcon {
  color: #b4b4b4;
}

.input-waypoint {
  flex: 1;
  padding-right: 2em; /* Adjust this to make room for the button */
}

input {
  border: none;
  padding: 5px;
  font-size: large;
  font-family: "Trebuchet MS", "Lucida Sans Unicode", "Lucida Grande",
    "Lucida Sans", Arial, sans-serif;
  transition: width 0.3s;
  background-color: transparent;
  outline: none;
}

input::placeholder {
  color: #424242;
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
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-evenly;
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

.remove-button {
  position: absolute;
  right: 0.5em; /* Adjust this value as needed */
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-button i {
  pointer-events: none;
}

.remove-button:hover {
  background-color: #f0f0f0;
}

h3 {
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  margin-bottom: 0px;
}
</style>
