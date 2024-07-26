import axios from 'axios';

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

const openMeteoService = {
  async getWeather(lat, lon, date) {
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          latitude: lat,
          longitude: lon,
          hourly: 'temperature_2m,precipitation,weathercode',
          start: date, // Date de début
          end: date,   // Date de fin
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des données météo :', error);
      throw error;
    }
  },
};

export default openMeteoService;
