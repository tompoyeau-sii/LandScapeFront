<template>
  <div v-if="route">
    <v-btn class="meteo-btn" @click="dialogMeteo = true">
      Météo <span class="mdi mdi-weather-partly-rainy"></span>
    </v-btn>
    <v-dialog v-model="dialogMeteo" max-width="600px">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <div class="text-h5">Météo</div>
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="dialogMeteo = false"
          ></v-btn>
        </v-card-title>
        <v-card-text>
          <fieldset class="rounded-lg pa-2 mb-1">
            <legend class="pr-2 pl-2 ml-3">Départ</legend>
            <div class="forecast-container pa-1">
              <div
                class="forecast-column rounded-lg ma-1"
                v-for="(forecast, index) in next5HoursForecastFrom"
                :key="index"
                :style="{
                  background: getWeatherGradient(forecast.weatherDescription),
                  color: getWeatherTextColor(forecast.weatherDescription),
                }"
              >
                <div class="forecast-time">{{ forecast.time }}</div>
                <div class="forecast-icon">
                  <span
                    :class="
                      'mdi ' + getWeatherIcon(forecast.weatherDescription).icon
                    "
                  ></span>
                </div>
                <div class="forecast-temperature">
                  {{ forecast.temperature }}°C
                </div>
                <div class="forecast-icon">
                  <v-icon icon="mdi-water"></v-icon>
                </div>
                <div class="forecast-precipitation">
                  {{ forecast.precipitation }}mm
                </div>
              </div>
            </div>
          </fieldset>

          <fieldset class="rounded-lg pa-2">
            <legend class="pr-2 pl-2 ml-3">Arrivée</legend>
            <div class="forecast-container pa-1">
              <div
                class="forecast-column rounded-lg ma-1"
                v-for="(forecast, index) in next5HoursForecast"
                :key="index"
                :style="{
                  background: getWeatherGradient(forecast.weatherDescription),
                  color: getWeatherTextColor(forecast.weatherDescription),
                }"
              >
                <div class="forecast-time">{{ forecast.time }}</div>
                <div class="forecast-icon">
                  <span
                    :class="
                      'mdi ' + getWeatherIcon(forecast.weatherDescription).icon
                    "
                  ></span>
                </div>
                <div class="forecast-temperature">
                  {{ forecast.temperature }}°C
                </div>
                <div class="forecast-icon">
                  <v-icon icon="mdi-water"></v-icon>
                </div>
                <div class="forecast-precipitation">
                  {{ forecast.precipitation }}mm
                </div>
              </div>
            </div>
          </fieldset>
        </v-card-text>
        <!-- <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="dialogMeteo = false">Fermer</v-btn>
        </v-card-actions> -->
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import openMeteoService from "@/services/openMeteoService"; // Importation du service pour obtenir les données météo

