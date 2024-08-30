<template>
  <v-card class="toolbar">
    <v-layout>
      <v-navigation-drawer
        v-model="drawer"
        permanent
      >
        <v-list-item @click="goBack" prepend-icon="mdi-arrow-left" title="Retour à LandS'Cap"></v-list-item>

        <v-divider></v-divider>

        <v-list density="compact" nav>
          <v-list-item @click="navigateTo('users')" prepend-icon="mdi-account-group" title="Utilisateurs"></v-list-item>
          <v-list-item @click="navigateTo('hobbies')" prepend-icon="mdi-drama-masks" title="Hobbies"></v-list-item>
        </v-list>
      </v-navigation-drawer>
    </v-layout>
  </v-card>
</template>

<script>
export default {
  data () {
    return {
      // La propriété 'drawer' contrôle l'état ouvert/fermé du tiroir de navigation
      drawer: true,
    }
  },
  methods: {
    // Méthode pour naviguer vers une vue spécifique dans la section d'administration
    navigateTo(view) {
      // Utilise le router Vue pour pousser une nouvelle route basée sur l'argument 'view'
      this.$router.push(`/administration/${view}`);
    },
    // Méthode pour retourner à la page d'accueil
    goBack() {
      // Utilise le router Vue pour retourner à la route racine ('/')
      this.$router.push('/');
    }
  }
}
</script>

<style>
.toolbar {
  z-index: 10;
}
</style>
