import axios from 'axios';

// Définition de l'URL de base de l'API Open-Meteo pour les prévisions météorologiques.
const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

const openMeteoService = {
  // Permet de récupérer les données météorologiques pour un emplacement spécifique (latitude et longitude) à une date donnée.
  async getWeather(lat, lon, date) {
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          latitude: lat,          // Latitude de l'emplacement pour la météo
          longitude: lon,         // Longitude de l'emplacement pour la météo
          hourly: 'temperature_2m,precipitation,weathercode', // Paramètres pour récupérer la température, les précipitations et le code météo
          start: date,            // Date de début pour les prévisions (généralement le même jour)
          end: date,              // Date de fin pour les prévisions (généralement le même jour)
        },
      });
      return response.data;       // Retourne les données météo reçues de l'API
    } catch (error) {
      console.error('Erreur lors de la récupération des données météo :', error); // Affiche une erreur en cas d'échec
      throw error;                // Propage l'erreur pour qu'elle puisse être gérée ailleurs
    }
  },
};

export default openMeteoService; // Exportation du service pour utilisation dans d'autres parties de l'application.