// Définition des classes d'icônes et de styles pour différentes conditions météorologiques
const iconClasses = {
  Ensoleillé: {
    icon: "mdi-white-balance-sunny", // Icône pour les jours ensoleillés
    gradient: "linear-gradient(56deg, rgba(255,245,91,1) 0%, rgba(255,199,95,1) 100%)", // Dégradé de fond pour les jours ensoleillés
    textColor: "#000000", // Couleur du texte pour les jours ensoleillés
  },
  Nuageux: {
    icon: "mdi-cloud-outline", // Icône pour les jours nuageux
    gradient: "linear-gradient(56deg, rgba(176,196,222,1) 0%, rgba(214,210,210,1) 100%)", // Dégradé de fond pour les jours nuageux
    textColor: "#000000", // Couleur du texte pour les jours nuageux
  },
  Brouillard: {
    icon: "mdi-weather-fog", // Icône pour les jours brouillés
    gradient: "linear-gradient(to right, #A9A9A9, #696969)", // Dégradé de fond pour les jours brouillés
    textColor: "#FFFFFF", // Couleur du texte pour les jours brouillés
  },
  Bruine: {
    icon: "mdi-weather-rainy", // Icône pour les jours avec bruine
    gradient: "linear-gradient(to right, #87CEEB, #4682B4)", // Dégradé de fond pour les jours avec bruine
    textColor: "#000000", // Couleur du texte pour les jours avec bruine
  },
  Pluie: {
    icon: "mdi-weather-pouring", // Icône pour les jours de pluie
    gradient: "linear-gradient(56deg, rgba(30,144,255,1) 0%, rgba(115,191,255,1) 100%)", // Dégradé de fond pour les jours de pluie
    textColor: "#FFFFFF", // Couleur du texte pour les jours de pluie
  },
  Verglas: {
    icon: "mdi-weather-snowy-rainy", // Icône pour les jours de verglas
    gradient: "linear-gradient(to right, #B0E0E6, #ADD8E6)", // Dégradé de fond pour les jours de verglas
    textColor: "#000000", // Couleur du texte pour les jours de verglas
  },
  Neige: {
    icon: "mdi-weather-snowy", // Icône pour les jours de neige
    gradient: "linear-gradient(to right, #FFFFFF, #E0FFFF)", // Dégradé de fond pour les jours de neige
    textColor: "#000000", // Couleur du texte pour les jours de neige
  },
  Orage: {
    icon: "mdi-weather-lightning", // Icône pour les jours d'orage
    gradient: "linear-gradient(to right, #FFA500, #FF4500)", // Dégradé de fond pour les jours d'orage
    textColor: "#000000", // Couleur du texte pour les jours d'orage
  },
  "Code météo inconnu": {
    icon: "mdi-help-circle-outline", // Icône pour les conditions météorologiques inconnues
    gradient: "linear-gradient(to right, #808080, #A9A9A9)", // Dégradé de fond pour les conditions météorologiques inconnues
    textColor: "#FFFFFF", // Couleur du texte pour les conditions météorologiques inconnues
  },
};

