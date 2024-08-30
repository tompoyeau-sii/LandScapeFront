<template>
  <v-card class="toolbar">
    <v-layout>
      <v-navigation-drawer v-model="drawer" permanent>
        <v-list-item
          @click="goBack"
          prepend-icon="mdi-arrow-left"
          title="Retour à LandS'Cap"
        ></v-list-item>

        <v-divider></v-divider>

        <v-list density="compact" nav>
          <v-list-item
            @click="navigateTo('entreprises')"
            prepend-icon="mdi-account-group"
            title="Entreprise"
          ></v-list-item>
        </v-list>
      </v-navigation-drawer>
    </v-layout>
  </v-card>
</template>

<script>
export default {
  data() {
    return {
      // Déclaration de la donnée 'drawer' pour contrôler l'état du tiroir de navigation
      drawer: true,  // Le tiroir est ouvert par défaut
    };
  },
  methods: {
    // Méthode pour naviguer vers une vue spécifique
    navigateTo(view) {
      // Change la route en ajoutant '/ael/{view}' à l'URL
      this.$router.push(`/ael/${view}`);
    },
    // Méthode pour revenir à la page d'accueil
    goBack() {
      // Change la route pour revenir à la page d'accueil ('/')
      this.$router.push("/");
    },
  },
};
</script>


<style>
.toolbar {
  z-index: 10;
}
</style>
