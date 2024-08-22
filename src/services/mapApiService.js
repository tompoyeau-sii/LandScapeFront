import axios from 'axios';

const API_URL = 'https://api-adresse.data.gouv.fr/';

const mapApiService = {
    // Permet de rechercher une localisation avec une adresse
    async searchLocation(query) {
        try {
            const response = await axios.get(`${API_URL}search/`, {
                params: {
                    q: query,
                    limit: 5, // Limite le nombre de résultats (paramètre optionnel)
                }
            });
            return response.data.features.map(feature => ({
                label: feature.properties.label,
                coordinates: feature.geometry.coordinates
            }));
        } catch (error) {
            console.error('Erreur lors de la recherche de l\'emplacement:', error);
            throw error;
        }
    },

    // Permet de récupérer les coordonnées d'une adresse
    async getCoordinates(location) {
        try {
            const response = await axios.get(`${API_URL}search/`, {
                params: {
                    q: location,
                    limit: 1 // On récupère uniquement le premier résultat
                }
            });
            if (response.data.features && response.data.features.length > 0) {
                console.log(response.data)
                const [lng, lat] = response.data.features[0].geometry.coordinates;
                return { lat: parseFloat(lat), lng: parseFloat(lng) };
            } else {
                throw new Error('Lieu non trouvé');
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des coordonnées:', error);
            throw error;
        }
    },

    // Permet de récupérer une adresse à partir de coordonnées
    async getLocationData(lat, lng) {
        try {
            const response = await axios.get(`${API_URL}reverse/`, {
                params: {
                    lat,
                    lon: lng
                }
            });
            const feature = response.data.features[0];
            if (feature) {
                return {
                    city: feature.properties.city || feature.properties.name,
                    latitude: parseFloat(lat),
                    longitude: parseFloat(lng)
                };
            } else {
                throw new Error('Aucune adresse trouvée pour ces coordonnées');
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des données de localisation:', error);
            throw error;
        }
    }
};

export default mapApiService;