export default {
  props: {
    route: {
      type: Array, // La prop 'route' est un tableau requis
      required: true,
    },
  },
  data() {
    return {
      dialogMeteo: false, // Contrôle l'affichage du dialogue météo
      meteoFrom: null, // Données météo pour le départ
      meteoTo: null, // Données météo pour l'arrivée
      next5HoursForecast: [], // Prévisions pour les 5 prochaines heures
      next5HoursForecastFrom: [], // Prévisions pour les 5 prochaines heures au départ
    };
  },
  watch: {
    // Observateur pour la prop 'route' qui déclenche une fonction quand la route change
    route: {
      handler(newRoute) {
        console.log(newRoute); // Affiche la nouvelle route dans la console pour le débogage
        if (newRoute && newRoute.length === 2) {
          const [start, end] = newRoute;
          // Appelle la méthode pour obtenir les données météo pour le départ et l'arrivée
          this.getWeather(start[0], start[1], "meteoFrom");
          this.getWeather(end[0], end[1], "meteoTo");
        }
      },
      deep: true, // Observateur en profondeur pour surveiller les changements dans les objets et les tableaux
    },
  },
  methods: {
    // Méthode pour obtenir les données météo en fonction des coordonnées (latitude, longitude) et du type de météo (départ ou arrivée)
    async getWeather(lat, lon, meteoType) {
      try {
        const date = new Date().toISOString().split("T")[0]; // Obtient la date actuelle au format YYYY-MM-DD
        const weatherData = await openMeteoService.getWeather(lat, lon, date); // Appelle le service pour obtenir les données météo
        const now = new Date();
        let closestTimeIndex = 0;
        let closestTimeDiff = Infinity;

        // Trouve l'heure la plus proche de l'heure actuelle
        for (let i = 0; i < weatherData.hourly.time.length; i++) {
          const weatherTime = new Date(weatherData.hourly.time[i]);
          const timeDiff = Math.abs(weatherTime - now);

          if (timeDiff < closestTimeDiff) {
            closestTimeDiff = timeDiff;
            closestTimeIndex = i;
          }
        }

        const weatherCode = weatherData.hourly.weathercode[closestTimeIndex]; // Code météo pour l'heure la plus proche
        const weatherDescription = this.getWeatherDescription(weatherCode); // Description météo correspondante
        this[meteoType] = {
          temperature: weatherData.hourly.temperature_2m[closestTimeIndex], // Température à l'heure la plus proche
          precipitation: weatherData.hourly.precipitation[closestTimeIndex], // Précipitation à l'heure la plus proche
          weatherDescription: weatherDescription, // Description météo à l'heure la plus proche
        };

        // Extraire les prévisions pour les 5 prochaines heures
        if (meteoType === "meteoTo") {
          this.next5HoursForecast = this.extractNext5HoursForecast(
            weatherData.hourly,
            closestTimeIndex
          );
        } else if (meteoType === "meteoFrom") {
          this.next5HoursForecastFrom = this.extractNext5HoursForecast(
            weatherData.hourly,
            closestTimeIndex
          );
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données météo :", error); // Gestion des erreurs
      }
    },
    // Méthode pour extraire les prévisions des 5 prochaines heures à partir des données horaires
    extractNext5HoursForecast(hourlyData, startIndex) {
      const next5Hours = [];
      for (let i = 0; i < 5; i++) {
        const index = startIndex + i;
        if (index >= hourlyData.time.length) break;
        next5Hours.push({
          time: new Date(hourlyData.time[index]).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }), // Formatage de l'heure
          temperature: hourlyData.temperature_2m[index], // Température pour l'heure
          weatherDescription: this.getWeatherDescription(
            hourlyData.weathercode[index]
          ), // Description météo pour l'heure
          precipitation: hourlyData.precipitation[index], // Précipitation pour l'heure
        });
      }
      return next5Hours;
    },
    // Méthode pour obtenir une description de la météo en fonction du code météo
    getWeatherDescription(weatherCode) {
      const weatherCodes = {
        0: "Ensoleillé",
        1: "Ensoleillé",
        2: "Nuageux",
        3: "Nuageux",
        45: "Brouillard",
        48: "Brouillard",
        51: "Bruine",
        53: "Bruine",
        55: "Bruine",
        56: "Bruine",
        57: "Bruine",
        61: "Pluie",
        63: "Pluie",
        65: "Pluie",
        66: "Verglas",
        67: "Verglas",
        71: "Neige",
        73: "Neige",
        75: "Neige",
        77: "Neige",
        80: "Pluie",
        81: "Pluie",
        82: "Pluie",
        85: "Pluie",
        86: "Pluie",
        95: "Orage",
        96: "Orage",
        99: "Orage",
      };

      return weatherCodes[weatherCode] || "Code météo inconnu"; // Retourne la description ou "Code météo inconnu"
    },
    // Méthode pour obtenir l'icône correspondant à la description de la météo
    getWeatherIcon(weatherDescription) {
      return (
        iconClasses[weatherDescription] || iconClasses["Code météo inconnu"]
      ); // Retourne les détails de l'icône ou les détails pour les conditions inconnues
    },
    // Méthode pour obtenir le dégradé de fond correspondant à la description de la météo
    getWeatherGradient(weatherDescription) {
      return (
        iconClasses[weatherDescription] || iconClasses["Code météo inconnu"]
      ).gradient; // Retourne le dégradé de fond ou le dégradé pour les conditions inconnues
    },
    // Méthode pour obtenir la couleur du texte correspondant à la description de la météo
    getWeatherTextColor(weatherDescription) {
      return (
        iconClasses[weatherDescription] || iconClasses["Code météo inconnu"]
      ).textColor; // Retourne la couleur du texte ou la couleur pour les conditions inconnues
    },
  },
};
</script>

<style scoped>
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css");

.meteo-btn {
  background-image: linear-gradient(
    to right,
    #36d1dc 0%,
    #5b86e5 51%,
    #36d1dc 100%
  );
  transition: 0.5s;
  background-size: 200% auto;
  color: white;
}

.forecast-container {
  border-radius: 10px;
  transition: 0.5s;
  background-size: 200% auto;
  display: flex;
  justify-content: space-between;
}

.forecast-column {
  text-align: center;
  flex: 1;
  background-color: #f9f9f9;
}

.forecast-time {
  font-weight: bold;
}

.forecast-icon {
  font-size: 19px;
}

legend {
  font-weight: bold;
}
</style>
