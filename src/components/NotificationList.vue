<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    location="bottom"
  >
    <template v-slot:activator="{ props }">
      <v-btn class="notification-button" v-bind="props">
        <v-badge
          v-if="notifications.length > 0"
          :content="unreadCount"
          dot
          color="red"
          overlap
        >
          <v-icon>mdi-bell</v-icon>
        </v-badge>
        <v-icon v-else>mdi-bell</v-icon>
      </v-btn>
    </template>

    <v-card>
      <v-card-title> Notifications </v-card-title>
      <v-list>
        <v-list-item
          v-for="(notification, index) in notifications"
          :key="index"
        >
            {{ notification.body }}
            <template v-slot:append>
              <v-btn icon="mdi-close" variant="text" @click="markAsRead(index)">
              </v-btn>
            </template>
        </v-list-item>
        <v-list-item v-if="notifications.length == 0">
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
export default {
  data: () => ({
    menu: false,
    notifications: [
      {
        body: "Beau temps sur Paris",
        read: false,
      },
      {
        body: "Début du festival de musique à Chartres",
        read: false,
      },
      {
        body: "Météo ensoleillé pour ce week-end sur la côte d'azur",
        read: false,
      },
    ],
  }),
  methods: {
    markAsRead(index) {
      this.notifications.splice(index, 1);
    },
  },
};
</script>

<style>
/* Ajoutez ici les styles spécifiques si nécessaire */
.notification-button {
  background: linear-gradient(115deg, #4faaf5 0%, #1f30c9 100%) !important;
  color: white;
}
</style>
