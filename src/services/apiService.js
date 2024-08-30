import NotificationService from "@/services/alertService.js"; 
const API_BASE_URL = 'http://localhost:8080/api';

const apiService = {
    async get(endpoint) {
        // Objectif : Récupérer des données depuis l'API via une requête GET.
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + btoa(`admin:admin`)
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(error);
            NotificationService.showError(error.message || "Une erreur s'est produite lors de la récupération des données.");
            throw error;
        }
    },

    async post(endpoint, data) {
        // Objectif : Envoyer des données à l'API via une requête POST.
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + btoa(`admin:admin`)
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (!response.ok) {
                NotificationService.showError(result.message);
                throw new Error(result.message);
            }

            NotificationService.showSuccess(result.message);
            return result;
        } catch (error) {
            console.error(error);
            NotificationService.showError(error.message || "Une erreur s'est produite lors de l'envoi des données.");
            throw error;
        }
    },

    async put(endpoint, data) {
        // Objectif : Mettre à jour des données sur l'API via une requête PUT.
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + btoa(`admin:admin`)
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (!response.ok) {
                NotificationService.showError(result.message);
                throw new Error(result.message);
            }

            NotificationService.showSuccess(result.message);
            return result;
        } catch (error) {
            console.error(error);
            NotificationService.showError(error.message || "Une erreur s'est produite lors de la mise à jour des données.");
            throw error;
        }
    },

    async delete(endpoint) {
        // Objectif : Supprimer des données sur l'API via une requête DELETE.
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + btoa(`admin:admin`)
                }
            });

            const result = await response.json();
            if (!response.ok) {
                NotificationService.showError(result.message);
                throw new Error(result.message);
            }

            NotificationService.showSuccess(result.message);
            return result;
        } catch (error) {
            console.error(error);
            NotificationService.showError(error.message || "Une erreur s'est produite lors de la suppression des données.");
            throw error;
        }
    }
};

export default apiService;
// Exportation de l'objet `apiService` pour qu'il puisse être utilisé dans d'autres parties de l'application.
