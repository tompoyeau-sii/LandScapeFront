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
import { mapGetters } from 'vuex';
import apiService from '@/services/apiService';

export default {
  data: () => ({
    menu: false,
  }),
  computed: {
    ...mapGetters({
      currentUser: 'getUser',
    }),
    unreadNotifications() {
      return this.currentUser?.notifications?.filter(notification => !notification.isRead) ?? [];
    },
    unreadCount() {
      return this.unreadNotifications.length;
    },
  },
  methods: {
    async markAsRead(notification) {
      try {
        // Send the update to the server
        await apiService.put(`/notifications/${notification.id}`, { isRead: true });

        // Update the notification locally
        notification.isRead = true;
      } catch (error) {
        console.error('échec de la mise en lecture:', error);
      }
    },
  },
  created() {
    // console.log("Current User:", this.currentUser);
    // console.log("Notifications non lues:", this.unreadNotifications);
  }
};
</script>

<style>
.notification-button {
  background: linear-gradient(115deg, #4faaf5 0%, #1f30c9 100%) !important;
  color: white;
}
</style>
