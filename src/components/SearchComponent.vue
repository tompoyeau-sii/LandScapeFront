<template>
  <form>
    <div class="input-container">
      <div>
        <div class="input-wrapper">
          <i class="fas fa-map-marker-alt"></i>
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
      <a v-if="from && to" class="stopSearch" @click="stopRoute()">Stopper la recherche</a>
    </div>
  </form>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      from: "",
      to: "",
      fromOptions: [],
      toOptions: [],
      fromListVisible: false,
      toListVisible: false,
      route: [],
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
    selectFromOption(option) {
      this.from = option.display_name;
      this.fromOptions = [];
      this.fromListVisible = false;
      this.updateRoute();
    },
    selectToOption(option) {
      this.to = option.display_name;
      this.toOptions = [];
      this.toListVisible = false;
      this.updateRoute();
    },
    async updateRoute() {
      if (this.from && this.to) {
        try {
          const fromCoords = await this.getCoordinates(this.from);
          const toCoords = await this.getCoordinates(this.to);

          this.route.coordinates = [
            [fromCoords.lat, fromCoords.lng],
            [toCoords.lat, toCoords.lng],
          ];

          console.log("valeur de l'itinéraire", this.route);
          this.$emit("selectRoute", this.route);
        } catch (error) {
          console.error(
            "Erreur lors de la récupération de l'itinéraire :",
            error
          );
        }
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
    stopRoute() {
      this.from =  "";
      this.to=  "";
      this.$emit("stopRoute");
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
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
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


</style>
