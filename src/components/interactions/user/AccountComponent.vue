<template>
  <v-menu>
    <template v-slot:activator="{ props }">
      <v-btn
        prepend-icon="mdi-account"
        v-bind="props"
        class="account-button text-capitalize"
      >
        {{ currentUser.firstName }} {{ currentUser.name }}
      </v-btn>
    </template>

    <v-list>
      <v-list-item @click="goToProfile">
        <template v-slot:prepend>
          <v-icon icon="mdi-account"></v-icon>
        </template>
        <v-list-item-title>Profil</v-list-item-title>
      </v-list-item>
      <v-list-item v-if="currentUser.right.id == 2" @click="goToAdministration">
        <template v-slot:prepend>
          <v-icon icon="mdi-cog"></v-icon>
        </template>
        <v-list-item-title>Administration</v-list-item-title>
      </v-list-item>
      <v-list-item v-if="currentUser.right.id == 3" @click="goToCompany">
        <template v-slot:prepend>
          <v-icon icon="mdi-office-building"></v-icon>
        </template>
        <v-list-item-title>Mon entreprise</v-list-item-title>
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
import { mapActions, mapGetters } from "vuex";

export default {
  methods: {
    // Les actions du store Vuex sont mappées ici
    ...mapActions(["logout"]),
    
    // Méthode pour naviguer vers la vue de profil
    goToProfile() {
      // Utilise le routeur pour naviguer vers la route nommée "AccountView"
      this.$router.push({ name: "AccountView" });
    },

    // Méthode pour naviguer vers la page d'administration
    goToAdministration() {
      // Utilise le routeur pour naviguer vers la route "/administration/users"
      this.$router.push("/administration/users");
    },

    // Méthode pour naviguer vers la page de l'entreprise
    goToCompany() {
      // Utilise le routeur pour naviguer vers la route "/ael/entreprises"
      this.$router.push("/ael/entreprises");
    },

    // Méthode pour gérer la déconnexion
    async handleLogout() {
      // Appelle l'action 'logout' pour déconnecter l'utilisateur
      await this.logout();
    },
  },
  computed: {
    // Les getters du store Vuex sont mappés ici
    ...mapGetters({
      // Accède à l'utilisateur courant via le getter 'getUser'
      currentUser: "getUser",
    }),
  },
};
</script>


<style scoped>
.account-button {
  background: linear-gradient(115deg, #4faaf5 0%, #1f30c9 100%) !important;
  color: white;
}
</style>
