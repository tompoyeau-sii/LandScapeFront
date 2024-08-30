// services/notificationService.js
import { reactive } from 'vue';

// Définition de l'état réactif pour gérer l'affichage des notifications (snackbar)
const notificationState = reactive({
    snackbar: false,         // Indique si la snackbar est visible ou non
    snackbarText: '',         // Texte affiché dans la snackbar
    snackbarColor: '',        // Couleur de la snackbar (dépend de la nature de la notification)
    snackbarIcon: '',         // Icône affichée dans la snackbar (dépend de la nature de la notification)
});

const NotificationService = {
    // Objectif : Afficher une notification de succès
    showSuccess(message) {
        this.showMessage(message, 'success', 'mdi-check-circle');
    },
    
    // Objectif : Afficher une notification d'avertissement
    showWarning(message) {
        this.showMessage(message, 'warning', 'mdi-alert');
    },
    
    // Objectif : Afficher une notification d'erreur
    showError(message) {
        this.showMessage(message, 'error', 'mdi-alert-circle');
    },
    
    // Objectif : Afficher une notification d'information
    showInfo(message) {
        this.showMessage(message, 'info', 'mdi-information');
    },

    // Objectif : Afficher une notification personnalisée avec un message, une couleur et une icône spécifiques
    showMessage(message, color, icon) {
        notificationState.snackbarText = message;  // Définir le texte de la snackbar
        notificationState.snackbarColor = color;   // Définir la couleur de la snackbar
        notificationState.snackbarIcon = icon;     // Définir l'icône de la snackbar
        notificationState.snackbar = true;         // Rendre la snackbar visible
    },

    // Objectif : Obtenir l'état actuel des notifications
    get state() {
        return notificationState;
    },
};

export default NotificationService; 
// Exportation du service de notification pour qu'il puisse être utilisé dans d'autres parties de l'application.
