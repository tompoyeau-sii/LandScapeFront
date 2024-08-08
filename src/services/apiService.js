import NotificationService from "@/services/alertService.js"; 
const API_BASE_URL = 'http://localhost:8080/api';

const apiService = {
    async get(endpoint) {
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
            throw error; // Propager l'erreur pour une gestion ultérieure
        }
    },

    async post(endpoint, data) {
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
            throw error; // Propager l'erreur pour une gestion ultérieure
        }
    },

    async put(endpoint, data) {
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
            throw error; // Propager l'erreur pour une gestion ultérieure
        }
    },

    async delete(endpoint) {
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
            throw error; // Propager l'erreur pour une gestion ultérieure
        }
    }
};

export default apiService;
