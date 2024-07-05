<template>
    <v-menu>
      <template v-slot:activator="{ props }">
        <v-btn prepend-icon="mdi-account" v-bind="props" class="account-button">
          Karine LeFort
        </v-btn>
      </template>

      <v-list>
        <v-list-item @click="goToProfile">
          <template v-slot:prepend>
            <v-icon icon="mdi-account"></v-icon>
          </template>
          <v-list-item-title>Profil</v-list-item-title>
        </v-list-item>
        <v-list-item @click="handleLogout">
          <template v-slot:prepend>
            <v-icon icon="mdi-logout"></v-icon>
          </template>
          <v-list-item-title>Déconnexion</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
</template>

<script>
import { mapActions } from "vuex";

export default {
  methods: {
    ...mapActions(["logout"]),
    goToProfile() {
      this.$router.push({ name: "AccountView" });
    },
    async handleLogout() {
      await this.logout();
    },
  },
};
</script>

<style scoped>
.account-button {
  background: linear-gradient(115deg, #4faaf5 0%, #1f30c9 100%) !important;
  color: white;
}
</style>
