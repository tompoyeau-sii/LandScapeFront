<template>
  <form>
    <div class="input-container">
      <!-- Départ -->
      <div>
        <div class="waypoint">
          <div class="input-wrapper">
            <!-- <v-text-field
            placeholder="Départ"
            v-model="from"
            prepend-inner-icon="mdi-map-marker"
            variant="solo-filled"
             @focus="showFromList"
            append-inner-icon="mdi-crosshairs-gps"
          @click:append-inner="useCurrentLocation()"
        ></v-text-field> -->
            <i class="fas fa-map-marker-alt searchIcon"></i>
            <input class="input-waypoint" v-model="from" placeholder="Départ" @focus="showFromList" />
            <button class="remove-button" @click.prevent="useCurrentLocation()">
              <i :class="{ fas: true, 'fa-crosshairs': true }"></i>
            </button>

          </div>
          <div v-if="meteoFrom">
            <p>Météo a la destination</p>
            <p>Température : {{ meteoFrom.temperature }}°C</p>
            <!-- <p>Précipitations : {{ meteoFrom.precipitation }} mm</p> -->
            <p>Temps : {{ meteoFrom.weatherDescription }}</p>
          </div>
        </div>
      </div>

      <!-- Étapes -->
      <div v-for="(waypoint, index) in waypoints" :key="index" :class="{ dragging: dragIndex === index }">
        <div class="waypoint">
          <div class="input-wrapper">
            <i class="far fa-regular fa-circle searchIcon"></i>
            <input class="input-waypoint" v-model="waypoint.location" placeholder="Ajouter une étape"
              @input="searchWaypointOptions(index)" />
            <button class="remove-button" @click.prevent="removeWaypoint(index)">
              <i :class="{ 'fas fa-times': true, 'gray-cross': !hoverCross }"></i>
            </button>
          </div>
        </div>
        <div class="town-list" v-if="waypoint.options.length">
          <p class="list-element" v-for="option in waypoint.options" :key="option.place_id"
            @click="selectWaypointOption(index, option)">
            {{ option.display_name }}
          </p>
        </div>
      </div>


      <v-btn v-if="from && to" @click="addWaypoint" color="blue" variant="tonal" prepend-icon="mdi-plus"
        class="ma-3 text-none">
        Ajouter une étape
      </v-btn>

      <!-- Destination -->
      <div>
        <div class="input-wrapper">
          <i class="fas fa-flag-checkered searchIcon"></i>
          <input v-model="to" placeholder="Destination" @focus="showToList" />
        </div>
      </div>
      <div v-if="meteoTo">
          <p>Météo à l'arrivée</p>
          <p><span class="mdi mdi-thermometer"></span>{{ meteoTo.temperature }}°C </p>
          <!-- <p><span class="mdi mdi-weather-pouring"></span> {{ meteoTo.precipitation }} mm</p> -->
          <p>Temps : {{ meteoTo.weatherDescription }}</p>
        </div>
      <a class="stopSearch" v-if="from && to" @click="stopRoute"> Stopper la recherche </a>
    </div>
    <town v-if="showFromOptions" :searchOption="from" type="from" @option-selected="handleOptionSelected" />
    <town v-if="showToOptions" :searchOption="to" type="to" @option-selected="handleOptionSelected" />
  </form>
</template>


<script>
import mapApiService from "@/services/mapApiService";
import geolocationService from "@/services/geolocationService";
import town from "./TownList.vue";
import openMeteoService from '@/services/openMeteoService';

export default {
  components: { town },
  data() {
    return {
      from: "",
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
      meteoFrom: null,
      meteoTo: null,
    };
  },
  methods: {
    async handleOptionSelected({ option, type }) {
      const latitude = parseFloat(option.lat);
      const longitude = parseFloat(option.lon);
      
      if (type === "from") {
        this.from = option.display_name;
        this.showFromOptions = false;
        await this.getWeather(latitude, longitude, "meteoFrom");
        if (this.to === "") {
          this.$emit("locationSelected", { lat: latitude, lng: longitude });
        }
      } else if (type === "to") {
        this.to = option.display_name;
        this.showToOptions = false;
        await this.getWeather(latitude, longitude, "meteoTo");
        if (this.from === "") {
          this.$emit("locationSelected", { lat: latitude, lng: longitude });
        }
      }
      this.updateRoute();
    },
    async getWeather(lat, lon, meteoType) {
      try {
        const date = new Date().toISOString().split('T')[0];
        const weatherData = await openMeteoService.getWeather(lat, lon, date);
        const now = new Date();
        let closestTimeIndex = 0;
        let closestTimeDiff = Infinity;

        for (let i = 0; i < weatherData.hourly.time.length; i++) {
          const weatherTime = new Date(weatherData.hourly.time[i]);
          const timeDiff = Math.abs(weatherTime - now);

          if (timeDiff < closestTimeDiff) {
            closestTimeDiff = timeDiff;
            closestTimeIndex = i;
          }
        }

        const weatherCode = weatherData.hourly.weathercode[closestTimeIndex];
        const weatherDescription = this.getWeatherDescription(weatherCode);

        this[meteoType] = {
          temperature: weatherData.hourly.temperature_2m[closestTimeIndex],
          precipitation: weatherData.hourly.precipitation[closestTimeIndex],
          weatherDescription: weatherDescription // Ajouter la description du temps
        };

        console.log(meteoType, this[meteoType]);
      } catch (error) {
        console.error('Erreur lors de la récupération des données météo :', error);
      }
    },
    getWeatherDescription(weatherCode) {
      const weatherCodes = {
        0: 'Ciel clair',
        1: 'Principalement clair',
        2: 'Partiellement nuageux',
        3: 'Couvert',
        45: 'Brouillard',
        48: 'Dépôts de brouillard givrant',
        51: 'Bruine légère',
        53: 'Bruine modérée',
        55: 'Bruine dense',
        56: 'Bruine verglaçante légère',
        57: 'Bruine verglaçante dense',
        61: 'Pluie faible',
        63: 'Pluie modérée',
        65: 'Pluie forte',
        66: 'Pluie verglaçante légère',
        67: 'Pluie verglaçante forte',
        71: 'Chute de neige légère',
        73: 'Chute de neige modérée',
        75: 'Chute de neige dense',
        77: 'Grains de neige',
        80: 'Averses de pluie faibles',
        81: 'Averses de pluie modérées',
        82: 'Averses de pluie violentes',
        85: 'Averses de neige faibles',
        86: 'Averses de neige fortes',
        95: 'Orage',
        96: 'Orage avec grêle légère',
        99: 'Orage avec grêle forte',
      };

      return weatherCodes[weatherCode] || 'Code météo inconnu';
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
        this.from = locationData.city;
        this.updateRoute();
        await this.getWeather(lat, lng, "meteoFrom");
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
          `Erreur lors de la récupération des suggestions pour l'étape ${index + 1} :`,
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
      this.meteoFrom = null;  // Réinitialiser la météo de départ
      this.meteoTo = null;    // Réinitialiser la météo d'arrivée
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
  padding-right: 2em;
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

.remove-button {
  position: absolute;
  right: 0.5em;
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
</style>
