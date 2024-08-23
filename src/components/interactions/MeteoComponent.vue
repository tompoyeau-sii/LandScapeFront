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
import openMeteoService from "@/services/openMeteoService";

const iconClasses = {
  Ensoleillé: {
    icon: "mdi-white-balance-sunny",
    gradient:
      "linear-gradient(56deg, rgba(255,245,91,1) 0%, rgba(255,199,95,1) 100%)",
    textColor: "#000000",
  }, // Or à Orange, texte noir
  Nuageux: {
    icon: "mdi-cloud-outline",
    gradient:
      "linear-gradient(56deg, rgba(176,196,222,1) 0%, rgba(214,210,210,1) 100%)",
    textColor: "#000000",
  }, // Bleu clair à Gris, texte noir
  Brouillard: {
    icon: "mdi-weather-fog",
    gradient: "linear-gradient(to right, #A9A9A9, #696969)",
    textColor: "#FFFFFF",
  }, // Gris à Gris foncé, texte blanc
  Bruine: {
    icon: "mdi-weather-rainy",
    gradient: "linear-gradient(to right, #87CEEB, #4682B4)",
    textColor: "#000000",
  }, // Bleu ciel à Bleu acier, texte noir
  Pluie: {
    icon: "mdi-weather-pouring",
    gradient:
      "linear-gradient(56deg, rgba(30,144,255,1) 0%, rgba(115,191,255,1) 100%)",
    textColor: "#FFFFFF",
  }, // Bleu acier à Bleu dodger, texte blanc
  Verglas: {
    icon: "mdi-weather-snowy-rainy",
    gradient: "linear-gradient(to right, #B0E0E6, #ADD8E6)",
    textColor: "#000000",
  }, // Bleu poudre à Bleu clair, texte noir
  Neige: {
    icon: "mdi-weather-snowy",
    gradient: "linear-gradient(to right, #FFFFFF, #E0FFFF)",
    textColor: "#000000",
  }, // Blanc à Azur, texte noir
  Orage: {
    icon: "mdi-weather-lightning",
    gradient: "linear-gradient(to right, #FFA500, #FF4500)",
    textColor: "#000000",
  }, // Orange à Rouge orange, texte noir
  "Code météo inconnu": {
    icon: "mdi-help-circle-outline",
    gradient: "linear-gradient(to right, #808080, #A9A9A9)",
    textColor: "#FFFFFF",
  }, // Gris à Gris foncé, texte blanc
};

export default {
  props: {
    route: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      dialogMeteo: false,
      meteoFrom: null,
      meteoTo: null,
      next5HoursForecast: [],
      next5HoursForecastFrom: [],
    };
  },
  watch: {
    route: {
      handler(newRoute) {
        console.log(newRoute);
        if (newRoute && newRoute.length === 2) {
          const [start, end] = newRoute;
          this.getWeather(start[0], start[1], "meteoFrom");
          this.getWeather(end[0], end[1], "meteoTo");
        }
      },
      deep: true,
    },
  },
  methods: {
    async getWeather(lat, lon, meteoType) {
      try {
        const date = new Date().toISOString().split("T")[0];
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
          weatherDescription: weatherDescription,
        };
        if (meteoType === "meteoTo") {
          console.log("test");
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
        console.error(
          "Erreur lors de la récupération des données météo :",
          error
        );
      }
    },
    extractNext5HoursForecast(hourlyData, startIndex) {
      const next5Hours = [];
      for (let i = 0; i < 5; i++) {
        const index = startIndex + i;
        if (index >= hourlyData.time.length) break;
        next5Hours.push({
          time: new Date(hourlyData.time[index]).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          temperature: hourlyData.temperature_2m[index],
          weatherDescription: this.getWeatherDescription(
            hourlyData.weathercode[index]
          ),
          precipitation: hourlyData.precipitation[index],
        });
      }
      return next5Hours;
    },
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

      return weatherCodes[weatherCode] || "Code météo inconnu";
    },
    getWeatherIcon(weatherDescription) {
      return (
        iconClasses[weatherDescription] || iconClasses["Code météo inconnu"]
      );
    },
    getWeatherGradient(weatherDescription) {
      return (
        iconClasses[weatherDescription] || iconClasses["Code météo inconnu"]
      ).gradient;
    },
    getWeatherTextColor(weatherDescription) {
      return (
        iconClasses[weatherDescription] || iconClasses["Code météo inconnu"]
      ).textColor;
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
