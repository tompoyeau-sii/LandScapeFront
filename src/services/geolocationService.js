// Définition du service de géolocalisation
const geolocationService = {
    // Objectif : Obtenir la position géographique actuelle de l'utilisateur
    getCurrentPosition() {
        // Renvoie une promesse qui résout avec la position actuelle de l'utilisateur ou rejette en cas d'erreur
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });
    }
};

export default geolocationService; 
// Exportation du service de géolocalisation pour qu'il puisse être utilisé dans d'autres parties de l'application.
