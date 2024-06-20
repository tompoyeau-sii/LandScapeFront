<template>
  <form>
    <!-- Départ -->
    <div class="input-container">
      <div>
        <div class="input-wrapper">
          <i
            class="fas fa-map-marker-alt"
            @click="useCurrentLocation('from')"
          ></i>
          <input
            v-model="from"
            placeholder="Départ"
            @input="searchFromOptions"
            @focus="showFromList"
            @blur="hideFromList"
          />
        </div>
        <div class="town-list" v-if="fromOptions.length && fromListVisible">
          <p
            class="list-element"
            v-for="option in fromOptions"
            :key="option.place_id"
            @click="selectFromOption(option)"
          >
            {{ option.display_name }}
          </p>
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
            <i class="far fa-regular fa-circle"></i>
            <input
              class="input-waypoint"
              v-model="waypoint.location"
              placeholder="Ajouter une étape"
              @input="searchWaypointOptions(index)"
            />
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
          <button class="remove-button" @click="removeWaypoint(index)">
            <i :class="{ 'fas fa-times': true, 'gray-cross': !hoverCross }"></i>
          </button>
        </div>
      </div>
      <!-- Destination -->
      <div>
        <div class="input-wrapper">
          <i class="fas fa-flag-checkered"></i>
          <input
            v-model="to"
            placeholder="Destination"
            @input="searchToOptions"
            @focus="showToList"
            @blur="hideToList"
          />
        </div>
        <div class="town-list" v-if="toOptions.length && toListVisible">
          <p
            class="list-element"
            v-for="option in toOptions"
            :key="option.place_id"
            @click="selectToOption(option)"
          >
            {{ option.display_name }}
          </p>
        </div>
      </div>
      <button class="add-waypoint" type="button" @click="addWaypoint">
        <i class="fas fa-plus"></i>
        Ajouter une étape
      </button>
      <a v-if="from && to" class="stopSearch" @click="stopRoute()">
        Stopper la recherche
      </a>
    </div>
  </form>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      from: "",
      fromCity: "",
      fromLatitude: 0,
      fromLongitude: 0,
      to: "",
      fromOptions: [],
      toOptions: [],
      waypoints: [],
      route: [],
      dragging: false,
      dragIndex: null,
      dragOverIndex: null,
      dragStartY: 0,
    };
  },
  methods: {
    async searchFromOptions() {
      if (this.from.length < 3) {
        this.fromOptions = [];
        return;
      }
      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${this.from}`
        );
        this.fromOptions = response.data;
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des suggestions pour le départ :",
          error
        );
      }
    },
    async searchToOptions() {
      if (this.to.length < 3) {
        this.toOptions = [];
        return;
      }
      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${this.to}`
        );
        this.toOptions = response.data;
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des suggestions pour l'arrivée :",
          error
        );
      }
    },
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
    selectFromOption(option) {
      this.from = option.display_name;
      this.fromOptions = [];
      this.fromCity = option.display_name; // Ajout de cette ligne
      this.fromLatitude = parseFloat(option.lat); // Ajout de cette ligne
      this.fromLongitude = parseFloat(option.lon); // Ajout de cette ligne
      this.updateRoute();
    },
    selectWaypointOption(index, option) {
      this.waypoints[index].location = option.display_name;
      this.waypoints[index].options = [];
      this.updateRoute();
    },
    selectToOption(option) {
      this.to = option.display_name;
      this.toOptions = [];
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
      this.fromListVisible = true;
    },
    hideFromList() {
      setTimeout(() => {
        this.fromListVisible = false;
      }, 200);
    },
    showToList() {
      this.toListVisible = true;
    },
    hideToList() {
      setTimeout(() => {
        this.toListVisible = false;
      }, 200);
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
  border-radius: 10px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  padding: 1vh;
  margin: 1vh;
  justify-content: center;
}

input {
  border: none;
  padding: 5px;
  font-size: large;
  font-family: "Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS", sans-serif;
  transition: width 0.3s;
}

input {
  outline: none;
}

.town-list {
  border-radius: 5px;
  background-color: white;
  border: 1px solid #ccc;
  border-top: none;
  max-height: 50vh;
  overflow-y: auto;
  padding: 1vh;
  margin: 1vh;
  z-index: 1000;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  position: absolute;
}

.list-element {
  padding: 10px;
  cursor: pointer;
  border: none;
  font-weight: bold;
  font-size: small;
}

.list-element:hover {
  background-color: #f0f0f0;
  text-decoration: underline;
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
}

.dragging {
  background-color: #f0f0f0;
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
  padding: 1vh;
  border-radius: 10px;
  margin: 1vh;
  background: none;
  border: none;
}

.remove-button:hover {
  background-color: #f0f0f0;
}
</style>
