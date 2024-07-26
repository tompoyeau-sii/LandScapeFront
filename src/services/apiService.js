import NotificationService from "@/services/notificationService.js"; 
const API_BASE_URL = 'http://localhost:8080/api';

const apiService = {
    async get(endpoint) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(`admin:admin`)
            },
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        return await response.json();
    },

    async post(endpoint, data) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(`admin:admin`)
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json()
        if (!response.ok) {
            console.log(result)
            NotificationService.showError(result.message);
            return ;
        }

        NotificationService.showSuccess(result.message);
        return result;
    },

    async put(endpoint, data) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(`admin:admin`)
            },
            body: JSON.stringify(data)
        });

        const result = await response.json()
        if (!response.ok) {
            NotificationService.showError(result.message);
            return;
        }

        return result;
    },

    async delete(endpoint) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(`admin:admin`)
            }
        });

        const result = await response.json()
        if (!response.ok) {
            NotificationService.showError(result.message);
            return;
        }

        NotificationService.showSuccess(result.message);
        return result;
    }
};

export default apiService;
