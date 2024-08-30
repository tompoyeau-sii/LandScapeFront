<template>
  <v-menu v-model="menu" :close-on-content-click="false" location="bottom" width="600px">
    <template v-slot:activator="{ props }">
      <v-btn class="notification-button" v-bind="props">
        <v-badge v-if="unreadCount > 0" :content="unreadCount" dot color="red" overlap>
          <v-icon>mdi-bell</v-icon>
        </v-badge>
        <v-icon v-else>mdi-bell</v-icon>
      </v-btn>
    </template>

    <v-card>
      <v-card-title> Notifications </v-card-title>
      <v-list>
        <v-list-item v-for="(notification, index) in unreadNotifications" :key="index">
          {{ notification.message }}
          <template v-slot:append>
            <v-btn icon="mdi-close" variant="text" @click="markAsRead(notification)">
            </v-btn>
          </template>
        </v-list-item>
        <v-list-item v-if="unreadNotifications.length === 0">
          <v-list-item-content>
            <v-list-item-subtitle>
              Plus aucunes notifications
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script>
import { mapGetters } from 'vuex'; // Importation de la fonction mapGetters pour accéder aux getters Vuex
import apiService from '@/services/apiService'; // Importation du service API pour les requêtes réseau

export default {
  data: () => ({
    menu: false, // État de l'ouverture du menu (false par défaut, donc le menu est fermé)
  }),
  computed: {
    ...mapGetters({
      currentUser: 'getUser', // Utilisation de mapGetters pour mapper le getter 'getUser' de Vuex à une propriété calculée
    }),
    unreadNotifications() {
      // Calcul des notifications non lues en filtrant les notifications du utilisateur courant
      return this.currentUser?.notifications?.filter(notification => !notification.isRead) ?? [];
    },
    unreadCount() {
      // Calcul du nombre de notifications non lues
      return this.unreadNotifications.length;
    },
  },
  methods: {
    async markAsRead(notification) {
      try {
        // Envoi de la mise à jour au serveur pour marquer la notification comme lue
        await apiService.put(`/notifications/${notification.id}`, { isRead: true });

        // Mise à jour locale de la notification pour qu'elle soit marquée comme lue
        notification.isRead = true;
      } catch (error) {
        console.error('échec de la mise en lecture:', error); // Gestion des erreurs en cas d'échec de la mise à jour
      }
    },
  },
};
</script>

<style>
.notification-button {
  background: linear-gradient(115deg, #4faaf5 0%, #1f30c9 100%) !important;
  color: white;
}
</style>
