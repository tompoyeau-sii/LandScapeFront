<template>
  <form>
    <div class="input-container">
        <div class="input-wrapper">
          <i class="fas fa-map-marker-alt"></i>
          <input
          v-model="from"
          placeholder="Départ"
          @input="searchFromOptions"
          />
        </div>
        <div class="town-list" v-if="fromOptions.length">
          <p
            class="list-element"
            v-for="option in fromOptions"
            :key="option.place_id"
            @click="selectFromOption(option)"
          >
            {{ option.display_name }}
          </p>
        </div>
        <div class="input-wrapper">
          <i class="fas fa-map-marker-alt"></i>
          <input
            v-model="to"
            placeholder="Destination"
            @input="searchToOptions"
          />
        </div>
        <div class="town-list" v-if="toOptions.length">
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
      this.updateRoute();
    },
    selectToOption(option) {
      this.to = option.display_name;
      this.toOptions = [];
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
  },
};
</script>

<style>
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css");

.input-container {
  display: flex;
  flex-direction: column;
}

.input-wrapper {
  display: flex;
  align-items: center;  
  justify-content: center;
}

.town-list {
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #ccc;
  border-top: none;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.list-element {
  padding: 10px;
  cursor: pointer;
}

.list-element:hover {
  background-color: #f0f0f0;
  text-decoration: underline;
}

input { 
  border: 1px solid rgb(209, 208, 208);
  border-radius: 20px;
  padding: 5px;
  margin: 5px;
  font-size: large;
  transition: width 0.3s;
  outline: none;
}
</style>
