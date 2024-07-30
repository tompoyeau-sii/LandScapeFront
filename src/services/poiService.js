import axios from 'axios';

const API_URL = 'http://overpass-api.de/api/interpreter';

const poiService = {
    getPOI: async (latitude, longitude) => {
        try {
            // Construire la requête Overpass QL pour obtenir les points d'intérêt à proximité
            const overpassQuery = `
                [out:json];
                (
                    node(around:1000, ${latitude}, ${longitude})["tourism"];
                );
                out body;
                >;
                out skel qt;
            `;

            // Faire la requête POST à l'API Overpass
            const response = await axios.post(API_URL, `data=${encodeURIComponent(overpassQuery)}`, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            // Retourner les données JSON
            return response.data.elements;
        } catch (error) {
            console.error('Erreur lors de la récupération des points d\'intérêt:', error);
            throw error;
        }
    }
};

export default poiService;
