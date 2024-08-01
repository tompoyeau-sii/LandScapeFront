<template>
    <div v-if="route">
        <v-btn @click="dialogMeteo = true">
            Météo <span class="mdi mdi-weather-partly-rainy"></span>
        </v-btn>
        <v-dialog v-model="dialogMeteo" max-width="600px">
            <v-card>
                <v-card-title>
                    {{ route }}
                </v-card-title>
                <v-card-text>
                    <div>
                        <h3 class="centered-title">Départ</h3>
                        <div class="forecast-container">
                            <div class="forecast-column" v-for="(forecast, index) in next5HoursForecastFrom"
                                :key="index">
                                <div class="forecast-time">{{ forecast.time }}</div>
                                <div class="forecast-icon">
                                    <span :class="'mdi ' + getWeatherIcon(forecast.weatherDescription)"></span>
                                </div>
                                <div class="forecast-temperature">{{ forecast.temperature }}°C</div>
                                <div class="forecast-precipitation">{{ forecast.precipitation }} mm</div>
                            </div>
                        </div>
                    </div>

                    <div style="margin-top: 20px;">
                        <h3 class="centered-title">Arrivée</h3>
                        <div class="forecast-container">
                            <div class="forecast-column" v-for="(forecast, index) in next5HoursForecast" :key="index">
                                <div class="forecast-time">{{ forecast.time }}</div>
                                <div class="forecast-icon">
                                    <span :class="'mdi ' + getWeatherIcon(forecast.weatherDescription)"></span>
                                </div>
                                <div class="forecast-temperature">{{ forecast.temperature }}°C</div>
                                <div class="forecast-precipitation">{{ forecast.precipitation }} mm</div>
                            </div>
                        </div>
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" text @click="dialogMeteo = false">Fermer</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import openMeteoService from '@/services/openMeteoService';
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
            next5HoursForecastFrom: []
        };
    },
    watch: {
        route: {
            handler(newRoute) {
                console.log(newRoute)
                if (newRoute && newRoute.length === 2) {
                    const [start, end] = newRoute;
                    console.log(newRoute[0][0], newRoute[0][1])
                    this.getWeather(newRoute[0][0], newRoute[0][1], "meteoFrom");
                    this.getWeather(newRoute[1][0], newRoute[1][1], "meteoTo");

                }
            },
            deep: true
        }
    },
    methods: {
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
                    weatherDescription: weatherDescription
                };
                if (meteoType === "meteoTo") {
                    console.log("test")
                    this.next5HoursForecast = this.extractNext5HoursForecast(weatherData.hourly, closestTimeIndex);
                    console.log(next5HoursForecast)
                } else if (meteoType === "meteoFrom") {
                    this.next5HoursForecastFrom = this.extractNext5HoursForecast(weatherData.hourly, closestTimeIndex);
                    console.log(next5HoursForecastFrom)
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des données météo :', error);
            }
        },
        extractNext5HoursForecast(hourlyData, startIndex) {
            const next5Hours = [];
            for (let i = 0; i < 5; i++) {
                const index = startIndex + i;
                if (index >= hourlyData.time.length) break;
                next5Hours.push({
                    time: new Date(hourlyData.time[index]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    temperature: hourlyData.temperature_2m[index],
                    weatherDescription: this.getWeatherDescription(hourlyData.weathercode[index]),
                    precipitation: hourlyData.precipitation[index]
                });
            }
            return next5Hours;
        },
        getWeatherDescription(weatherCode) {
            const weatherCodes = {
                0: 'Ensoleillé',
                1: 'Ensoleillé',
                2: 'Nuageux',
                3: 'Nuageux',
                45: 'Brouillard',
                48: 'Brouillard',
                51: 'Bruine',
                53: 'Bruine',
                55: 'Bruine',
                56: 'Bruine',
                57: 'Bruine',
                61: 'Pluie',
                63: 'Pluie',
                65: 'Pluie',
                66: 'Verglas',
                67: 'Verglas',
                71: 'Neige',
                73: 'Neige',
                75: 'Neige',
                77: 'Neige',
                80: 'Pluie',
                81: 'Pluie',
                82: 'Pluie',
                85: 'Pluie',
                86: 'Pluie',
                95: 'Orage',
                96: 'Orage',
                99: 'Orage',
            };

            return weatherCodes[weatherCode] || 'Code météo inconnu';
        },
        getWeatherIcon(weatherDescription) {
            const iconClasses = {
                'Ensoleillé': 'mdi-white-balance-sunny',
                'Nuageux': 'mdi-cloud-outline',
                'Brouillard': 'mdi-weather-fog',
                'Bruine': 'mdi-weather-rainy',
                'Pluie': 'mdi-weather-pouring',
                'Verglas': 'mdi-weather-snowy-rainy',
                'Neige': 'mdi-weather-snowy',
                'Orage': 'mdi-weather-lightning',
                'Code météo inconnu': 'mdi-help-circle-outline'
            };

            return iconClasses[weatherDescription] || 'mdi-help-circle-outline';
        },
    }
}
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

.forecast-container {
  margin-top: 1vh;
  background-color: #fafafa;
  border-radius: 10px;
  padding: 1vh;
}

.remove-button i {
  pointer-events: none;
}

.remove-button:hover {
  background-color: #f0f0f0;
}
.input-container {
  display: flex;
  flex-direction: column;
}

.input-wrapper {
  position: relative;
  margin-bottom: 1rem;
}

.searchIcon {
  position: absolute;
  top: 50%;
  left: 10px;
  transform: translateY(-50%);
}

.input-waypoint {
  padding-left: 40px;
}

.remove-button {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
}

.weather-button {
  margin-top: 10px;
}

.forecast-container {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.forecast-column {
  text-align: center;
  flex: 1;
  padding: 5px;
  background-color: #f9f9f9;
  border-radius: 5px;
}

.forecast-time {
  font-weight: bold;
  margin-bottom: 5px;
}

.forecast-icon {
  font-size: 24px;
  margin-bottom: 5px;
}

.forecast-temperature,
.forecast-precipitation {
  margin-bottom: 5px;
}

.centered-title {
  text-align: center;
}
</style>