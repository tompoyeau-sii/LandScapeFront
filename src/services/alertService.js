// services/notificationService.js
import { reactive } from 'vue';

const notificationState = reactive({
    snackbar: false,
    snackbarText: '',
    snackbarColor: '',
    snackbarIcon: '',
});

const NotificationService = {
    showSuccess(message) {
        this.showMessage(message, 'success', 'mdi-check-circle');
    },
    showWarning(message) {
        this.showMessage(message, 'warning', 'mdi-alert');
    },
    showError(message) {
        this.showMessage(message, 'error', 'mdi-alert-circle');
    },
    showInfo(message) {
        this.showMessage(message, 'info', 'mdi-information');
    },
    showMessage(message, color, icon) {
        notificationState.snackbarText = message;
        notificationState.snackbarColor = color;
        notificationState.snackbarIcon = icon;
        notificationState.snackbar = true;
    },
    get state() {
        return notificationState;
    },
};

export default NotificationService;
